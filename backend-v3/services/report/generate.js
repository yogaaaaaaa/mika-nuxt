'use strict'

const path = require('path')
const puppeteer = require('puppeteer')
const excel = require('exceljs')
const base64img = require('base64-img')

const trxManager = require('../../libs/trxManager')
const time = require('../../libs/time')
const format = require('../../libs/format')
const template = require('../../libs/template')
const models = require('../../models')
const Sequelize = models.Sequelize
const Op = Sequelize.Op

const mailer = require('../../libs/mailer')
const dir = require('../../libs/dir')

const dirConfig = require('../../configs/dirConfig')

let browser = null

function getImageBase64 (path) {
  return new Promise((resolve, reject) => {
    base64img.base64(
      path,
      (err, data) => err ? reject(err) : resolve(data))
  })
}

async function getBrowser () {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })
  }
  return browser
}

module.exports.checkMerchantStaffId = async (merchantStaffId) => {
  return models.merchantStaff.scope('id').findByPk(merchantStaffId)
}

module.exports.createMerchantStaffDailyReport = async (merchantStaffId, options) => {
  const merchantStaff = await models.merchantStaff.findOne({
    where: {
      id: merchantStaffId
    },
    include: [models.merchant]
  })

  options = Object.assign({
    date: new Date().toISOString(),
    email: merchantStaff.email,
    utcOffset: '+0700',
    locale: 'id'
  }, options)

  const utcOffsetMinutes = time.utcOffsetToMinutes(options.utcOffset)
  const creationTimestamp = Date.now()
  const creationMoment = time.moment.unix(creationTimestamp / 1000).utcOffset(options.utcOffset)
  const startMoment = time.moment(options.date).utcOffset(options.utcOffset).startOf('day')
  let endMoment = time.moment(options.date).utcOffset(options.utcOffset).endOf('day')

  if (endMoment.unix() > creationMoment.unix()) {
    endMoment = creationMoment
  }

  const reportWorkDir = await dir.createCacheDir(`merchantStaffReport-${creationTimestamp}-${merchantStaffId}`)
  const reportTemplate = template.get('reportMerchantStaffDaily.hbs')
  const reportPdfPath = path.join(reportWorkDir, `report-${startMoment.format('DD-MMM-YYYY')}-generated-${creationMoment.format('YYYY-MM-DD-HH_mm_ss')}.pdf`)
  const reportExcelPath = path.join(reportWorkDir, `report-${startMoment.format('DD-MMM-YYYY')}-generated--${creationMoment.format('YYYY-MM-DD-HH_mm_ss')}.xlsx`)

  const commonWhere = {
    [Op.and]: [
      {
        createdAt: {
          [Op.between]: [startMoment.toDate(), endMoment.toDate()]
        }
      }
    ],
    status: {
      [Op.In]: [
        trxManager.transactionStatuses.SUCCESS,
        trxManager.transactionStatuses.REFUNDED,
        trxManager.transactionStatuses.REFUNDED_PARTIAL
      ]
    }
  }

  const transactions = await models.transaction
    .scope({ method: ['merchantStaffReport', merchantStaffId] })
    .findAll({
      order: [
        ['createdAt', 'asc']
      ],
      where: commonWhere
    })

  if (transactions.length === 0) {
    return mailer.sendMail({
      from: 'mika@getmika.id',
      to: options.email,
      subject: 'Laporan Transaksi Mika',
      text: `Laporan transaksi ${startMoment.locale(options.locale).format('DD MMMM YYYY')} - Tidak ada data transaksi`
    })
  }

  const acquirers = await models.acquirer.findAll({
    include: [models.acquirerType],
    where: {
      merchantId: merchantStaff.merchantId
    }
  })

  const acquirerTransactionStats = await models.transaction
    .scope({ method: ['merchantStaffAcquirerTransactionStats', merchantStaffId] })
    .findAll({ where: commonWhere })
    .map(transactionStatistic => transactionStatistic.toJSON())

  const outletTransactionStats = await models.transaction
    .scope({ method: ['merchantStaffReportOutletTransactionStats', merchantStaffId] })
    .findAll({
      order: [
        [Sequelize.literal('`amount`'), 'desc']
      ],
      where: commonWhere
    })
    .map(transactionStatistic => transactionStatistic.toJSON())

  const transactionCountHours = await models.transaction
    .scope({ method: ['merchantStaffTransactionTimeGroupCount', merchantStaffId] })
    .findAll({
      attributes: [
        'createdAt'
      ],
      where: commonWhere,
      group: [
        [
          Sequelize.literal(
            `HOUR(DATE_ADD(\`transaction\`.\`createdAt\`, INTERVAL ${utcOffsetMinutes} MINUTE))`
          ),
          Sequelize.literal(
            `, DATE(DATE_ADD(\`transaction\`.\`createdAt\`, INTERVAL ${utcOffsetMinutes} MINUTE))`
          )
        ]
      ]
    })
    .map(transactionCount => transactionCount.toJSON())

  const transactionStats = {
    count: 0,
    totalAmount: 0,
    totalNettAmount: 0
  }
  acquirerTransactionStats.forEach(acquirerTransactionStat => {
    transactionStats.count += parseInt(acquirerTransactionStat.transactionCount)
    transactionStats.totalAmount += acquirerTransactionStat.totalAmount
    transactionStats.totalNettAmount += acquirerTransactionStat.totalNettAmount
  })
  transactionStats.totalAmount = format.formatCurrencyIDR(transactionStats.totalAmount)
  transactionStats.totalNettAmount = format.formatCurrencyIDR(transactionStats.totalNettAmount)

  const transactionCountHoursMap = new Map()
  transactionCountHours.forEach(transactionCountHour =>
    transactionCountHoursMap.set(time.moment(transactionCountHour.createdAt).utcOffset(options.utcOffset).startOf('hour').format('HH:mm'), transactionCountHour.transactionCount)
  )
  let highestTransactionCount = 0
  let highestTransactionCountHour
  const transactionCountHourLabels = []
  const transactionCountHourValues = []
  for (const hour of time.moment.range(startMoment, endMoment).by('hour')) {
    const key = hour.format('HH:mm')
    const value = transactionCountHoursMap.get(key) || 0
    if (value > highestTransactionCount) {
      highestTransactionCountHour = key
      highestTransactionCount = value
    }
    transactionCountHourLabels.push(key)
    transactionCountHourValues.push(value)
  }

  const reportCtx = {
    mikaLogoImg: await getImageBase64(path.join(dirConfig.thumbnailsDir, 'mika.png')),
    merchantStaffName: `${merchantStaff.name} (${options.email})`,
    reportDate: startMoment.locale(options.locale).format('DD MMMM YYYY'),
    reportCreationDate: creationMoment.locale(options.locale).format('DD MMMM YYYY HH:mm:ss'),
    transactionAmount: transactionStats.totalAmount.format(),
    transactionNettAmount: transactionStats.totalNettAmount.format(),
    transactionCount: transactionStats.count,
    highestTransactionCountHour: highestTransactionCountHour,
    highestTransactionCount: highestTransactionCount,
    acquirers: await Promise.all(acquirers.map(async acquirer => {
      const acquirerStat = acquirerTransactionStats.find((acquirerTransactionStat) => acquirerTransactionStat.acquirer.id === acquirer.id) || {}
      acquirerStat.totalNettAmount = acquirerStat.totalNettAmount ? acquirerStat.totalNettAmount : '0'
      acquirerStat.totalAmount = acquirerStat.totalAmount ? acquirerStat.totalAmount : '0'
      acquirerStat.transactionCount = acquirerStat.transactionCount ? acquirerStat.transactionCount : '0'
      return {
        acquirerTypeName: acquirer.acquirerType.name,
        acquirerTypeColor: acquirer.acquirerType.chartColor,
        acquirerTypeThumbnailImg: await getImageBase64(path.join(dirConfig.thumbnailsDir, acquirer.acquirerType.thumbnail)),
        acquirerTransactionNettAmount: format.formatCurrencyIDR(acquirerStat.totalNettAmount),
        acquirerTransactionAmount: format.formatCurrencyIDR(acquirerStat.totalAmount),
        acquirerTransactionCount: acquirerStat.transactionCount
      }
    })),
    transactions: transactions.map(transaction => {
      return {
        transactionIdAlias: transaction.idAlias,
        transactionDate: time.moment(transaction.createdAt).locale(options.locale).format('DD MMM YYYY HH:mm:ss'),
        transactionOutletName: transaction.agent.outlet.name,
        transactionAcquirerTypeName: transaction.acquirer.acquirerType.name,
        transactionReferenceNum: transaction.referenceNumber,
        transactionAmount: format.formatCurrencyIDR(transaction.amount)
      }
    }),
    outlets: outletTransactionStats.map(outletTransactionStat => {
      return {
        outletName: outletTransactionStat.agent.outlet.name,
        outletTransactionAmount: format.formatCurrencyIDR(outletTransactionStat.totalAmount)
      }
    }),
    trxLineChartParam: JSON.stringify({
      type: 'line',
      data: {
        labels: transactionCountHourLabels,
        datasets: [{
          label: 'Jumlah Transaksi',
          borderColor: 'rgb(39, 162, 220)',
          data: transactionCountHourValues,
          fill: false
        }]
      },
      options: {
        devicePixelRatio: 3,
        responsive: true,
        scales: {
          xAxes: [{
            type: 'category',
            scaleLabel: {
              display: true,
              labelString: 'Jam'
            }
          }],
          yAxes: [{
            display: true,
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              display: true,
              labelString: 'Transaksi'
            }
          }]
        }
      }
    }),
    acquirerPieChartParam: JSON.stringify({
      type: 'pie',
      data: {
        // labels: acquirerTransactionStats.map(acquirerTransactionStat => acquirerTransactionStat.acquirer.acquirerType.name),
        datasets: [{
          label: '',
          data: acquirerTransactionStats.map(acquirerTransactionStat => acquirerTransactionStat.totalAmount),
          backgroundColor: acquirerTransactionStats.map(acquirerTransactionStat => acquirerTransactionStat.acquirer.acquirerType.chartColor)
        }]
      },
      options: {
        responsive: true,
        devicePixelRatio: 3,
        cutoutPercentage: 0.00000001
      }
    }),
    outletBarChartParam: JSON.stringify({
      type: 'bar',
      data: {
        labels: outletTransactionStats.map(outletTransactionStat => outletTransactionStat.agent.outlet.name),
        datasets: [{
          data: outletTransactionStats.map(outletTransactionStat => outletTransactionStat.amount),
          backgroundColor: 'rgb(39, 162, 220)',
          label: 'Volume Transaksi',
          fill: false
        }]
      },
      options: {
        devicePixelRatio: 3,
        responsive: true,
        legend: {
          position: 'top',
          labels: {
            fontSize: 10
          }
        },
        title: {
          display: true,
          text: ''
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              display: true,
              labelString: 'Volume'
            }
          }]
        }
      }
    })
  }

  const reportHtml = reportTemplate(reportCtx)

  await Promise.all([
    (async () => {
      const browser = await getBrowser()
      const page = await browser.newPage()

      await page.setViewport({
        width: 1024,
        height: 768
      })
      await page.setContent(reportHtml, { waitUntil: 'networkidle0' })
      await page.pdf({
        path: reportPdfPath,
        format: 'A4',
        margin: {
          top: '0.4in',
          right: '0.4in',
          bottom: '0.4in',
          left: '0.4in'
        }
      })

      await page.close()
    })(),
    (async () => {
      const workbook = new excel.Workbook()
      workbook.creator = 'Mika'
      workbook.created = creationMoment.toDate()
      workbook.views = [{
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: 'visible'
      }]
      const worksheet = workbook.addWorksheet('Transaksi')
      worksheet.columns = [
        { header: 'Tanggal', key: 'tanggal', width: 20 },
        { header: 'Waktu', key: 'waktu', width: 20 },
        { header: 'Outlet', key: 'outlet', width: 20 },
        { header: 'Agent', key: 'agent', width: 20 },
        { header: 'Metode', key: 'metode', width: 20 },
        { header: 'Kode Transaksi', key: 'kodeTransaksi', width: 20 },
        { header: 'Kode Pembayaran', key: 'kodePembayaran', width: 20 },
        { header: 'Jumlah', key: 'jumlah', width: 20 }
      ]
      transactions.forEach((transaction) => {
        worksheet.addRow({
          tanggal: time.moment(transaction.createdAt).locale(options.locale).format('YYYY-MM-DD'),
          waktu: time.moment(transaction.createdAt).locale(options.locale).format('HH:mm:ss'),
          outlet: transaction.agent.outlet.name,
          agent: transaction.agent.name,
          metode: transaction.acquirer.acquirerType.name,
          kodeTransaksi: transaction.idAlias,
          kodePembayaran: transaction.referenceNumber || '',
          jumlah: transaction.amount
        })
      })
      await workbook.xlsx.writeFile(reportExcelPath)
    })()
  ])

  await mailer.sendMail({
    from: 'mika@getmika.id',
    to: options.email,
    subject: 'Laporan Transaksi Mika',
    text: `Laporan transaksi ${reportCtx.reportDate}`,
    attachments: [{
      path: reportPdfPath,
      filename: path.basename(reportPdfPath),
      contentType: 'application/pdf'
    },
    {
      path: reportExcelPath,
      filename: path.basename(reportExcelPath),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }]
  })
}

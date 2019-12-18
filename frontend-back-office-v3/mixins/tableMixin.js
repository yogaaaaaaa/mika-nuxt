import { ExportToCsv } from 'export-to-csv'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      items: [],
      loading: false,
      options: {
        page: 1,
        itemsPerPage: 25,
        sortBy: ['name'],
        sortDesc: [false],
      },
      totalCount: 0,
      footerProps: {
        itemsPerPageOptions: [25, 50, 100, 250],
      },
    }
  },
  computed: {
    ...mapState([
      'filterBy',
      'operator',
      'filterValue',
      'dateFilter',
      'filterArchived',
    ]),
  },
  methods: {
    getQueries() {
      let query = '?get_count=1&'
      this.options.perPage = this.options.itemsPerPage
      this.options.orderBy = this.options.sortBy[0]
      if (this.options.sortBy[0] === 'updatedAt') {
        this.options.order = this.options.sortDesc[0] ? 'asc' : 'desc'
      } else {
        this.options.order = this.options.sortDesc[0] ? 'desc' : 'asc'
      }
      for (let key in this.options) {
        query += `${this.$changeCase.snakeCase(key)}=${this.options[key]}&`
      }
      if (this.filterBy && this.filterValue) {
        let filterValue = this.filterValue.value
          ? this.filterValue.value
          : this.filterValue
        if (this.operator === 'like') {
          filterValue = `%${filterValue}%`
          filterValue = filterValue.split(' ').join('%')
        }
        query += `f[${this.filterBy}]=${this.operator},${filterValue}&`
      }
      if (this.filterBy && this.filterArchived && this.filterArchived != null) {
        let filterArchived = this.filterArchived
          ? this.filterArchived
          : this.filterArchived
        if (this.operator === 'like') filterArchived = `%${filterArchived}%`
        query += `f[${this.filterBy}]=${this.operator}${filterArchived}&`
      }
      if (this.dateFilter && this.dateFilter.length > 0) {
        let start = this.$moment(this.dateFilter[0])
          .startOf('day')
          .toISOString()
        let end = this.$moment(this.dateFilter[1])
          .endOf('day')
          .toISOString()
        query += `f[createdAt]=gte,${start}&f[createdAt]=lte,${end}&`
      }
      return query
    },
    csvExport(title, data) {
      const options = {
        filename: title,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: true,
        showTitle: true,
        title: title,
        useBom: true,
        useKeysAsHeaders: true,
      }

      if (data.length) {
        const csvExporter = new ExportToCsv(options)
        csvExporter.generateCsv(data)
      }
    },
  },
}

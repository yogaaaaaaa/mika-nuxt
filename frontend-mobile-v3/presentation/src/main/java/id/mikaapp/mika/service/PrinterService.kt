package id.mikaapp.mika.service

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import id.mikaapp.mika.R
import id.mikaapp.mika.ext.DateFormat
import id.mikaapp.mika.ext.insertEvery
import id.mikaapp.mika.ext.showToast
import id.mikaapp.mika.ext.toString
import id.mikaapp.mika.service.PrintOperation.PrinterAlignment
import id.mikaapp.sdk.service.DeviceType
import java.util.*

class PrinterService(private val context: Context, deviceType: DeviceType) {

    private val devicePrinterService: DevicePrinterService? = when (deviceType) {
        DeviceType.Sunmi -> SunmiPrinterService(context)
        DeviceType.Verifone -> VerifonePrinterService(context)
        DeviceType.Unsupported -> null
    }

    data class ReceiptData(
        val outletName: String,
        val outletAddress: String,
        val idAlias: String,
        val date: Date,
        val acquirerTypeName: String,
        val referenceNumber: String,
        val amount: String,
        val signatureBitmap: Bitmap? = null
    )

    private val mikaIcon by lazy { BitmapFactory.decodeResource(context.resources, R.drawable.logo_print_mika) }


    fun startService() = devicePrinterService?.startService()

    fun isAvailable() = devicePrinterService?.isAvailable() ?: false

    fun printTransactionReceipt(data: ReceiptData) {
        if (!isAvailable()) {
            context.showToast("Printer is not available")
            return
        }
        devicePrinterService?.print {
            configure(bold = true, fontSize = 20f, alignment = PrinterAlignment.Center)
            bitmap(mikaIcon)
            newLine()
            text(data.outletName)
            text(data.outletAddress)
            qr(data.idAlias, 150, 150)
            text("ID Transaksi")
            text(data.idAlias.insertEvery(data.idAlias.length / 4, "-"))
            lineDivider()
            labelValue(data.date.toString(DateFormat.DayMonthYear), data.date.toString(DateFormat.HourMinuteSecond))
            lineDivider()
            labelValue("Metode Pembayaran:", data.acquirerTypeName)
            labelValue("Kode Pembayaran:", data.referenceNumber)
            lineDivider()
            labelValue("TOTAL:", data.amount)
            lineDivider()
            configure(alignment = PrinterAlignment.Center)
            data.signatureBitmap?.let {
                text("Tanda Tangan Customer:")
                newLine()
                bitmap(Bitmap.createScaledBitmap(data.signatureBitmap, 250, 100, false))
                newLine()
            }
            text("TERIMA KASIH")
            lineDivider()
            text("Gunakan QR dan eWallet untuk\npembayaran bisnis Anda\nHubungi snap@getmika.id")
        }
    }
}
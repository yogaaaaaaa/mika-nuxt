package id.mikaapp.mika.service

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Bitmap
import android.os.IBinder
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.journeyapps.barcodescanner.BarcodeEncoder
import id.mikaapp.mika.ext.ceilInt
import id.mikaapp.mika.ext.floorInt
import id.mikaapp.mika.service.PrintOperation.PrinterAlignment.Left
import id.mikaapp.mika.service.PrintOperation.PrinterAlignment.Right
import id.mikaapp.mika.utils.ESCUtil
import woyou.aidlservice.jiuiv5.ICallback
import woyou.aidlservice.jiuiv5.IWoyouService

class SunmiPrinterService(private val context: Context) : DevicePrinterService(), ServiceConnection, ICallback {
    override fun onRunResult(isSuccess: Boolean) {}
    override fun onReturnString(result: String?) {}
    override fun onRaiseException(code: Int, msg: String?) {}
    override fun asBinder(): IBinder? = null

    private var woyouService: IWoyouService? = null

    override fun onServiceDisconnected(p0: ComponentName?) {
        woyouService = null
    }

    override fun onServiceConnected(p0: ComponentName?, p1: IBinder?) {
        woyouService = IWoyouService.Stub.asInterface(p1)
        woyouService?.printerInit(this)
    }

    companion object {
        private const val SERVICE_PACKAGE = "woyou.aidlservice.jiuiv5"
        private const val SERVICE_ACTION = "woyou.aidlservice.jiuiv5.IWoyouService"
        private const val WIDTH = 37f
    }

    private val serviceIntent by lazy {
        Intent().apply {
            `package` = SERVICE_PACKAGE
            action = SERVICE_ACTION
        }
    }

    override fun startService() {
        context.applicationContext.startService(serviceIntent)
        context.applicationContext.bindService(serviceIntent, this, Context.BIND_AUTO_CREATE)
    }

    override fun isAvailable() = woyouService != null


    override fun print(block: PrintOperation.() -> Unit) {
        woyouService?.let { SunmiPrintOperation(it).block(); it.lineWrap(4, null) }
    }

    class SunmiPrintOperation(private val woyouService: IWoyouService) : PrintOperation() {

        private val multiFormatWriter = MultiFormatWriter()
        private val barcodeEncoder = BarcodeEncoder()
        override fun bitmap(bitmap: Bitmap) {
            woyouService.printBitmap(bitmap, null);newLine()
        }

        override fun text(text: String) = woyouService.printText(text + "\n", null)

        override fun newLine() = woyouService.printText("\n", null)

        override fun qr(qrContent: String, width: Int, height: Int) {
            val qrBitMatrix = multiFormatWriter.encode(qrContent, BarcodeFormat.QR_CODE, width, height)
            val qrBitmap = barcodeEncoder.createBitmap(qrBitMatrix)
            woyouService.printBitmap(qrBitmap, null)
            newLine()
        }

        override fun lineDivider() = woyouService.printText("--------------------------------------\n", null)
        override fun labelValue(label: String, value: String) {
            woyouService.printColumnsText(
                arrayOf(label, value),
                intArrayOf((WIDTH / 2f).ceilInt, (WIDTH / 2f).floorInt),
                intArrayOf(Left.ordinal, Right.ordinal),
                null
            )
        }

        override fun configure(bold: Boolean?, fontSize: Float?, alignment: PrinterAlignment?) {
            bold?.let { woyouService.sendRAWData(if (it) ESCUtil.boldOn() else ESCUtil.boldOn(), null) }
            fontSize?.let { woyouService.setFontSize(it, null) }
            alignment?.let { woyouService.setAlignment(alignment.ordinal, null) }
        }


    }
}
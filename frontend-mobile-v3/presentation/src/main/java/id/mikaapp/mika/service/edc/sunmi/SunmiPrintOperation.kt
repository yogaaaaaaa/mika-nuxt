package id.mikaapp.edcdeviceservice.sunmi

import android.graphics.Bitmap
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.journeyapps.barcodescanner.BarcodeEncoder
import id.mikaapp.edcdeviceservice.PrintOperation
import id.mikaapp.edcdeviceservice.PrinterAlignment
import id.mikaapp.mika.utils.ESCUtil
import woyou.aidlservice.jiuiv5.IWoyouService
import kotlin.math.ceil
import kotlin.math.floor

class SunmiPrintOperation(private val woyouService: IWoyouService) : PrintOperation {

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

    override fun lineDivider() =
        woyouService.printText("--------------------------------------\n", null)

    override fun labelValue(label: String, value: String) {
        woyouService.printColumnsText(
            arrayOf(label, value),
            intArrayOf((WIDTH / 2f).ceilInt, (WIDTH / 2f).floorInt),
            intArrayOf(0, 2),
            null
        )
    }

    override fun configure(bold: Boolean?, fontSize: Float?, alignment: PrinterAlignment?) {
        bold?.let { woyouService.sendRAWData(if (it) ESCUtil.boldOn() else ESCUtil.boldOn(), null) }
        fontSize?.let { woyouService.setFontSize(it, null) }
        alignment?.let { woyouService.setAlignment(alignment.ordinal, null) }
    }

    companion object {
        private const val WIDTH = 37f
    }


    private val Float.floorInt
        get() = floor(this).toInt()
    private val Float.ceilInt
        get() = ceil(this).toInt()
}
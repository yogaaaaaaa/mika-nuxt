package id.mikaapp.edcdeviceservice.verifone

import android.graphics.Bitmap
import android.os.Bundle
import android.util.Log
import com.vfi.smartpos.deviceservice.aidl.IPrinter
import id.mikaapp.edcdeviceservice.PrintOperation
import id.mikaapp.edcdeviceservice.PrinterAlignment
import java.io.ByteArrayOutputStream

class VerifonePrintOperation(private val printer: IPrinter) :
    PrintOperation {
    private val addTextFormat = Bundle().apply {
        putInt("font", 1)
    }

    override fun configure(bold: Boolean?, fontSize: Float?, alignment: PrinterAlignment?) {
        Log.d("Mika V Printer", "configure")
        alignment?.let { addTextFormat.putInt("align", it.ordinal) }
    }

    override fun bitmap(bitmap: Bitmap) {
        Log.d("Mika V Printer", "bitmap")
        val format = Bundle().apply {
            putInt("width", bitmap.width)
            putInt("height", bitmap.height)
            putInt("offset", (WIDTH / 2) - (bitmap.width / 2))
        }
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
        val image = stream.toByteArray()
        printer.addImage(format, image)
        newLine()
    }

    override fun text(text: String) {
        printer.addText(addTextFormat, text)
        newLine()
    }

    override fun newLine() {
        printer.setLineSpace(1)
    }

    override fun qr(qrContent: String, width: Int, height: Int) {
        val format = Bundle().apply {
            putInt("offset", (WIDTH / 2) - (60))
            putInt("expectedHeight", 120)
        }
        printer.addQrCode(format, qrContent)
    }

    override fun lineDivider() =
        printer.addText(addTextFormat, "--------------------------------------\n")

    override fun labelValue(label: String, value: String) {
        val format = Bundle().apply { putInt("fontSize", 1) }
        printer.addTextInLine(format, label, "", value, 0)
    }

    companion object {
        private const val WIDTH = 380
    }

}
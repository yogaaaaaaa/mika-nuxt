package id.mikaapp.edcdeviceservice

import android.graphics.Bitmap

interface PrintOperation {
    fun configure(
        bold: Boolean? = null,
        fontSize: Float? = null,
        alignment: PrinterAlignment? = null
    )

    fun bitmap(bitmap: Bitmap)
    fun text(text: String)
    fun newLine()
    fun qr(qrContent: String, width: Int, height: Int)
    fun lineDivider()
    fun labelValue(label: String, value: String)
}
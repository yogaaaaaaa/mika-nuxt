package id.mikaapp.mika.service

import android.graphics.Bitmap

abstract class PrintOperation {

    enum class PrinterAlignment {
        Left, Center, Right
    }

    abstract fun configure(bold: Boolean? = null, fontSize: Float? = null, alignment: PrinterAlignment? = null)

//            class PrintOperation(private val woyouService: IWoyouService) {

//                private val multiFormatWriter = MultiFormatWriter()
//                private val barcodeEncoder = BarcodeEncoder()
//
//                fun configure(bold: Boolean? = null, fontSize: Float? = null, alignment: PrinterAlignment? = null) {
//
//                }
//
//                fun bitmap(bitmap: Bitmap) {
//                    woyouService.printBitmap(bitmap, null);newLine()
//                }
//
//                fun text(text: String) = woyouService.printText(text + "\n", null)
//                fun newLine() = woyouService.printText("\n", null)
//                fun qr(qrContent: String, width: Int, height: Int) {
//                    val qrBitMatrix = multiFormatWriter.encode(qrContent, BarcodeFormat.QR_CODE, width, height)
//                    val qrBitmap = barcodeEncoder.createBitmap(qrBitMatrix)
//                    woyouService.printBitmap(qrBitmap, null)
//                    newLine()
//                }
//
//                fun lineDivider() = woyouService.printText("--------------------------------------\n", null)
//                fun labelValue(label: String, value: String) {
//                    woyouService.printColumnsText(
//                        arrayOf(label, value),
//                        intArrayOf((WIDTH / 2f).ceilInt, (WIDTH / 2f).floorInt),
//                        intArrayOf(Left.ordinal, Right.ordinal),
//                        null
//                    )
//                }
//            }

    abstract fun bitmap(bitmap: Bitmap)
    abstract fun text(text: String)
    abstract fun newLine()
    abstract fun qr(qrContent: String, width: Int, height: Int)
    abstract fun lineDivider()
    abstract fun labelValue(label: String, value: String)
}
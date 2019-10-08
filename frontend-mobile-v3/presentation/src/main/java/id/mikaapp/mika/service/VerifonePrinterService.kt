package id.mikaapp.mika.service

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Bitmap
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import com.vfi.smartpos.deviceservice.aidl.IDeviceService
import com.vfi.smartpos.deviceservice.aidl.IPrinter
import com.vfi.smartpos.deviceservice.aidl.PrinterListener
import java.io.ByteArrayOutputStream

class VerifonePrinterService(private val context: Context) : DevicePrinterService(), ServiceConnection {

    private var printer: IPrinter? = null

    override fun onServiceDisconnected(p0: ComponentName?) {
    }

    override fun onServiceConnected(p0: ComponentName?, p1: IBinder?) {
        printer = IDeviceService.Stub.asInterface(p1).printer
    }

    companion object {
        private const val SERVICE_PACKAGE = "com.vfi.smartpos.deviceservice"
        private const val SERVICE_ACTION = "com.vfi.smartpos.device_service"
        private const val WIDTH = 380
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

    override fun isAvailable() = printer != null

    override fun print(block: PrintOperation.() -> Unit) {
        Log.d("Mika V Printer", "print: printer: $printer")
        printer?.let {
            VerifonePrintOperation(it).block();it.feedLine(4);it.startPrint(object : PrinterListener.Stub() {
            override fun onFinish() {
                Log.d("Mika V Printer", "onFinish")
            }

            override fun onError(error: Int) {
                Log.d("Mika V Printer", "onError: $error")
            }
        })
        }
    }

    class VerifonePrintOperation(private val printer: IPrinter) : PrintOperation() {
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
            printer.addText(addTextFormat, "--------------------------------\n")

        override fun labelValue(label: String, value: String) {
            val format = Bundle().apply { putInt("fontSize", 1) }
            printer.addTextInLine(format, label, "", value, 0)
        }

    }
}
package id.mikaapp.mika.service

abstract class DevicePrinterService {
    abstract fun startService()
    abstract fun isAvailable(): Boolean
    abstract fun print(block: PrintOperation.() -> Unit)
}
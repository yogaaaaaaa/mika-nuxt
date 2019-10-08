package id.mikaapp.edcdeviceservice

sealed class ReadCardResult {
    data class Magnetic(val pan: String, val track2: String) : ReadCardResult()
    object IC : ReadCardResult()
    object NFC : ReadCardResult()
    object Timeout : ReadCardResult()
    data class Error(val code: Int, val message: String?) : ReadCardResult()
}
package id.mikaapp.edcdeviceservice

sealed class PinPadResult {
    data class Confirm(val data: ByteArray) : PinPadResult() {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Confirm

            if (!data.contentEquals(other.data)) return false

            return true
        }

        override fun hashCode(): Int {
            return data.contentHashCode()
        }
    }

    object Cancel : PinPadResult()
    data class Error(val code: Int) : PinPadResult()
}
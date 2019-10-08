package id.mikaapp.sdk.service.cardpayment

sealed class PinPadResult {
    data class Confirm(val block: ByteArray) : PinPadResult() {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Confirm

            if (!block.contentEquals(other.block)) return false

            return true
        }

        override fun hashCode(): Int {
            return block.contentHashCode()
        }
    }

    object Cancel : PinPadResult()
    data class Error(val code: Int, val message: String?) : PinPadResult()
}
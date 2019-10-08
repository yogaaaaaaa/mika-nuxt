package id.mikaapp.sdk.service.cardpayment

class CardPaymentException(val code: Int, message: String) : Exception(message) {
    override fun toString(): String {
        return "[$code] $message"
    }
}
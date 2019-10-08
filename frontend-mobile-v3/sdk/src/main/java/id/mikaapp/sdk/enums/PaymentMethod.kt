package id.mikaapp.sdk.enums

enum class PaymentMethod {
    Credit, Debit, EWallet;

    val asCardPaymentMethod
        get() : CardPaymentMethod? {
            return when (this) {
                Credit -> CardPaymentMethod.Credit
                Debit -> CardPaymentMethod.Debit
                EWallet -> null
            }
        }
}
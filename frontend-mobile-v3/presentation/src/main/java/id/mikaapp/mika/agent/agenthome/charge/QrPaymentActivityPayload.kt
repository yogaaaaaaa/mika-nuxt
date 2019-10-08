package id.mikaapp.mika.agent.agenthome.charge

data class QrPaymentActivityPayload(
    val amount: Int,
    val acquirerID: String
)
package id.mikaapp.mika.agent.agenthome.charge

import id.mikaapp.sdk.enums.CardPaymentMethod


data class CardPaymentActivityPayload(
    val amount: Int,
    val acquirerName: String,
    val cardPaymentMethod: CardPaymentMethod,
    val acquirerID: String
)

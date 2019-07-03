package id.mikaapp.mika.agent.cardpayment

import id.mikaapp.sdk.models.CardTransaction
import id.mikaapp.sdk.models.TokenTransaction

data class CardPaymentViewState(
    val showLoading: Boolean = false,
    var tokenTransaction: TokenTransaction? = null,
    var cardTransaction: CardTransaction? = null
)
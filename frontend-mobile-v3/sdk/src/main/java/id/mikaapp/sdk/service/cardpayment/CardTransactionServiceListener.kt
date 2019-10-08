package id.mikaapp.sdk.service.cardpayment

import id.mikaapp.sdk.enums.CardPaymentMethod

interface CardTransactionServiceListener {
    fun onReady()
    fun onRequestReadCardStep(proceed: (readTimeout: Int, cardTypeToRead: Array<CardType>) -> Unit)
    fun onErrorReadingCard(
        code: Int,
        message: String?,
        retry: (readTimeout: Int, cardTypeToRead: Array<CardType>) -> Unit
    )

    fun onCardAttached(cardType: CardType)
    fun onCardPanMaskedReceive(panMasked: String)
    fun onRequestStartEMVProcess(proceed: (amount: Int) -> Unit)
    fun onRequestShowPinPadStep(proceed: (timeout: Int) -> Unit, skip: (() -> Unit)?)
    fun onRequestSignature(proceed: (signatureData: String) -> Unit)
    fun onStartOnlineProcess(
        proceed: (
            acquirerID: String, amount: Int, locationLat: String?, locationLong: String?,
            cardPaymentMethod: CardPaymentMethod
        ) -> Unit
    )

    fun onTransactionResult(code: Int, message: String?)
    fun onDisconnected()
    fun onError(exception: CardPaymentException)
}
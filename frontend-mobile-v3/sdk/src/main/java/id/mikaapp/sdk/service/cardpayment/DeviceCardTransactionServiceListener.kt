package id.mikaapp.sdk.service.cardpayment

internal interface DeviceCardTransactionServiceListener {
    fun onErrorReadingCard(
        code: Int,
        message: String?,
        retry: (readTimeout: Int, cardTypeToRead: Array<CardType>) -> Unit
    )

    fun onRequestStartEMVProcess(proceed: (amount: Int, cardType: CardType) -> Unit)
    fun onRequestShowPinPadStep(proceed: (cardPan: String, timeout: Int) -> Unit, skip: (() -> Unit)? = null)
    fun onFindMagneticCardData(track2Data: String)
    fun onFindICCard(atrData: String?)
    fun onFindRFCard(atrData: String?)
    fun onEMVRequestOnlineProcess(proceed: (isSuccess: Boolean) -> Unit)
    fun onReady()
    fun onDisconnected()
    fun onCardAttached(cardType: CardType)
    fun onPinPadResult(result: PinPadResult)
    fun onError(exception: CardPaymentException)
    fun onTransactionResult(code: Int, message: String?)
    fun onRequestSignature(proceed: () -> Unit)
    fun onEMVConfirmCardNo(cardNumber: String, proceed: () -> Unit)
    fun setListener(listener: CardTransactionServiceListener?)
    fun start()
}
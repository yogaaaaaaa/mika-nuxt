package id.mikaapp.sdk.service.cardpayment

import android.annotation.SuppressLint
import android.content.Context
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.MikaCallback
import id.mikaapp.sdk.enums.CardPaymentMethod
import id.mikaapp.sdk.enums.CardTransactionServiceLifeCycle.*
import id.mikaapp.sdk.ext.log
import id.mikaapp.sdk.ext.toHexString
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.CardTransaction
import id.mikaapp.sdk.service.DeviceType
import id.mikaapp.sdk.service.cardpayment.sunmi.SunmiCardTransactionService
import id.mikaapp.sdk.service.cardpayment.verifone.VerifoneCardTransactionService

@SuppressLint("LongLogTag")
class CardTransactionService(
    context: Context,
    deviceType: DeviceType
) : DeviceCardTransactionServiceListener {
    companion object {
        private const val ERROR_SERVER_CODE = -9400

        private const val RESULT_SERVICE_NOT_INITIALIZED_CODE = -9401
        private const val RESULT_SERVICE_NOT_INITIALIZED_MESSAGE = "Card Transaction Service is not initialized"

        private const val RESULT_SERVICE_NOT_READY_CODE = -9402
        private const val RESULT_SERVICE_NOT_READY_MESSAGE = "Card Transaction Service is not ready"
    }

    private var listener: CardTransactionServiceListener? = null

    private var lifeCycle = UNINITIALIZED

    override fun setListener(listener: CardTransactionServiceListener?) {
        this.listener = listener
        when {
            deviceCardTransactionService?.isReady ?: false -> listener?.onReady()
            lifeCycle == UNINITIALIZED -> listener?.onError(
                CardPaymentException(
                    RESULT_SERVICE_NOT_INITIALIZED_CODE, RESULT_SERVICE_NOT_INITIALIZED_MESSAGE
                )
            )
            else -> listener?.onError(
                CardPaymentException(
                    RESULT_SERVICE_NOT_READY_CODE, RESULT_SERVICE_NOT_READY_MESSAGE
                )
            )
        }
    }

    private val tag = "MikaSdk CardTransactionService"
    private var currentlyAttachedCardType: CardType? = null
    private var pinBlockData: ByteArray? = null
    private var signatureData: String? = null
    private val deviceCardTransactionService: DeviceCardTransactionService? = when (deviceType) {
        DeviceType.Sunmi -> SunmiCardTransactionService(context, this)
        DeviceType.Verifone -> VerifoneCardTransactionService(context, this)
        DeviceType.Unsupported -> null
    }

    private var cardPan: String? = null
    private var track2Data: String? = null
    private var transactionID: String? = null

    init {
        log("init")
        deviceCardTransactionService?.initialize()
    }

    override fun onReady() {
        lifeCycle = READY
        listener?.onReady()
    }

    override fun start() {
        if (lifeCycle != READY) {
            listener?.onError(CardPaymentException(RESULT_SERVICE_NOT_READY_CODE, RESULT_SERVICE_NOT_READY_MESSAGE))
            return
        }
        log("start")
        lifeCycle = STARTED
        listener?.onRequestReadCardStep(
            proceed = { readTimeOut, cardTypeToRead ->
                log("onRequestReadCardStep proceed: $readTimeOut, $cardTypeToRead")
                lifeCycle = READING_CARD
                deviceCardTransactionService?.startReadCard(
                    readTimeOut,
                    cardTypeToRead
                )
            }
        )
    }

    override fun onErrorReadingCard(
        code: Int,
        message: String?,
        retry: (readTimeout: Int, cardTypeToRead: Array<CardType>) -> Unit
    ) {
        log("onErrorReadingCard: $code, $message")
        listener?.onErrorReadingCard(
            code = code,
            message = message,
            retry = { readTimeout, cardTypeToRead ->
                retry(readTimeout, cardTypeToRead)
            }
        )
    }

    override fun onCardAttached(cardType: CardType) {
        log("onCardAttached: $cardType")
        currentlyAttachedCardType = cardType
        listener?.onCardAttached(cardType)
    }

    override fun onFindMagneticCardData(track2Data: String) {
        log("onFindMagneticCardData: $track2Data")
        lifeCycle = CARD_FOUND_MAGNETIC
        this.track2Data = track2Data
        val pan = track2Data.split("=".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()[0]
        cardPan = pan
        val last4digitPAN = pan.substring(pan.length - 4)
        val first6digitPAN = pan.substring(0, 6)
        val panMasked =
            first6digitPAN.substring(0, 4) + " " + first6digitPAN.substring(4, 6) + "xx xxxx " + last4digitPAN
        listener?.onCardPanMaskedReceive(panMasked)
    }

    override fun onFindICCard(atrData: String?) {
        log("onFindICCard: $atrData")
        lifeCycle = CARD_FOUND_IC
    }

    override fun onFindRFCard(atrData: String?) {
        log("onFindRFCard: $atrData")
    }

    override fun onRequestStartEMVProcess(proceed: (amount: Int, cardType: CardType) -> Unit) {
        listener?.onRequestStartEMVProcess(
            proceed = { amount ->
                lifeCycle = EMV_STARTED
                proceed(amount, currentlyAttachedCardType!!)
            }
        )
    }

    override fun onEMVConfirmCardNo(cardNumber: String, proceed: () -> Unit) {
        log("onEMVConfirmCardNo: $cardNumber")
        lifeCycle = EMV_CONFIRM_CARD_NUMBER
        cardPan = cardNumber
        val last4digitPAN = cardNumber.substring(cardNumber.length - 4)
        val first6digitPAN = cardNumber.substring(0, 6)
        val panMasked =
            first6digitPAN.substring(0, 4) + " " + first6digitPAN.substring(4, 6) + "xx xxxx " + last4digitPAN
        listener?.onCardPanMaskedReceive(panMasked)
        proceed()
    }

    override fun onEMVRequestOnlineProcess(proceed: (isSuccess: Boolean) -> Unit) {
        lifeCycle = ONLINE_PROCESS
        log("onEMVRequestOnlineProcess: pinBlockData: $pinBlockData, signatureData: $signatureData")
        listener?.onStartOnlineProcess(
            proceed = { acquirerID, amount, locationLat, locationLong, cardPaymentMethod ->
                log("onStartOnlineProcess: proceed")
                val tlvData = deviceCardTransactionService?.getTLVDataHexString(
                    "57", "82", "95", "9A", "9C",
                    "5F2A", "5F34",
                    "9F02", "9F03", "9F10", "9F1A", "9F26", "9F27", "9F33", "9F34", "9F35", "9F36", "9F37", "9F49",
                    "8F"
                ) ?: ""
                MikaSdk.instance.createTransaction(
                    acquirerID = acquirerID,
                    amount = amount,
                    locationLat = locationLat,
                    locationLong = locationLong,
                    cardType = when (cardPaymentMethod) {
                        CardPaymentMethod.Credit -> "kredit";CardPaymentMethod.Debit -> "debit"
                    },
                    track2Data = "",
                    emvData = tlvData,
                    pinBlockData = pinBlockData?.toHexString() ?: "",
                    signatureData = signatureData ?: "",
                    callback = object : MikaCallback<CardTransaction> {
                        override fun onSuccess(response: CardTransaction) {
                            transactionID = response.transactionId
                            log("MikaCallback<CardTransaction> onSuccess: $response")
                            proceed(true)
                        }

                        override fun onFailure(errorResponse: BasicResponse) {
                            log("MikaCallback<CardTransaction> onFailure: $errorResponse")
                            proceed(false)
                        }

                        override fun onError(error: Throwable) {
                            log("MikaCallback<CardTransaction> onError: $error")
                            proceed(false)
                        }
                    }
                )
            })
    }


    override fun onRequestShowPinPadStep(proceed: (cardPan: String, timeout: Int) -> Unit, skip: (() -> Unit)?) {
        log("onRequestShowPinPadStep: cardPan: $cardPan")
        val skipCallback = {
            skip?.invoke()
            lifeCycle = SHOW_SIGNATURE
        }
        listener?.onRequestShowPinPadStep(
            proceed = { timeout ->
                lifeCycle = SHOW_PIN_PAD
                log("onRequestShowPinPadStep proceed: pan: $cardPan, timeout: $timeout")
                if (cardPan != null) {
                    proceed(cardPan!!, timeout)
                } else {
                    deviceCardTransactionService?.stopTransactionProcess(lifeCycle)
                }
            }, skip = if (currentlyAttachedCardType == CardType.IC) skipCallback else null
        )
    }

    override fun onPinPadResult(result: PinPadResult) {
        if (lifeCycle != SHOW_PIN_PAD) return
        when (result) {
            is PinPadResult.Confirm -> {
                pinBlockData = result.block
                when (currentlyAttachedCardType) {
                    CardType.Magnetic -> {
                        log("onPinPadResult (CARD: MAGNETIC): $result")
                        deviceCardTransactionService?.stopTransactionProcess(lifeCycle)
                        listener?.onStartOnlineProcess(
                            proceed = { acquirerID, amount, locationLat, locationLong, cardPaymentMethod ->
                                log(
                                    "onStartOnlineProcess proceed: acquirerID: $acquirerID, amount: $amount," +
                                            " locationLat: $locationLat, locationLong: $locationLong, " +
                                            "cardPaymentMethod: $cardPaymentMethod"
                                )
                                handleMagneticOnlineProcess(
                                    acquirerID, amount, locationLat, locationLong, cardPaymentMethod,
                                    result.block.toHexString(), track2Data!!
                                )
                            }
                        )
                    }
                    CardType.IC -> {
                        log("onPinPadResult (CARD: IC): $result")
                    }
                    CardType.NFC -> {
                        log("onPinPadResult (CARD: NFC): $result")
                    }
                    CardType.Unknown -> {
                        log("onPinPadResult (CARD: UNKNOWN): $result")
                    }
                    null -> {
                        log("onPinPadResult (CARD: NULL): $result")
                    }
                }
            }
            is PinPadResult.Cancel -> {
                if (currentlyAttachedCardType == CardType.Magnetic) {
                    lifeCycle = READY
                    track2Data = null
                    cardPan = null
                    listener?.onTransactionResult(-1, "PinPad Cancelled")
                }
            }
            is PinPadResult.Error -> {
                listener?.onError(CardPaymentException(result.code, result.message ?: "N/A"))
                if (currentlyAttachedCardType == CardType.Magnetic) {
                    lifeCycle = READY
                    track2Data = null
                    cardPan = null
                    listener?.onTransactionResult(-1, "PinPad Error")
                }
            }
        }

    }

    private fun handleMagneticOnlineProcess(
        acquirerID: String, amount: Int, locationLat: String?, locationLong: String?,
        cardPaymentMethod: CardPaymentMethod, pinBlockDataHexString: String, track2: String
    ) {
        log("Creating Magnetic Transaction to server: $cardPaymentMethod")
        MikaSdk.instance.createTransaction(
            acquirerID = acquirerID,
            amount = amount,
            locationLat = locationLat,
            locationLong = locationLong,
            cardType = when (cardPaymentMethod) {
                CardPaymentMethod.Credit -> "kredit"
                CardPaymentMethod.Debit -> "debit"
            },
            track2Data = track2,
            emvData = "",
            pinBlockData = pinBlockDataHexString,
            signatureData = "",
            callback = object : MikaCallback<CardTransaction> {
                override fun onSuccess(response: CardTransaction) {
                    log("onSuccess: $response")
                    listener?.onTransactionResult(0, response.transactionId)
                    resetState()
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    log("onFailure: $errorResponse")
                    onTransactionResult(ERROR_SERVER_CODE, errorResponse.message)
                }

                override fun onError(error: Throwable) {
                    log("onError: $error")
                    onTransactionResult(ERROR_SERVER_CODE, error.localizedMessage)
                }
            }
        )
    }

    override fun onRequestSignature(proceed: () -> Unit) {
        listener?.onRequestSignature {
            log("signatureDataReceived: $it")
            signatureData = it
            proceed()
        }
    }

    override fun onDisconnected() {
        listener?.onDisconnected()
    }

    override fun onTransactionResult(code: Int, message: String?) {
        log("onTransactionResult: code: $code, message: $message")
        if (code == 0) {
            if (currentlyAttachedCardType == CardType.IC) {
                listener?.onStartOnlineProcess { acquirerID, amount, locationLat, locationLong, cardPaymentMethod ->
                    log("onStartOnlineProcess: proceed")
                    val tlvData = deviceCardTransactionService?.getTLVDataHexString(
                        "57",
                        "82",
                        "95",
                        "9A",
                        "9C",
                        "5F2A",
                        "5F34",
                        "9F02",
                        "9F03",
                        "9F10",
                        "9F1A",
                        "9F26",
                        "9F27",
                        "9F33",
                        "9F34",
                        "9F35",
                        "9F36",
                        "9F37",
                        "9F49",
                        "8F"
                    )!!
                    MikaSdk.instance.createTransaction(
                        acquirerID = acquirerID,
                        amount = amount,
                        locationLat = locationLat,
                        locationLong = locationLong,
                        cardType = when (cardPaymentMethod) {
                            CardPaymentMethod.Credit -> "kredit";CardPaymentMethod.Debit -> "debit"
                        },
                        track2Data = "",
                        emvData = tlvData,
                        pinBlockData = pinBlockData?.toHexString() ?: "",
                        signatureData = signatureData ?: "",
                        callback = object : MikaCallback<CardTransaction> {
                            override fun onSuccess(response: CardTransaction) {
                                transactionID = response.transactionId
                                log("MikaCallback<CardTransaction> onSuccess: $response")
                                listener?.onTransactionResult(code, transactionID!!)
                                resetState()
                            }

                            override fun onFailure(errorResponse: BasicResponse) {
                                log("MikaCallback<CardTransaction> onFailure: $errorResponse")
                                listener?.onTransactionResult(ERROR_SERVER_CODE, errorResponse.message)
                                resetState()
                            }

                            override fun onError(error: Throwable) {
                                log("MikaCallback<CardTransaction> onError: $error")
                                listener?.onTransactionResult(-9999, error.localizedMessage)
                                resetState()
                            }
                        }
                    )
                }
            } else {
                listener?.onTransactionResult(code, transactionID!!)
                resetState()
            }
        } else {
            listener?.onTransactionResult(code, message)
            resetState()
        }
    }

    private fun resetState() {
        lifeCycle = READY
        track2Data = null
        cardPan = null
        pinBlockData = null
        currentlyAttachedCardType = null
        transactionID = null
    }

    override fun onError(exception: CardPaymentException) {
        listener?.onError(exception)
    }


    fun stop() {
        log("stop")
        deviceCardTransactionService?.stopTransactionProcess(lifeCycle)
        when (lifeCycle) {
            UNINITIALIZED -> {
            }
            READY -> {
            }
            STARTED -> {
                lifeCycle = READY
            }
            READING_CARD -> {
                lifeCycle = READY
            }
            CARD_FOUND_MAGNETIC -> {
                lifeCycle = READY
            }
            SHOW_PIN_PAD -> {
                lifeCycle = READY
            }
            PIN_PAD_RESULT -> {
                lifeCycle = READY
            }
            CARD_FOUND_IC -> {
                lifeCycle = READY
            }
            EMV_STARTED -> {
                lifeCycle = READY
            }
            EMV_CONFIRM_CARD_NUMBER -> {
                lifeCycle = READY
            }
            ONLINE_PROCESS -> {
                lifeCycle = READY
            }
            SHOW_SIGNATURE -> {
                lifeCycle = READY
            }
            DISCONNECTED -> {
            }
        }
    }
}
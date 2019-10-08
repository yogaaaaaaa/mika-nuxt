package id.mikaapp.sdk.service.cardpayment.verifone

import android.annotation.SuppressLint
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import com.vfi.smartpos.deviceservice.aidl.*
import com.vfi.smartpos.deviceservice.constdefine.ConstCheckCardListener
import com.vfi.smartpos.deviceservice.constdefine.ConstIPBOC
import com.vfi.smartpos.deviceservice.constdefine.ConstIPinpad
import com.vfi.smartpos.deviceservice.constdefine.ConstPBOCHandler
import id.mikaapp.sdk.enums.CardTransactionServiceLifeCycle
import id.mikaapp.sdk.enums.CardTransactionServiceLifeCycle.*
import id.mikaapp.sdk.ext.log
import id.mikaapp.sdk.service.cardpayment.*

@SuppressLint("LongLogTag")
internal class VerifoneCardTransactionService(
    context: Context,
    listener: DeviceCardTransactionServiceListener
) : DeviceCardTransactionService(context, listener), ServiceConnection {

    private var emvProcessRunning = false

    override fun handleProcessInitialize() {
        val intent = Intent()
        intent.action = "com.vfi.smartpos.device_service"
        intent.setPackage("com.vfi.smartpos.deviceservice")
        val isSuccess = context.bindService(intent, this, Context.BIND_AUTO_CREATE)
        if (!isSuccess) {
            log("deviceService connect fail!")
        } else {
            log("deviceService connect success")
        }
    }

    override fun handleProcessStartReadCard(timeout: Int, cardType: Array<CardType>) {
        val cardOption = Bundle()

        cardType.distinct().forEach {
            when (it) {
                CardType.Magnetic -> {
                    cardOption.putBoolean(
                        ConstIPBOC.checkCard.cardOption.KEY_MagneticCard_boolean,
                        ConstIPBOC.checkCard.cardOption.VALUE_supported
                    )
                }
                CardType.IC -> cardOption.putBoolean(
                    ConstIPBOC.checkCard.cardOption.KEY_SmartCard_boolean,
                    ConstIPBOC.checkCard.cardOption.VALUE_supported
                )
                CardType.NFC -> cardOption.putBoolean(
                    ConstIPBOC.checkCard.cardOption.KEY_Contactless_boolean,
                    ConstIPBOC.checkCard.cardOption.VALUE_supported
                )
                CardType.Unknown -> {
                }
            }
        }

        pboc.checkCard(cardOption, timeout, object : CheckCardListener.Stub() {
            override fun onCardSwiped(track: Bundle?) {
                log("checkCard->onCardSwiped: track: $track")
                startProcessFindMagneticCard(track)
            }

            override fun onTimeout() {
                log("checkCard->onTimeout")
            }

            override fun onCardPowerUp() {
                startProcessFindICCard(null)
                log("checkCard->onCardPowerUp")
            }

            override fun onCardActivate() {
                log("checkCard->onCardActivate")
            }

            override fun onError(error: Int, message: String?) {
                log("checkCard->onError: error: $error, message: $message")
            }
        })
    }

    override fun handleProcessErrorReadingCard(code: Int, message: String?) {
        log("handleProcessErrorReadingCard: code: $code, message: $message")
        listener.onErrorReadingCard(code = code, message = message,
            retry = { readCardTimeout, cardTypeToRead ->
                startReadCard(readCardTimeout, cardTypeToRead)
            })
    }

    override fun handleProcessFindMagneticCard(trackData: Bundle?) {
        pboc.stopCheckCard()
        listener.onCardAttached(CardType.Magnetic)
        val track2 =
            trackData?.getString(ConstCheckCardListener.onCardSwiped.track.KEY_TRACK2_String)
        if (track2 != null && track2.isNotEmpty()) {
            listener.onFindMagneticCardData(track2)
            startProcessRequestPinPad(true, 0)
        } else {
            startProcessErrorReadingCard(
                ERROR_CARD_INFORMATION_NOT_FOUND_CODE,
                ERROR_CARD_INFORMATION_NOT_FOUND_MESSAGE
            )
        }
    }

    override fun handleProcessFindICCard(atrData: String?) {
        beeper.startBeep(beeperLength)
        pboc.stopCheckCard()
        listener.onCardAttached(CardType.IC)
        listener.onFindICCard(null)
        listener.onRequestStartEMVProcess { amount, cardType ->
            startProcessStartEMV(
                amount,
                cardType
            )
        }
    }

    override fun handleProcessFindRFCard(atrData: String?) {
//        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun handleProcessStartEmv(amount: Int, cardType: CardType) {
        val emvIntent = Bundle().apply {
            putInt(
                ConstIPBOC.startEMV.intent.KEY_cardType_int, when (cardType) {
                    CardType.IC -> ConstIPBOC.startEMV.intent.VALUE_cardType_smart_card
                    CardType.NFC -> ConstIPBOC.startEMV.intent.VALUE_cardType_contactless
                    else -> throw RuntimeException("Card type not supported for EMV process")
                }
            )
            putLong(ConstIPBOC.startEMV.intent.KEY_authAmount_long, amount.toLong())
        }
        emvProcessRunning = true
        pboc.startEMV(
            ConstIPBOC.startEMV.processType.full_process,
            emvIntent,
            object : PBOCHandler.Stub() {
                override fun onRequestAmount() {
                    // this is an deprecated callback
                    log("onRequestAmount")
                }

                override fun onSelectApplication(appList: MutableList<String>?) {
                    log("onSelectApplication: appList: $appList")
                    pboc.importAppSelect(0)
                }

                override fun onConfirmCardInfo(info: Bundle?) {
                    log("onConfirmCardInfo: $info")
                    log("cmvList: ${getTLVDataHexString("8E")} ")
                    val pan =
                        info?.getString(ConstPBOCHandler.onConfirmCardInfo.info.KEY_PAN_String)
                    startProcessEMVConfirmCardNumber(pan!!)
                }

                override fun onRequestInputPIN(isOnlinePin: Boolean, retryTimes: Int) {
                    log("onRequestInputPIN: isOnlinePin: $isOnlinePin, retryTimes: $retryTimes")
                    startProcessRequestPinPad(isOnlinePin, retryTimes)
                }

                override fun onConfirmCertInfo(certType: String?, certInfo: String?) {
                    log("onConfirmCertInfo: certType: $certType, certInfo: $certInfo")
                }

                override fun onRequestOnlineProcess(aaResult: Bundle?) {
                    log("onRequestOnlineProcess: $aaResult")
//                startProcessOnlineProcess()
                    val onlineResult = Bundle().apply {
                        putBoolean(
                            ConstIPBOC.inputOnlineResult.onlineResult.KEY_isOnline_boolean,
                            true
                        )
                        putString(
                            ConstIPBOC.inputOnlineResult.onlineResult.KEY_field55_String,
                            "5F3401019F3303E0F9C8950500000000009F1A0201569A039707039F3704F965E43082027C009F3602041C9F260805142531F709C8669C01009F02060000000000125F2A0201569F101307010103A02000010A01000000000063213EC29F2701809F1E0831323334353637389F0306000000000000"
                        )
                        putString(
                            ConstIPBOC.inputOnlineResult.onlineResult.KEY_respCode_String,
                            "00"
                        )
                        putString(
                            ConstIPBOC.inputOnlineResult.onlineResult.KEY_authCode_String,
                            "123456"
                        )
                    }
                    pboc.inputOnlineResult(onlineResult, object : OnlineResultHandler.Stub() {
                        override fun onProccessResult(result: Int, data: Bundle?) {
                            log("onProcessResult: $result, $data")
                            startProcessOnTransactionResult(
                                result,
                                data?.getString(ConstPBOCHandler.onTransactionResult.data.KEY_ERROR_String)
                            )
                        }
                    })
                }

                override fun onTransactionResult(result: Int, data: Bundle?) {
                    log("onTransactionResult: $result, $data")
                    startProcessOnTransactionResult(
                        result,
                        data?.getString(ConstPBOCHandler.onTransactionResult.data.KEY_ERROR_String)
                    )
                }

            })

    }

    override fun handleProcessEMVConfirmCardNumber(cardNumber: String) {
        listener.onEMVConfirmCardNo(cardNumber) {
            pboc.importCardConfirmResult(ConstIPBOC.importCardConfirmResult.pass.allowed)
        }
    }

    override fun handleProcessRequestPinPad(isOnlinePin: Boolean, retryTimes: Int) {
        listener.onRequestShowPinPadStep(proceed = { cardPan, timeout ->
            val param = Bundle().apply {
                putByteArray(
                    ConstIPinpad.startPinInput.param.KEY_pinLimit_ByteArray,
                    byteArrayOf(6)
                )
                putInt(ConstIPinpad.startPinInput.param.KEY_timeout_int, timeout)
                putBoolean(ConstIPinpad.startPinInput.param.KEY_isOnline_boolean, isOnlinePin)
                putString(ConstIPinpad.startPinInput.param.KEY_pan_String, cardPan)
                putInt(
                    ConstIPinpad.startPinInput.param.KEY_desType_int,
                    ConstIPinpad.startPinInput.param.Value_desType_3DES
                )
            }
            pinPad.startPinInput(1, param, Bundle(), object : PinInputListener.Stub() {
                override fun onInput(len: Int, key: Int) {
                    beeper.startBeep(beeperLength)
                    log("PinPad onInput: len: $len, key: $key")
                    if (key == 24) {
                        if (!emvProcessRunning) startProcessPinPadResult(PinPadResult.Cancel) else {
                            pboc.abortPBOC()
                            startProcessOnTransactionResult(-1, "PinPadCancelled")
                        }
                    }
                }

                override fun onConfirm(data: ByteArray?, isNonePin: Boolean) {
                    log("PinPad onConfirm: data: $data")
                    if (emvProcessRunning) pboc.importPin(1, data) else
                        startProcessPinPadResult(PinPadResult.Confirm(data!!))
                }

                override fun onCancel() {
                    if (!emvProcessRunning) startProcessPinPadResult(PinPadResult.Cancel)
                }

                override fun onError(errorCode: Int) {
                    if (!emvProcessRunning) startProcessPinPadResult(
                        PinPadResult.Error(
                            errorCode,
                            null
                        )
                    )
                }
            })
        }, skip = {
            if (emvProcessRunning) listener.onRequestSignature {
                pboc.importPin(1, null)
            }
        })
    }

    override fun handleProcessRequestSignature() {
        log("handleProcessRequestSignature")
    }

    override fun handleProcessPinPadResult(result: PinPadResult) {
        log("handleProcessPinPadResult: $result")
        listener.onPinPadResult(result)
    }

    override fun handleProcessRequestOnlineProcess() {
    }

    override fun handleProcessTransactionResult(code: Int, message: String?) {
        emvProcessRunning = false
        listener.onTransactionResult(code, message)
    }

    override fun handleProcessError(code: Int, message: String?) {
        log("onError: code: $code, message: $message")
        listener.onError(CardPaymentException(code, message ?: "N/A"))
    }

    private val tag = "MikaSdk VerifoneCardTransactionService"

    private var service: IBinder? = null
    private val deviceService by lazy { IDeviceService.Stub.asInterface(service) }
    private val pboc by lazy { deviceService.pboc }
    private val pinPad by lazy { deviceService.getPinpad(1) }
    private val beeper by lazy { deviceService.beeper }

    override fun onServiceConnected(componentName: ComponentName?, service: IBinder?) {
        log("onServiceConnected")
        this.service = service
        deviceService;pboc;pinPad;beeper
        isReady = true
        listener.onReady()
    }

    override fun onServiceDisconnected(p0: ComponentName?) {
        log("onServiceDisconnected")
        listener.onDisconnected()
    }

    override fun toMikaCardType(cardType: Int): CardType {
        return when (cardType) {
            0 -> CardType.Magnetic
            1 -> CardType.IC
            2 -> CardType.NFC
            else -> CardType.Unknown
        }
    }

    override fun toDeviceCardType(cardType: CardType): Int {
        return when (cardType) {
            CardType.Magnetic -> 0
            CardType.IC -> 1
            CardType.NFC -> 2
            CardType.Unknown -> 3
        }
    }

    override fun stopTransactionProcess(currentLifeCycle: CardTransactionServiceLifeCycle) {
        when (currentLifeCycle) {
            UNINITIALIZED -> {

            }
            READY -> {

            }
            STARTED -> {

            }
            READING_CARD -> {
                pboc.stopCheckCard()
            }
            CARD_FOUND_MAGNETIC -> {

            }
            CARD_FOUND_IC -> {

            }
            EMV_STARTED -> {
                pboc.abortPBOC()
                emvProcessRunning = false
            }
            EMV_CONFIRM_CARD_NUMBER -> {
                pboc.abortPBOC()
                emvProcessRunning = false
            }
            ONLINE_PROCESS -> {
                pboc.abortPBOC()
                emvProcessRunning = false
            }
            SHOW_PIN_PAD -> {
                pboc.abortPBOC()
                emvProcessRunning = false
            }
            SHOW_SIGNATURE -> {
                pboc.abortPBOC()
                emvProcessRunning = false
            }
            PIN_PAD_RESULT -> {
                pboc.abortPBOC()
                emvProcessRunning = false
            }
            DISCONNECTED -> {

            }
        }
    }

    override fun getTLVDataHexString(vararg desiredTagList: String): String? {
        return pboc.getAppTLVList(desiredTagList)
    }

    companion object {
        private const val beeperLength = 200
    }

}
package id.mikaapp.sdk.service.cardpayment.sunmi

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.util.Log
import com.sunmi.pay.hardware.aidl.AidlConstants
import com.sunmi.pay.hardware.aidlv2.AidlErrorCodeV2
import com.sunmi.pay.hardware.aidlv2.bean.EMVCandidateV2
import com.sunmi.pay.hardware.aidlv2.bean.EMVTransDataV2
import com.sunmi.pay.hardware.aidlv2.bean.EmvTermParamV2
import com.sunmi.pay.hardware.aidlv2.bean.PinPadConfigV2
import com.sunmi.pay.hardware.aidlv2.emv.EMVListenerV2
import com.sunmi.pay.hardware.aidlv2.emv.EMVOptV2
import com.sunmi.pay.hardware.aidlv2.pinpad.PinPadListenerV2
import com.sunmi.pay.hardware.aidlv2.pinpad.PinPadOptV2
import com.sunmi.pay.hardware.aidlv2.readcard.CheckCardCallbackV2
import com.sunmi.pay.hardware.aidlv2.readcard.ReadCardOptV2
import com.sunmi.pay.hardware.aidlv2.security.SecurityOptV2
import id.mikaapp.sdk.enums.CardTransactionServiceLifeCycle
import id.mikaapp.sdk.ext.hexToByteArray
import id.mikaapp.sdk.ext.log
import id.mikaapp.sdk.ext.toHexString
import id.mikaapp.sdk.service.cardpayment.*
import id.mikaapp.sdk.utils.sunmipay.ByteUtil
import sunmi.paylib.SunmiPayKernel
import java.nio.charset.StandardCharsets

@SuppressLint("LongLogTag")
internal class SunmiCardTransactionService(
    context: Context,
    listener: DeviceCardTransactionServiceListener
) : DeviceCardTransactionService(context, listener) {

    private val tag = "MikaSdk SunmiCardTransactionService"

    private val sunmiPayKernel: SunmiPayKernel = SunmiPayKernel.getInstance()
    private val readCardOptV2: ReadCardOptV2 by lazy { sunmiPayKernel.mReadCardOptV2!! }
    private val emvOptV2: EMVOptV2 by lazy { sunmiPayKernel.mEMVOptV2!! }
    private val securityOptV2: SecurityOptV2 by lazy { sunmiPayKernel.mSecurityOptV2!! }
    private val pinPadOptV2: PinPadOptV2 by lazy { sunmiPayKernel.mPinPadOptV2!! }

    private var emvProcessRunning = false
    //    private var currentlyAttachedCardType: Int? = null

    private val emvListenerV2 = object : EMVListenerV2.Stub() {

        override fun onConfirmCardNo(p0: String) {
            log("cmvList: ${getTLVDataHexString("8E")} ")
            startProcessEMVConfirmCardNumber(p0)
        }

        override fun onCardDataExchangeComplete() {
            log("onCardDataExchangeComplete")
        }

        override fun onOnlineProc() {
            log("onOnlineProc")
            startProcessOnlineProcess()
        }

        override fun onCertVerify(p0: Int, p1: String?) {
            log("onCertVerify: $p0, $p1")
        }

        override fun onAppFinalSelect(tag9F06value: String?) {
            log("onAppFinalSelect tag9F06value:$tag9F06value")
            emvOptV2.importAppFinalSelectStatus(0)
        }

        override fun onConfirmationCodeVerified() {
            log("onConfirmationCodeVerified")
        }

        override fun onWaitAppSelect(p0: MutableList<EMVCandidateV2>?, p1: Boolean) {
            log("onWaitAppSelect: $p0")
            emvOptV2.importAppSelect(0)
        }

        override fun onRequestShowPinPad(p0: Int, p1: Int) {
            log("onRequestShowPinPad: $p0, $p1")
            startProcessRequestPinPad(p0 == 0, p1)
        }

        override fun onRequestSignature() {
            log("onRequestSignature")
            startProcessRequestSignature()
        }

        override fun onTransResult(p0: Int, p1: String?) {
            startProcessOnTransactionResult(p0, p1)
        }

    }

    // --------------------------------------- DeviceCardTransactionService Override --------------------------------------

    override fun toMikaCardType(cardType: Int): CardType {
        return when (cardType) {
            AidlConstants.CardType.IC.value -> CardType.IC
            AidlConstants.CardType.NFC.value -> CardType.NFC
            AidlConstants.CardType.MAGNETIC.value -> CardType.Magnetic
            else -> CardType.Unknown
        }
    }

    override fun toDeviceCardType(cardType: CardType): Int {
        return when (cardType) {
            CardType.IC -> AidlConstants.CardType.IC.value
            CardType.NFC -> AidlConstants.CardType.NFC.value
            CardType.Magnetic -> AidlConstants.CardType.MAGNETIC.value
            CardType.Unknown -> -1
        }
    }

    override fun getTLVDataHexString(vararg desiredTagList: String): String? {
        val tlvOutData = ByteArray(512)
        val tlvDataLen =
            emvOptV2.getTlvList(AidlConstants.EMV.TLVOpCode.OP_PAYPASS, desiredTagList, tlvOutData)
        return if (tlvDataLen > 0) {
            val tlvDataBytes = tlvOutData.copyOf(tlvDataLen)
            tlvDataBytes.toHexString()
        } else {
            null
        }
    }

    // ---------------------------------------------------- HANDLER ----------------------------------------------------

    override fun handleProcessInitialize() {
        log("handleProcessInitialize")
        val intent = Intent("sunmi.intent.action.PAY_HARDWARE")
        intent.setPackage("com.sunmi.pay.hardware_v3")
        val info = context.applicationContext.packageManager.queryIntentServices(intent, 0)
        if (info == null || info.isEmpty()) {
            listener.onError(
                CardPaymentException(
                    ERROR_DEVICE_NOT_SUPPORTED_CODE,
                    ERROR_DEVICE_NOT_SUPPORTED_MESSAGE
                )
            )
            Log.e(tag, "[$ERROR_DEVICE_NOT_SUPPORTED_CODE] $ERROR_DEVICE_NOT_SUPPORTED_MESSAGE")
        } else {
            sunmiPayKernel.initPaySDK(context, object : SunmiPayKernel.ConnectCallback {
                override fun onConnectPaySDK() {
                    log("onConnectPaySDK")
                    readCardOptV2;emvOptV2;pinPadOptV2;securityOptV2
                    initializeTerminalParams()
                    initializeKeys()
                    isReady = true
                    listener.onReady()
                }

                override fun onDisconnectPaySDK() {
                    log("onDisconnectPaySDK")
                    listener.onDisconnected()
                }
            })
        }
    }

    private fun initializeTerminalParams() {
//      val tlvData = mutableMapOf(
//          "5F2A" to "0360",   // Transaction Currency Code -> Indonesia (360 -> (2 bytes) -> 0360)
//          "5F36" to "00",     // Transaction Currency Exponent -> 00 no exponent
//          "9F33" to "E060FF", // Terminal Capabilities (Card Data Input Capability | CVM capability | Security Capability)
//          "9F09" to "0111"    // Version number assigned by the payment system for the Kernel application
//      )
//      emvOptV2.setTlvList(
//          AidlConstants.EMV.TLVOpCode.OP_NORMAL, tlvData.keys.toTypedArray(),
//          tlvData.values.toTypedArray()
//      )
        val terminalParam = EmvTermParamV2().apply {
            capability = "E0F8C8"
            countryCode = "0360"
        }
        val result = emvOptV2.setTerminalParam(terminalParam)
        log("Set terminal param result: $result")
    }

    private fun initializeKeys() {
        // save KEK
        var result: Int
        val kekValue = ByteUtil.hexStr2Bytes("11111111111111111111111111111111")
        val checkValue = ByteUtil.hexStr2Bytes("82E13665B4624DF5")
        result = securityOptV2.savePlaintextKey(
            AidlConstants.Security.KEY_TYPE_KEK,
            kekValue,
            null,
            AidlConstants.Security.KEY_ALG_TYPE_3DES,
            10
        )
        log("save KEK result:$result")
        if (result != 0) {
            log("save KEK fail")
        }

        // save TMK
        val tmkValue = ByteUtil.hexStr2Bytes("F40379AB9E0EC533F40379AB9E0EC533")
        result = securityOptV2.saveCiphertextKey(
            AidlConstants.Security.KEY_TYPE_TMK,
            tmkValue,
            null,
            10,
            AidlConstants.Security.KEY_ALG_TYPE_3DES,
            11
        )
        log("save TMK result:$result")
        if (result != 0) {
            log("save TMK fail")
        }
        // save PIK
        val pikValue = "F40379AB9E0EC533F40379AB9E0EC533".hexToByteArray()
        val savePikResult = securityOptV2.saveCiphertextKey(
            AidlConstants.Security.KEY_TYPE_PIK,
            pikValue,
            null,
            11,
            AidlConstants.Security.KEY_ALG_TYPE_3DES,
            12
        )
        log("save PIK result:$savePikResult")
        if (savePikResult != 0) {
            log("save PIK fail")
        }
    }

    override fun handleProcessStartReadCard(timeout: Int, cardType: Array<CardType>) {
        if (!isReady) {
            log("handleProcessStartReadCard: $ERROR_SERVICE_NOT_CONNECTED_CODE, $ERROR_SERVICE_NOT_CONNECTED_MESSAGE")
            listener.onError(
                CardPaymentException(
                    ERROR_SERVICE_NOT_CONNECTED_CODE,
                    ERROR_SERVICE_NOT_CONNECTED_MESSAGE
                )
            )
            return
        }
        log("handleProcessStartReadCard: $timeout, $cardType")
        readCardOptV2.checkCard(cardType.distinct()
            .map { toDeviceCardType(it) }
            .reduce { acc, i -> acc or i }, object : CheckCardCallbackV2.Stub() {
            override fun findMagCard(p0: Bundle?) = startProcessFindMagneticCard(p0)
            override fun findICCard(p0: String?) = startProcessFindICCard(p0)
            override fun findRFCard(p0: String?) = startProcessFindRFCard(p0)
            override fun onError(p0: Int, p1: String?) = startProcessErrorReadingCard(p0, p1)
        }, timeout
        )
    }

    override fun handleProcessErrorReadingCard(code: Int, message: String?) {
        log("handleProcessErrorReadingCard: code: $code, message: $message")
        listener.onErrorReadingCard(code = code, message = message,
            retry = { readCardTimeout, cardTypeToRead ->
                startReadCard(readCardTimeout, cardTypeToRead)
            })
    }

    override fun handleProcessFindMagneticCard(trackData: Bundle?) {
        log("handleProcessFindMagneticCard: $trackData")
        listener.onCardAttached(toMikaCardType(AidlConstants.CardType.MAGNETIC.value))
        if (trackData == null) {
            log("handleProcessFindMagneticCard: $ERROR_CARD_INFORMATION_NOT_FOUND_MESSAGE")
            startProcessErrorReadingCard(
                ERROR_CARD_INFORMATION_NOT_FOUND_CODE,
                ERROR_CARD_INFORMATION_NOT_FOUND_MESSAGE
            )
            return
        }
        val track2 = trackData.getString("TRACK2")
        if (track2 == null) {
            log("handleProcessFindMagneticCard: $ERROR_CARD_INFORMATION_NOT_FOUND_MESSAGE")
            startProcessErrorReadingCard(
                ERROR_CARD_INFORMATION_NOT_FOUND_CODE,
                ERROR_CARD_INFORMATION_NOT_FOUND_MESSAGE
            )
            return
        }
        listener.onFindMagneticCardData(track2)
        startProcessRequestPinPad(true, 0)
    }

    override fun handleProcessFindICCard(atrData: String?) {
        log("handleProcessFindICCard: atrData: $atrData")
        listener.onCardAttached(toMikaCardType(AidlConstants.CardType.IC.value))
        listener.onFindICCard(atrData)
        listener.onRequestStartEMVProcess(
            proceed = { amount, cardType ->
                startProcessStartEMV(amount, cardType)
            }
        )
    }

    override fun handleProcessFindRFCard(atrData: String?) {
        log("findRFCard: atrData: $atrData")
        listener.onCardAttached(toMikaCardType(AidlConstants.CardType.NFC.value))
        listener.onFindRFCard(atrData)
        emvOptV2.initEmvProcess()
        emvProcessRunning = true
//        val emvTransDataV2 = EMVTransDataV2().apply {
//            amount = this@SunmiCardTransactionService.amount.toString()
//            flowType = 0x01
//            cardType = AidlConstants.CardType.NFC.value
//        }
//        emvOptV2?.transactProcess(emvTransDataV2, emvListenerV2)
    }

    override fun handleProcessStartEmv(amount: Int, cardType: CardType) {
        emvOptV2.initEmvProcess()
        emvProcessRunning = true
        val emvTransDataV2 = EMVTransDataV2().apply {
            this.amount = amount.toString()
            flowType = 0x01
            this.cardType = when (cardType) {
                CardType.IC -> AidlConstants.CardType.IC.value
                CardType.NFC -> AidlConstants.CardType.NFC.value
                else -> throw RuntimeException("Card type not supported for EMV Process")
            }
        }
        emvOptV2.transactProcess(emvTransDataV2, emvListenerV2)
    }

    override fun handleProcessEMVConfirmCardNumber(cardNumber: String) {
        log("handleProcessEMVConfirmCardNumber: $cardNumber")
        listener.onEMVConfirmCardNo(
            cardNumber = cardNumber,
            proceed = {
                log("onEMVConfirmCardNo proceed")
                emvOptV2.importCardNoStatus(0)
            })
    }

    override fun handleProcessRequestPinPad(isOnlinePin: Boolean, retryTimes: Int) {
        log("handleProcessRequestPinPad: isOnlinePin: $isOnlinePin, retryTimes: $retryTimes")
        val skipCallback = { emvOptV2.importPinInputStatus(if (isOnlinePin) 0 else 1, 2) }
        listener.onRequestShowPinPadStep(
            proceed = { cardPan, timeout ->
                log("onRequestShowPinPadStep proceed: $cardPan, $timeout")
                try {
                    val pinPadConfigV2 = PinPadConfigV2()
                    pinPadConfigV2.pinPadType = 0
                    pinPadConfigV2.pinType =
                        if (isOnlinePin) 0 else 1    //PIN type, 0: online PIN, 1: offline PIN
                    pinPadConfigV2.isOrderNumKey = false
                    pinPadConfigV2.pan = cardPan.toByteArray(StandardCharsets.US_ASCII)
                    pinPadConfigV2.timeout = timeout * 1000
                    pinPadConfigV2.pinKeyIndex = 12 // pik index
                    pinPadConfigV2.maxInput = 6
                    pinPadConfigV2.minInput = 6
                    pinPadConfigV2.isSupportbypass = false
                    pinPadOptV2.initPinPad(pinPadConfigV2, object : PinPadListenerV2.Stub() {

                        override fun onCancel() {
                            log("PinPad onCancel")
                            if (emvProcessRunning) emvOptV2.importPinInputStatus(0, 1) else
                                startProcessPinPadResult(PinPadResult.Cancel)
                        }

                        override fun onPinLength(p0: Int) {
                            log("PinPad onPinLength: $p0")
                        }

                        override fun onConfirm(p0: Int, p1: ByteArray?) {
                            log("PinPad onConfirm: $p0, $p1")
                            if (p1 == null) {
                                if (emvProcessRunning) emvOptV2.importPinInputStatus(p0, 1) else
                                    startProcessPinPadResult(PinPadResult.Error(-1, "Pin empty"))
                                return
                            }
                            startProcessPinPadResult(PinPadResult.Confirm(p1))
                            if (emvProcessRunning) emvOptV2.importPinInputStatus(p0, 0)
                        }

                        override fun onError(p0: Int) {
                            log("PinPad onError: $p0")
                            if (emvProcessRunning) emvOptV2.importPinInputStatus(p0, 3) else
                                startProcessPinPadResult(
                                    PinPadResult.Error(
                                        p0,
                                        AidlErrorCodeV2.valueOf(p0).msg
                                    )
                                )
                        }
                    })
                } catch (e: Exception) {
                    log(e.localizedMessage)
                    e.printStackTrace()
                    if (emvProcessRunning) emvOptV2.importPinInputStatus(
                        if (isOnlinePin) 0 else 1,
                        3
                    ) else
                        startProcessPinPadResult(PinPadResult.Error(-999, e.localizedMessage))
                }
            }, skip = if (emvProcessRunning) skipCallback else null
        )
    }

    override fun handleProcessRequestSignature() {
        log("handleProcessRequestSignature")
        listener.onRequestSignature { emvOptV2.importSignatureStatus(0) }
    }

    override fun handleProcessPinPadResult(result: PinPadResult) {
        listener.onPinPadResult(result)
    }

    override fun handleProcessRequestOnlineProcess() {
        log("handleProcessRequestOnlineProcess")
        emvOptV2.importOnlineProcStatus(0, emptyArray(), emptyArray(), ByteArray(1024))
    }

    override fun handleProcessTransactionResult(code: Int, message: String?) {
        log("onTransResult: $code, $message")
        listener.onTransactionResult(code, message)
    }

    override fun handleProcessError(code: Int, message: String?) {
        log("onError: code: $code, message: $message")
        listener.onError(CardPaymentException(code, message ?: "N/A"))
//        stopTransactionProcess() TODO ??
    }

    override fun stopTransactionProcess(currentLifeCycle: CardTransactionServiceLifeCycle) {
        log("stopTransactionProcess: currentLifeCycle: $currentLifeCycle")
        /*
        importAppSelect(-1)
        importAppFinalSelectStatus(-1)
        importCardNoStatus(1)
        importCertStatus(1)
        importSignatureStatus(1)
        importPinInputStatus(0, 2)
        importOnlineProcStatus(1, arrayOf(), arrayOf(), byteArrayOf())
        */
        Handler(context.mainLooper).post {
            when (currentLifeCycle) {
                CardTransactionServiceLifeCycle.UNINITIALIZED -> {
                }
                CardTransactionServiceLifeCycle.READY -> {
                }
                CardTransactionServiceLifeCycle.READING_CARD -> {
                    readCardOptV2.cancelCheckCard()
                }
                CardTransactionServiceLifeCycle.STARTED -> {
                }
                CardTransactionServiceLifeCycle.CARD_FOUND_MAGNETIC -> {

                }
                CardTransactionServiceLifeCycle.CARD_FOUND_IC -> {

                }
                CardTransactionServiceLifeCycle.SHOW_PIN_PAD -> {
                    if (emvProcessRunning) emvOptV2.importPinInputStatus(0, 2)
                }
                CardTransactionServiceLifeCycle.PIN_PAD_RESULT -> {
                }
                CardTransactionServiceLifeCycle.EMV_STARTED -> {
                }
                CardTransactionServiceLifeCycle.EMV_CONFIRM_CARD_NUMBER -> {
                    emvOptV2.importCardNoStatus(1)
                }
                CardTransactionServiceLifeCycle.ONLINE_PROCESS -> {
                    emvOptV2.importOnlineProcStatus(1, arrayOf(), arrayOf(), byteArrayOf())
                }
                CardTransactionServiceLifeCycle.SHOW_SIGNATURE -> {
                    emvOptV2.importSignatureStatus(1)
                }
                CardTransactionServiceLifeCycle.DISCONNECTED -> {
                }
            }
        }
    }

// ---------------------------------------------------- HELPER ----------------------------------------------------

    private fun initKey() {
        try {
            val cvByte = ByteUtil.hexStr2Bytes("82E13665B4624DF5")
            // save KEK
            var dataByte = ByteUtil.hexStr2Bytes("11111111111111111111111111111111")
            var result = securityOptV2.savePlaintextKey(
                AidlConstants.Security.KEY_TYPE_KEK,
                dataByte,
                cvByte,
                AidlConstants.Security.KEY_ALG_TYPE_3DES,
                10
            )
            log("save KEK result:$result")
            if (result != 0) {
                log("save KEK fail")
                return
            }

            // save TMK
            dataByte = ByteUtil.hexStr2Bytes("F40379AB9E0EC533F40379AB9E0EC533")
            result = securityOptV2.saveCiphertextKey(
                AidlConstants.Security.KEY_TYPE_TMK,
                dataByte,
                cvByte,
                10,
                AidlConstants.Security.KEY_ALG_TYPE_3DES,
                11
            )
            log("save TMK result:$result")
            if (result != 0) {
                log("save TMK fail")
                return
            }

            // save PIK
            result = securityOptV2.saveCiphertextKey(
                AidlConstants.Security.KEY_TYPE_PIK,
                dataByte,
                cvByte,
                11,
                AidlConstants.Security.KEY_ALG_TYPE_3DES,
                12
            )
            log("save PIK result:$result")
            if (result != 0) {
                log("save PIK fail")
                return
            }

            // save MAK
            result = securityOptV2.saveCiphertextKey(
                AidlConstants.Security.KEY_TYPE_MAK,
                dataByte,
                cvByte,
                11,
                AidlConstants.Security.KEY_ALG_TYPE_3DES,
                13
            )
            log("save MAK result:$result")
            if (result != 0) {
                log("save MAK fail")
                return
            }

            // save TDK
            result = securityOptV2.saveCiphertextKey(
                AidlConstants.Security.KEY_TYPE_TDK,
                dataByte,
                cvByte,
                11,
                AidlConstants.Security.KEY_ALG_TYPE_3DES,
                14
            )
            log("save TDK result:$result")
            if (result != 0) {
                log("save TDK fail")
                return
            }

            log("init key success")
        } catch (e: Exception) {
            e.printStackTrace()
            log("init key fail")
        }

    }
}
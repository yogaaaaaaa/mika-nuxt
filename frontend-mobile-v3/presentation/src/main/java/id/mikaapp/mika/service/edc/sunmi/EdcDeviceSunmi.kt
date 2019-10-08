package id.mikaapp.mika.service.edc.sunmi

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.lifecycle.LifecycleOwner
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
import com.sunmi.pay.hardware.aidlv2.system.BasicOptV2
import id.mikaapp.edcdeviceservice.CardType
import id.mikaapp.edcdeviceservice.PinPadResult
import id.mikaapp.edcdeviceservice.PrintOperation
import id.mikaapp.edcdeviceservice.ReadCardResult
import id.mikaapp.edcdeviceservice.sunmi.SunmiPrintOperation
import id.mikaapp.mika.service.edc.EdcDevice
import sunmi.paylib.SunmiPayKernel
import woyou.aidlservice.jiuiv5.IWoyouService
import java.nio.charset.StandardCharsets

class EdcDeviceSunmi : EdcDevice() {

    private val sunmiPayKernel: SunmiPayKernel = SunmiPayKernel.getInstance()
    private val readCardOptV2: ReadCardOptV2 by lazy { sunmiPayKernel.mReadCardOptV2!! }
    private val emvOptV2: EMVOptV2 by lazy { sunmiPayKernel.mEMVOptV2!! }
    private val securityOptV2: SecurityOptV2 by lazy { sunmiPayKernel.mSecurityOptV2!! }
    private val pinPadOptV2: PinPadOptV2 by lazy { sunmiPayKernel.mPinPadOptV2!! }
    private val basicOptV2: BasicOptV2 by lazy { sunmiPayKernel.mBasicOptV2!! }
    private var printer: IWoyouService? = null
    override var bound: Boolean = false
    private val tag: String = "EdcDeviceSunmi"

    override val connection = object : ServiceConnection {
        override fun onServiceConnected(p0: ComponentName, p1: IBinder) {
            // This is called when the connection with the service has been
            // established, giving us the object we can use to
            // interact with the service.  We are communicating with the
            // service using a Messenger, so here we get a client-side
            // representation of that from the raw IBinder object.
            Log.d(tag, "onServiceConnected")
            printer = IWoyouService.Stub.asInterface(p1)
            bound = true
        }

        override fun onServiceDisconnected(className: ComponentName) {
            // This is called when the connection with the service has been
            // unexpectedly disconnected -- that is, its process crashed.
            Log.d(tag, "onServiceDisconnected")
            printer = null
            bound = false
        }
    }

    override fun stopService() {
        if (bound) {
            Log.d(tag, "stopService")
            context.unbindService(connection)
            bound = false
        }
    }

    override fun startService(lifecycleOwner: LifecycleOwner) {
        lifecycleOwner.lifecycle.addObserver(this)
        if (bound) return
        val intent = Intent("sunmi.intent.action.PAY_HARDWARE")
        intent.setPackage("com.sunmi.pay.hardware_v3")
        val info = context.applicationContext.packageManager.queryIntentServices(intent, 0)
        if (info.isEmpty()) {
            Log.d(tag, "deviceService connect fail!")
        } else {
            sunmiPayKernel.initPaySDK(context, object : SunmiPayKernel.ConnectCallback {
                override fun onConnectPaySDK() {
                    Log.d(tag, "onConnectPaySDK")
                    readCardOptV2;emvOptV2;pinPadOptV2;securityOptV2;basicOptV2
                    initializeTerminalParams()
                    initializeKeys()
                }

                override fun onDisconnectPaySDK() {
                    Log.d(tag, "onServiceDisconnected")
                }
            })
        }

        val printerServiceIntent =
            Intent().apply {
                `package` = "woyou.aidlservice.jiuiv5"
                action = "woyou.aidlservice.jiuiv5.IWoyouService"
            }
        context.applicationContext.startService(printerServiceIntent)
        context.applicationContext.bindService(
            printerServiceIntent,
            connection,
            Context.BIND_AUTO_CREATE
        )
    }

    private fun initializeTerminalParams() {
        val terminalParam = EmvTermParamV2().apply {
            capability = "E0F8C8"
            countryCode = "0360"
        }
        val result = emvOptV2.setTerminalParam(terminalParam)
        Log.d(tag, "Set terminal param result: $result")
    }

    fun String.hexToByteArray(): ByteArray {
        val hexStr = toLowerCase()
        val length = hexStr.length
        val bytes = ByteArray(length shr 1)
        var index = 0
        for (i in 0 until length) {
            if (index > hexStr.length - 1) return bytes
            val highDit = (Character.digit(hexStr[index], 16) and 0xFF).toByte()
            val lowDit = (Character.digit(hexStr[index + 1], 16) and 0xFF).toByte()
            bytes[i] = (highDit.toInt() shl 4 or lowDit.toInt()).toByte()
            index += 2
        }
        return bytes
    }

    private fun initializeKeys() {
        // save KEK
        var result: Int
        val kekValue = "11111111111111111111111111111111".hexToByteArray()
        val checkValue = "82E13665B4624DF5".hexToByteArray()
        result = securityOptV2.savePlaintextKey(
            AidlConstants.Security.KEY_TYPE_KEK,
            kekValue,
            null,
            AidlConstants.Security.KEY_ALG_TYPE_3DES,
            10
        )
        Log.d(tag, "save KEK result:$result")
        if (result != 0) {
            Log.d(tag, "save KEK fail")
        }

        // save TMK
        val tmkValue = "F40379AB9E0EC533F40379AB9E0EC533".hexToByteArray()
        result = securityOptV2.saveCiphertextKey(
            AidlConstants.Security.KEY_TYPE_TMK,
            tmkValue,
            null,
            10,
            AidlConstants.Security.KEY_ALG_TYPE_3DES,
            11
        )
        Log.d(tag, "save TMK result:$result")
        if (result != 0) {
            Log.d(tag, "save TMK fail")
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
        Log.d(tag, "save PIK result:$savePikResult")
        if (savePikResult != 0) {
            Log.d(tag, "save PIK fail")
        }
    }

    override fun isAvailable(): Boolean = sunmiPayKernel.mReadCardOptV2 != null &&
            sunmiPayKernel.mEMVOptV2 != null &&
            sunmiPayKernel.mSecurityOptV2 != null &&
            sunmiPayKernel.mPinPadOptV2 != null &&
            sunmiPayKernel.mBasicOptV2 != null

    override fun beep(duration: Int) {
        safeCall { basicOptV2.buzzerOnDevice(1, 3000, duration, 0) }
    }

    override fun startReadCard(
        cardTypeToRead: Array<CardType>,
        timeout: Int,
        onResult: (ReadCardResult) -> Unit
    ) {
        safeCall {
            readCardOptV2.checkCard(cardTypeToRead.distinct()
                .map {
                    when (it) {
                        CardType.Magnetic -> AidlConstants.CardType.MAGNETIC.value
                        CardType.IC -> AidlConstants.CardType.IC.value
                        CardType.NFC -> AidlConstants.CardType.NFC.value
                    }
                }.reduce { acc, i -> acc or i }, object : CheckCardCallbackV2.Stub() {
                override fun findMagCard(p0: Bundle?) {
                    readCardOptV2.cancelCheckCard()
                    val track2 = p0?.getString("TRACK2")
                    val pan = track2?.split("=".toRegex())?.dropLastWhile { it.isEmpty() }
                        ?.toTypedArray()
                        ?.get(0)
                    uiHandler.post {
                        if (pan != null && track2 != null) {
                            onResult(
                                ReadCardResult.Magnetic(
                                    pan,
                                    track2
                                )
                            )
                        } else {
                            onResult(
                                ReadCardResult.Error(
                                    -1,
                                    "Card Information Not Found"
                                )
                            )
                        }
                    }

                }

                override fun findICCard(p0: String?) {
                    readCardOptV2.cancelCheckCard()
                    uiHandler.post { onResult(ReadCardResult.IC) }
                }

                override fun findRFCard(p0: String?) {
                    readCardOptV2.cancelCheckCard()
                    uiHandler.post { onResult(ReadCardResult.NFC) }
                }

                override fun onError(p0: Int, p1: String?) {
                    uiHandler.post {
                        onResult(ReadCardResult.Error(p0, p1))
                    }
                }

            }, timeout
            )
        }
    }

    override fun stopReadCard() {
        readCardOptV2.cancelCheckCard()
    }

    override fun startEmvProcess(
        cardType: CardType,
        amount: Int,
        onConfirmCardNumber: (pan: String, proceed: () -> Unit) -> Unit,
        onRequestInputPIN: (isOnlinePin: Boolean, retryTimes: Int, proceed: (pinBlock: ByteArray?) -> Unit) -> Unit,
        onRequestOnlineProcess: (proceed: () -> Unit) -> Unit,
        onTransactionResult: (result: Int) -> Unit
    ) {
        emvOptV2.initEmvProcess()
        val emvTransDataV2 = EMVTransDataV2().apply {
            this.amount = amount.toString()
            flowType = 0x01
            this.cardType = when (cardType) {
                CardType.IC -> AidlConstants.CardType.IC.value
                CardType.NFC -> AidlConstants.CardType.NFC.value
                else -> throw RuntimeException("Card type not supported for EMV Process")
            }
        }
        emvOptV2.transactProcess(emvTransDataV2, object : EMVListenerV2.Stub() {

            override fun onConfirmCardNo(p0: String?) {
                Log.d(tag, "onConfirmCardNo: $p0")
                uiHandler.post {
                    onConfirmCardNumber(p0 ?: "") {
                        emvOptV2.importCardNoStatus(0)
                    }
                }
            }

            override fun onCardDataExchangeComplete() {
                Log.d(tag, "onCardDataExchangeComplete")
            }

            override fun onOnlineProc() {
                Log.d(tag, "onRequestOnlineProces")
                uiHandler.post {
                    onRequestOnlineProcess {
                        emvOptV2.importOnlineProcStatus(
                            0,
                            emptyArray(),
                            emptyArray(),
                            ByteArray(1024)
                        )
                    }
                }
            }

            override fun onCertVerify(p0: Int, p1: String?) {
                Log.d(tag, "onCertVerify: p0: $p0, p1: $p1")
            }

            override fun onTransResult(p0: Int, p1: String?) {
                Log.d(tag, "onTransResult: p0: $p0, p1: $p1")
                onTransactionResult(p0)
            }

            override fun onAppFinalSelect(p0: String?) {
                Log.d(tag, "onAppFinalSelect: $p0")
                emvOptV2.importAppFinalSelectStatus(0)
            }

            override fun onConfirmationCodeVerified() {
                Log.d(tag, "onConfirmationCodeVerified")
            }

            override fun onWaitAppSelect(p0: MutableList<EMVCandidateV2>?, p1: Boolean) {
                Log.d(tag, "onWaitAppSelect: p0: $p0, p1: $p1")
                emvOptV2.importAppSelect(0)
            }

            override fun onRequestShowPinPad(p0: Int, p1: Int) {
                Log.d(tag, "onRequestShowPinPad: p0 $p0, p1: $p1")
                uiHandler.post {
                    onRequestInputPIN(p0 == 0, p1) { pinBlock ->
                        emvOptV2.importPinInputStatus(p0, 0)
                    }
                }
            }

            override fun onRequestSignature() {
                Log.d(tag, "onRequestSignature")
                emvOptV2.importSignatureStatus(0)
                emvOptV2.importCardNoStatus(1)
                emvOptV2.importOnlineProcStatus(1, arrayOf(), arrayOf(), byteArrayOf())
                emvOptV2.importSignatureStatus(1)
            }
        })
    }

    override fun stopEmvProcess() {
        emvOptV2.importPinInputStatus(0, 2)
    }

    override fun startPINPad(
        isOnlinePIN: Boolean,
        timeout: Int,
        pan: String,
        onInput: (length: Int, key: Int) -> Unit,
        onResult: (result: PinPadResult) -> Unit
    ) {
        try {
            val pinPadConfigV2 = PinPadConfigV2()
            pinPadConfigV2.pinPadType = 0
            pinPadConfigV2.pinType =
                if (isOnlinePIN) 0 else 1    //PIN type, 0: online PIN, 1: offline PIN
            pinPadConfigV2.isOrderNumKey = false
            pinPadConfigV2.pan = pan.toByteArray(StandardCharsets.US_ASCII)
            pinPadConfigV2.timeout = timeout * 1000
            pinPadConfigV2.pinKeyIndex = 12 // pik index
            pinPadConfigV2.maxInput = 12
            pinPadConfigV2.minInput = 0
            pinPadOptV2.initPinPad(pinPadConfigV2, object : PinPadListenerV2.Stub() {
                override fun onCancel() {
                    uiHandler.post { onResult(PinPadResult.Cancel) }
                }

                override fun onPinLength(p0: Int) {
                    uiHandler.post { onInput(p0, -1) }
                }

                override fun onConfirm(p0: Int, p1: ByteArray?) {
                    uiHandler.post { onResult(PinPadResult.Confirm(p1!!)) }
                }

                override fun onError(p0: Int) {
                    Log.d(tag, "PinPad onError: ${AidlErrorCodeV2.valueOf(p0).msg}")
                    uiHandler.post { onResult(PinPadResult.Error(p0)) }
                }
            })
        } catch (e: Exception) {
            Log.d(tag, e.message)
            e.printStackTrace()
            emvOptV2.importPinInputStatus(if (isOnlinePIN) 0 else 1, 3)
            uiHandler.post { onResult(PinPadResult.Error(-999)) }
        }
    }

    override fun print(block: PrintOperation.() -> Unit) {
        safeCall {
            Log.d(tag, "print: printer: $printer")
            printer?.let { SunmiPrintOperation(it).block(); it.lineWrap(4, null) }
        }
    }

    private fun safeCall(block: () -> Unit) {
        if (isAvailable()) block() else Log.d(tag, "Trying to process but service is not available")
    }
}
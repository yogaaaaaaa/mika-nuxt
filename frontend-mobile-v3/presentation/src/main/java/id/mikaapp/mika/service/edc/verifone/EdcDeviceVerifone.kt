package id.mikaapp.edcdeviceservice.verifone

import android.annotation.SuppressLint
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.os.RemoteException
import android.util.Log
import androidx.lifecycle.LifecycleOwner
import com.vfi.smartpos.deviceservice.aidl.*
import com.vfi.smartpos.deviceservice.constdefine.ConstCheckCardListener
import com.vfi.smartpos.deviceservice.constdefine.ConstIPBOC
import com.vfi.smartpos.deviceservice.constdefine.ConstIPinpad
import com.vfi.smartpos.deviceservice.constdefine.ConstPBOCHandler
import id.mikaapp.edcdeviceservice.CardType
import id.mikaapp.edcdeviceservice.PinPadResult
import id.mikaapp.edcdeviceservice.PrintOperation
import id.mikaapp.edcdeviceservice.ReadCardResult
import id.mikaapp.mika.service.edc.EdcDevice
import id.mikaapp.mika.service.edc.verifone.caseA.EMVParamAppCaseA

@SuppressLint("LongLogTag")
internal class EdcDeviceVerifone : EdcDevice() {
    private val tag = "DemoBank EdcDevice EdcDeviceVerifone"
    override var bound: Boolean = false
    override val connection = object : ServiceConnection {

        override fun onServiceConnected(p0: ComponentName, p1: IBinder) {
            // This is called when the connection with the service has been
            // established, giving us the object we can use to
            // interact with the service.  We are communicating with the
            // service using a Messenger, so here we get a client-side
            // representation of that from the raw IBinder object.
            if (emvOnResultCallback != null) {
                emvOnResultCallback?.invoke(-1)
                emvOnResultCallback = null
            }
            Log.d(tag, "onServiceConnected")
            deviceService = IDeviceService.Stub.asInterface(p1)
            pboc = deviceService!!.pboc
            pboc.abortPBOC()
            pinPad = deviceService!!.getPinpad(1)
            beeper = deviceService!!.beeper
            printer = deviceService!!.printer
            setAID(3)
            setAID(1)
            bound = true
        }

        override fun onServiceDisconnected(className: ComponentName) {
            // This is called when the connection with the service has been
            // unexpectedly disconnected -- that is, its process crashed.
            Log.d(tag, "onServiceDisconnected")
            deviceService = null
            if (emvOnResultCallback != null) {
                emvOnResultCallback?.invoke(-1)
                emvOnResultCallback = null
            }
            bound = false
        }
    }

    private var emvOnResultCallback: ((Int) -> Unit)? = null
    private var deviceService: IDeviceService? = null
    private lateinit var pboc: IPBOC
    private lateinit var pinPad: IPinpad
    private lateinit var beeper: IBeeper
    private lateinit var printer: IPrinter

    override fun isAvailable(): Boolean = deviceService != null

    override fun startService(lifecycleOwner: LifecycleOwner) {
        lifecycleOwner.lifecycle.addObserver(this)
        if (isAvailable() or bound) return
        val intent = Intent()
        intent.action = "com.vfi.smartpos.device_service"
        intent.setPackage("com.vfi.smartpos.deviceservice")
        val isSuccess = context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
        if (!isSuccess) {
            Log.d(tag, "deviceService connect fail!")
        } else {
            Log.d(tag, "deviceService connect success")
        }
    }

    override fun stopService() {
        if (bound) {
            Log.d(tag, "stopService")
            context.unbindService(connection)
            pboc.abortPBOC()
            bound = false
        }
    }

    override fun beep(duration: Int) {
        safeCall {
            beeper.startBeep(if (duration < 200) 200 else duration); Log.d(
            tag,
            "Beep Success"
        )
        }
    }

    override fun startReadCard(
        cardTypeToRead: Array<CardType>,
        timeout: Int,
        onResult: (ReadCardResult) -> Unit
    ) {
        if (cardTypeToRead.isEmpty()) return
        safeCall {
            Log.d(tag, "startReadingCard")
            val checkCardOption = Bundle()
            cardTypeToRead.distinct().forEach {
                checkCardOption.putBoolean(
                    when (it) {
                        CardType.Magnetic -> ConstIPBOC.checkCard.cardOption.KEY_MagneticCard_boolean
                        CardType.IC -> ConstIPBOC.checkCard.cardOption.KEY_SmartCard_boolean
                        CardType.NFC -> ConstIPBOC.checkCard.cardOption.KEY_Contactless_boolean
                    }, ConstIPBOC.checkCard.cardOption.VALUE_supported
                )
            }

            try {
                pboc.checkCard(checkCardOption, timeout, object : CheckCardListener.Stub() {
                    override fun onCardSwiped(track: Bundle) {
                        Log.d(tag, "onCardSwiped")
                        pboc.stopCheckCard()
                        pboc.abortPBOC()

                        val pan =
                            track.getString(ConstCheckCardListener.onCardSwiped.track.KEY_PAN_String)
                        val track2 =
                            track.getString(ConstCheckCardListener.onCardSwiped.track.KEY_TRACK2_String)
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

                    override fun onCardPowerUp() {
                        Log.d(tag, "onCardPowerUp")
                        pboc.stopCheckCard()
                        pboc.abortPBOC()
                        uiHandler.post { onResult(ReadCardResult.IC) }
                    }

                    override fun onCardActivate() {
                        Log.d(tag, "onCardActivate")
                        pboc.stopCheckCard()
                        pboc.abortPBOC()
                        uiHandler.post { onResult(ReadCardResult.NFC) }
                    }

                    override fun onTimeout() {
                        uiHandler.post { onResult(ReadCardResult.Timeout) }
                    }

                    override fun onError(error: Int, message: String?) {
                        uiHandler.post {
                            onResult(
                                ReadCardResult.Error(
                                    error,
                                    message
                                )
                            )
                        }
                    }

                })
            } catch (e: Exception) {
                Log.d(tag, e.localizedMessage ?: "Error checking card")
            }
        }
    }

    override fun stopReadCard() {
        safeCall { pboc.stopCheckCard() }
    }

    override fun startEmvProcess(
        cardType: CardType,
        amount: Int,
        onConfirmCardNumber: (pan: String, proceed: () -> Unit) -> Unit,
        onRequestInputPIN: (isOnlinePin: Boolean, retryTimes: Int, proceed: (pinBlock: ByteArray?) -> Unit) -> Unit,
        onRequestOnlineProcess: (proceed: () -> Unit) -> Unit,
        onTransactionResult: (result: Int) -> Unit
    ) {
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
        emvOnResultCallback = onTransactionResult
        Log.d(tag, "Start emv about to be called")
        try {
            pboc.startEMV(
                ConstIPBOC.startEMV.processType.full_process,
                emvIntent,
                object : PBOCHandler.Stub() {
                    override fun onRequestAmount() {
                        // this is an deprecated callback
                        Log.d(tag, "onRequestAmount")
                    }

                    override fun onSelectApplication(appList: MutableList<String>?) {
                        Log.d(tag, "onSelectApplication: appList: $appList")
                        pboc.importAppSelect(0)
                    }

                    override fun onConfirmCardInfo(info: Bundle) {
                        Log.d(tag, "onConfirmCardInfo: $info")
                        val pan =
                            info.getString(ConstPBOCHandler.onConfirmCardInfo.info.KEY_PAN_String)
                        uiHandler.post {
                            onConfirmCardNumber(pan ?: "") {
                                pboc.importCardConfirmResult(true)
                            }
                        }
                    }

                    override fun onRequestInputPIN(isOnlinePin: Boolean, retryTimes: Int) {
                        Log.d(
                            tag,
                            "onRequestInputPIN: isOnlinePin $isOnlinePin, retryTimes: $retryTimes"
                        )
                        uiHandler.post {
                            onRequestInputPIN(isOnlinePin, retryTimes) { pinBlock ->
                                pboc.importPin(1, pinBlock)
                            }
                        }
                    }

                    override fun onConfirmCertInfo(certType: String?, certInfo: String?) {
                        Log.d(tag, "onConfirmCertInfo: certType $certType, certInfo: $certInfo")
                    }

                    override fun onRequestOnlineProcess(aaResult: Bundle?) {
                        Log.d(tag, "onRequestOnlineProcess: $aaResult")
                        uiHandler.post {
                            onRequestOnlineProcess {
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
                                pboc.inputOnlineResult(
                                    onlineResult,
                                    object : OnlineResultHandler.Stub() {
                                        override fun onProccessResult(result: Int, data: Bundle?) {
                                            Log.d(tag, "onProcessResult: $result, $data")
//                                startProcessOnTransactionResult(
//                                    result,
//                                    data?.getString(ConstPBOCHandler.onTransactionResult.data.KEY_ERROR_String)
//                                )
                                            uiHandler.post {
                                                onTransactionResult(result)
                                            }
                                        }
                                    })
                            }
                        }
                    }

                    override fun onTransactionResult(result: Int, data: Bundle?) {
                        emvOnResultCallback = null
                        uiHandler.post {
                            onTransactionResult(result)
                        }
                    }

                })
            Log.d(tag, "Start emv has been called")
        } catch (e: RemoteException) {
            onTransactionResult(-1)
        }
    }

    override fun stopEmvProcess() {
        safeCall {
            emvOnResultCallback = null
            pboc.abortPBOC()
        }
    }

    override fun startPINPad(
        isOnlinePIN: Boolean,
        timeout: Int,
        pan: String,
        onInput: (length: Int, key: Int) -> Unit,
        onResult: (PinPadResult) -> Unit
    ) {
        val pinPadParam = Bundle().apply {
            putByteArray(ConstIPinpad.startPinInput.param.KEY_pinLimit_ByteArray, byteArrayOf(6))
            putInt(ConstIPinpad.startPinInput.param.KEY_timeout_int, timeout)
            putBoolean(ConstIPinpad.startPinInput.param.KEY_isOnline_boolean, isOnlinePIN)
            putString(ConstIPinpad.startPinInput.param.KEY_pan_String, pan)
            putInt(
                ConstIPinpad.startPinInput.param.KEY_desType_int,
                ConstIPinpad.startPinInput.param.Value_desType_3DES
            )
        }
        pinPad.startPinInput(1, pinPadParam, Bundle(), object : PinInputListener.Stub() {
            override fun onInput(len: Int, key: Int) {
                uiHandler.post { onInput(len, key) }
            }

            override fun onConfirm(data: ByteArray, isNonePin: Boolean) {
                uiHandler.post { onResult(PinPadResult.Confirm(data)) }
            }

            override fun onCancel() {
                uiHandler.post { onResult(PinPadResult.Cancel) }
            }

            override fun onError(errorCode: Int) {
                uiHandler.post { onResult(PinPadResult.Error(errorCode)) }
            }

        })
    }

    override fun print(block: PrintOperation.() -> Unit) {
        safeCall {
            Log.d(tag, "print: printer: $printer")
            printer.let {
                VerifonePrintOperation(it).block();it.feedLine(4);it.startPrint(object :
                PrinterListener.Stub() {
                override fun onFinish() {
                    Log.d(tag, "print onFinish")
                }

                override fun onError(error: Int) {
                    Log.d(tag, "print onError: $error")
                }
            })
            }
        }
    }

    private fun safeCall(block: () -> Unit) {
        if (isAvailable()) block() else Log.d(tag, "Trying to process but service is not available")
    }

    /**
     * @brief set, update the AID
     *
     * In this demo, there're 2 way to set the AID
     * 1#, set each tag & value
     * 2#, set one tlv string
     * in the EMVParamAppCaseA, you can reset the tag or value in EMVParamAppCaseA.append
     * \code{.java}
     * \endcode
     * @version
     * @see EMVParamAppCaseA
     */
    fun setAID(type: Int) {
        var isSuccess: Boolean
        if (type == ConstIPBOC.updateRID.operation.clear) {
            // clear all AID
            isSuccess = false
            try {
                isSuccess = pboc.updateAID(3, 1, null)
                Log.d(tag, "Clear AID (smart AID):$isSuccess")
                isSuccess = pboc.updateAID(3, 2, null)
                Log.d(tag, "Clear AID (CTLS):$isSuccess")
            } catch (e: RemoteException) {
                e.printStackTrace()
            }

            return
        }
        // append a AID

        // 1# way of setting the AID
        // set each Tag & Value
        val emvParamAppUMSList = arrayOfNulls<EMVParamAppCaseA>(20)
        emvParamAppUMSList[0] = EMVParamAppCaseA()
        emvParamAppUMSList[0]!!.setComment("PBOC credit or debit")
        emvParamAppUMSList[0]!!.flagAppendRemoveClear = ConstIPBOC.updateRID.operation.append
        emvParamAppUMSList[0]!!.aidType = ConstIPBOC.updateAID.aidType.smart_card
        //                "9F!!0608A000000333010106DF0101009F08020020DF1105D84000A800DF1205D84004F800DF130500100000009F1B0400000001DF150400000000DF160199DF170199DF14039F3704DF1801019F7B06000000100000DF1906000000100000DF2006000999999999DF2106000000100000"
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_AID_9F06, "A000000333010106")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_ASI_DF01, "00")
        emvParamAppUMSList[0]!!.append(0x9F08, "0020")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_TAC_Default_DF11, "D84000A800")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_TAC_Online_DF12, "D84004F800")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_TAC_Denial_DF13, "0010000000")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_FloorLimit_9F1B, "00000001")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_Threshold_DF15, "00000000")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_MaxTargetPercentage_DF16, "99")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_TargetPercentage_DF17, "99")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_DefaultDDOL_DF14, "9F3704")
        emvParamAppUMSList[0]!!.append(0xDF18, "01")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_ECTransLimit_9F7B, "000000100000")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_CTLSFloorLimit_DF19, "000000100000")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_CTLSTransLimit_DF20, "000999999999")
        emvParamAppUMSList[0]!!.append(EMVParamAppCaseA.TAG_CTLSCVMLimit_DF21, "000000100000")

        Log.d(tag, emvParamAppUMSList[0]!!.tlvString)

        emvParamAppUMSList[1] = EMVParamAppCaseA()
        emvParamAppUMSList[1]!!.setComment("Visa Plus")
        emvParamAppUMSList[1]!!.flagAppendRemoveClear = ConstIPBOC.updateRID.operation.append
        emvParamAppUMSList[1]!!.aidType = ConstIPBOC.updateAID.aidType.contactless
        //                "9F0607A0000000038010DF2006000000050000DF14039F3704DF1B060000000000005F2A020156DF1701019F090201409F1B04000000009F5A07A0000000038010DF2106000000000000DF160101DF0406000000000000DF19060000000000009F3303E0F9C8DF1A060000000000009F4005FF00F0A001DF0101009F6604260000809F350122DF180101DF1205D84004F8009F1A020156DF150400000000DF1105D84004A800DF13050010000000"
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_AID_9F06,
            "A0000000038010"
        )  // 	9F06	07	A0000000038010
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_CTLSTransLimit_DF20,
            "000000050000"
        )  // 	DF20	06	000000050000
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_DefaultDDOL_DF14,
            "9F3704"
        )  // 	DF14	03	9F3704
        emvParamAppUMSList[1]!!.append(0xDF1B, "000000000000")  // 	DF1B	06	000000000000
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_CurrencyCodeTerm_5F2A,
            "0156"
        )  // 	5F2A	02	0156
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_TargetPercentage_DF17,
            "01"
        )  // 	DF17	01	01
        emvParamAppUMSList[1]!!.append(EMVParamAppCaseA.TAG_VerNum_9F09, "0140")  // 	9F09	02	0140
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_FloorLimit_9F1B,
            "00000000"
        )  // 	9F1B	04	00000000
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG__9F5A,
            "A0000000038010"
        )  // 	9F5A	07	A0000000038010
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_CTLSCVMLimit_DF21,
            "000000000000"
        )  // 	DF21	06	000000000000
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_MaxTargetPercentage_DF16,
            "01"
        )  // 	DF16	01	01
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG__DF04,
            "000000000000"
        )  // 	DF04	06	000000000000
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_CTLSFloorLimit_DF19,
            "000000000000"
        )  // 	DF19	06	000000000000
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_AppTermCap_9F33,
            "E0F9C8"
        )  // 	9F33	03	E0F9C8
        emvParamAppUMSList[1]!!.append(0xDF1A, "000000000000")  // 	DF1A	06	000000000000
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_AppTermAddCap_9F40,
            "FF00F0A001"
        )  // 	9F40	05	FF00F0A001
        emvParamAppUMSList[1]!!.append(EMVParamAppCaseA.TAG_ASI_DF01, "00")  // 	DF01	01	00
        emvParamAppUMSList[1]!!.append(EMVParamAppCaseA.TAG__9F66, "26000080")  // 	9F66	04	26000080
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_AppTerminalType_9F35,
            "22"
        )  // 	9F35	01	22
        emvParamAppUMSList[1]!!.append(EMVParamAppCaseA.TAG__DF18, "01")  // 	DF18	01	01
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_TAC_Online_DF12,
            "D84004F800"
        )  // 	DF12	05	D84004F800
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_CountryCodeTerm_9F1A,
            "0156"
        )  // 	9F1A	02	0156
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_Threshold_DF15,
            "00000000"
        )  // 	DF15	04	00000000
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_TAC_Default_DF11,
            "D84004A800"
        )  // 	DF11	05	D84004A800
        emvParamAppUMSList[1]!!.append(
            EMVParamAppCaseA.TAG_TAC_Denial_DF13,
            "0010000000"
        )  // 	DF13	05	0010000000


        Log.d(tag, emvParamAppUMSList[1]!!.tlvString)

        isSuccess = false
        try {
            for (i in 0..1) {
                isSuccess = pboc.updateAID(
                    emvParamAppUMSList[i]!!.flagAppendRemoveClear,
                    emvParamAppUMSList[i]!!.aidType,
                    emvParamAppUMSList[i]!!.tlvString
                )

                if (isSuccess) {
                    Log.d(tag, "update AID success:${emvParamAppUMSList[i]!!.getComment()}")
                } else {
                    Log.d(tag, "updateAID false:${emvParamAppUMSList[i]!!.getComment()}")
                }
            }
        } catch (e: RemoteException) {
            e.printStackTrace()
        }

        // 2# way of setting the AID
        // given the AID string to set. You can change the EMVParamAppCaseA to check each Tag & Value, and modify the tag or value if need
        // hardcoding the AID string
        val AID_SmartCard = arrayOf(
            // Visa credit or debit	10 10
            "9F3303E020C8DF1A06000000012000" +
                    "9F0607A0000000031010" +
                    "9F40056F00F0F001DF010100DF2006009999999999DF14039F37049F660432004000DF1701015F2A020901DF1B060000000000009F350122DF1205FC60ACF8009F1B04000000009F1A020158DF2106009999999999DF160199DF150400049444DF1105FC6024A8009F08020140DF1906000000000000DF13050010000000",
            // Visa credit or debit	10 10
            ("9F0607A0000000031010" + "DF2006009999999999DF010100DF140111DF1701019F09020140DF180101DF120500000000009F1B0400000000DF160101DF150400000000DF1105C000000000DF19060000000000009F7B06000000000000DF13050000000000"),
            // Visa credit or debit	10 10
            ("9F0608A000000003101001" + "DF2006009999999999DF010100DF140111DF1701019F09020140DF180101DF1205D84000F8009F1B0400000000DF160101DF150400000000DF1105D84004A800DF19060000000000009F7B06000000000000DF13050010000000"),
            // Visa credit or debit	10 10
            ("9F0608A000000003101002" + "DF2006009999999999DF010100DF140111DF1701019F09020140DF180101DF1205D84000F8009F1B0400000000DF160101DF150400000000DF1105D84004A800DF19060000000000009F7B06000000000000DF13050010000000"),
            // Visa Electron	20 10
            ("9F0607A0000000032010" + "DF2006009999999999DF010100DF140111DF1701019F09020140DF180101DF1205D84000F8009F1B0400000000DF160101DF150400000000DF1105D84004A800DF19060000000000009F7B06000000000000DF13050010000000"),
            // MasterCard credit or debit	10 10
            ("9F0607A0000000041010" + "DF2006009999999999DF010100DF140111DF1701019F09020004DF180101DF1205F85080F8009F1B0400000000DF160101DF150400000000DF1105FC5080A000DF19060000000000009F7B06000000001000DF13050000400000"),
            // MasterCard(debit card)_	30 60
            ("9F0607A0000000043060" + "DF2006009999999999DF010100DF140111DF1701019F09020004DF180101DF1205F85080F8009F1B0400000000DF160101DF150400000000DF1105FC5080A000DF19060000000000009F7B06000000000000DF13050000400000"),
            // MasterCard
            ("9F0607A0000000044010" + "DF2006009999999999DF010100DF140111DF1701019F09020004DF180101DF1205F85080F8009F1B0400000000DF160101DF150400000000DF1105FC5080A000DF19060000000000009F7B06000000000000DF13050000400000"),
            // PBOC
            ("9F0608A000000333010103" + "DF2006009999999999DF010100DF14039F3704DF1701209F09020020DF180101DF1205DC4004F8009F1B0400000064DF160150DF150400000028DF1105DC4000A800DF19060000000000009F7B06000000100000DF13050010000000"),
            ("9F0608A000000333010101" + "DF2006009999999999DF010100DF14039F3704DF1701999F09020020DF180101DF1205DC4004F8009F1B0400000064DF160199DF150400000000DF1105DC4000A800DF19060000000000009F7B06000000100000DF13050010000000"),
            ("9F0608A000000333010106" + "DF2006009999999999DF010100DF14039F3704DF1701999F09020020DF180101DF1205DC4004F8009F1B0400000064DF160199DF150400000000DF1105DC4000A800DF19060000000000009F7B06000000100000DF13050010000000"),
            ("9F0608A000000333010102" + "DF2006009999999999DF010100DF14039F3704DF1701209F09020020DF180101DF1205DC4004F8009F1B0400000064DF160150DF150400000000DF1105DC4000A800DF19060000000000009F7B06000000100000DF13050010000000"),
            //
            ("9F0607A0000001523010" + "DF2006009999999999DF010100DF140111DF1701019F09020001DF180101DF1205D84004F8009F1B0400000000DF160101DF150400000000DF1105D84004A800DF19060000000000009F7B06000000000000DF13050010000000"),
            // JCB
            ("9F0607A0000000651010" + "DF2006009999999999DF010100DF14039F3704DF1701019F09020001DF180101DF1205FC60ACF8009F1B0400000000DF160101DF150400000000DF1105FC60242800DF19060000000000009F7B06000000000000DF13050010000000"),
            // American Express
            ("9F0606F00000002501" + "DF2006009999999999DF010100DF14039F3704DF1701009F09020001DF180100DF1205CC000000009F1B0400000000DF160101DF150400000000DF1105CC00000000DF19060000000000009F7B06000000100000DF13050000000000"),
            ("9F0606A00000002501" + "DF2006009999999999DF010100DF14039F3704DF1701999F09020020DF180101DF1205CC000080009F1B0400000000DF160199DF150400000000DF1105CC00000000DF19060000000000009F7B06000010000000DF13050000000000"),
            ("9F0607A0000003241010" + "DF2006009999999999DF010100DF14039F3704DF1701999F09020001DF180101DF1205FCE09CF8009F1B0400000000DF160199DF150400000000DF1105DC00002000DF19060000000000009F7B06000000000000DF13050010000000"),
            ("9F0605A000000000" + "DF2006009999999999DF010100DF140111DF1701019F09020001DF180100DF120500000000009F1B0400000064DF160101DF150400000001DF11050000000000DF19060000000000009F7B06000000000100DF13050000000000")
        )
        val AID_CTLS_Card = arrayOf(
            // Visa, Plus	80 10
            ("9F0607A0000000038010" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601005F2A020156DF1701019F09020140DF180101DF1205D84004F8009F1B04000000009F1A020156DF2106000000000000DF160101DF150400000000DF1105D84004A800DF0406000000000000DF1906000000000000DF13050010000000"),
            // Visa credit or debit	10 10
            ("DF1A06000000012000" +
                    "9F0607A0000000031010" +
                    "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1B06000000000000DF1701019F09020140DF180101DF1205D84004F8009F1B04000000009F1A0201569F5A054001560156DF2106000000000000DF160101DF150400000000DF1105D84004A800DF0406000000000000DF1906000000000000DF13050010000000"),
            // Visa credit or debit	10 10
            ("DF1A06000000012000" +
                    "9F0608A000000003101001" +
                    "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1B06000000000000DF1701019F09020140DF180101DF1205D84004F8009F1B04000000009F1A0201569F5A054001560156DF2106000000000000DF160101DF150400000000DF1105D84004A800DF0406000000000000DF1906000000000000DF13050010000000"),
            ("DF1A06000000012000" +
                    "9F0608A000000003101002" +
                    "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1B06000000000000DF1701019F09020140DF180101DF1205D84004F8009F1B04000000009F1A0201569F5A054001560156DF2106000000000000DF160101DF150400000000DF1105D84004A800DF0406000000000000DF1906000000000000DF13050010000000"),
            // JCB
            ("9F0607A0000000651010" + "DF0306009999999999DF2006000999999999DF010100DF14039F3704DF170100DF180101DF1205FFFFFFFFFF9F1B04000020009F150400000000DF2106000000100000DF150400000000DF160100DF110590400080009F0802008CDF19060000001000009F7B06000000000000DF13050000000000"),
            // MasterCard credit or debit	10 10
            ("9F0607A0000000041010" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601005F2A020156DF1701019F09020004DF180101DF1205A0109C98009F1B043B9ACA009F1A020156DF2106000000001000DF160101DF150400000000DF1105A4109C0000DF0406000000000000DF1906000000000000DF13055C40000000"),
            //
            ("9F0607A0000001523010" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601A65F2A020156DF1701019F09020001DF180101DF1205D84004F8009F1B04000000009F1A020156DF2106000000000100DF160101DF150400000000DF1105D84004A800DF0406000000000000DF1906000000000000DF13050010000000"),
            // PBOC
            ("9F0608A000000333010102" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1701999F09020020DF180101DF1205DC4004F8009F1B04000000649F1A020156DF2106000000100000DF160199DF150400000000DF1105DC4000A800DF0406000000000000DF1906000000000000DF13050010000000"),
            ("9F0608A000000333010101" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1701999F09020020DF180101DF1205DC4004F8009F1B04000000649F1A020156DF2106000000100000DF160199DF150400000000DF1105DC4000A800DF0406000000000000DF1906000000000000DF13050010000000"),
            ("9F0608A000000333010106" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1701999F09020020DF180101DF1205DC4004F8009F1B04000000649F1A020156DF2106000000100000DF160199DF150400000000DF1105DC4000A800DF0406000000000000DF1906000000000000DF13050010000000"),
            // American Express
            ("9F0606F00000002501" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601225F2A020156DF1701009F09020001DF180100DF1205CC000000009F1B04000000009F1A020156DF2106000000100000DF160101DF150400000000DF1105CC00000000DF0406000000000501DF1906000000000000DF13050000000000"),
            ("9F0606A00000002501" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1701999F09020020DF180101DF1205C4000000009F1B04000000009F1A020156DF2106000010000000DF160199DF150400000000DF1105C400000000DF0406000000000000DF1906000000000000DF13050000000000"),
            ("9F0607A0000003241010" + "DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1701999F09020001DF180101DF1205FCE09CF8009F1B04000000009F1A020156DF2106000000000000DF160199DF150400000000DF1105DC00002000DF0406000000000000DF1906000000000000DF13050010000000"),
            ("DF1A06000000012000" +
                    "9F0607A00000000" +
                    "32010DF0306009999999999DF2006009999999999DF010100DF14039F37049F6601265F2A020156DF1B06000000000000DF1701019F09020140DF180101DF1205D84004F8009F1B04000000009F1A0201569F5A054001560156DF2106000000000000DF160101DF150400000000DF1105D84004A800DF0406000000000000DF1906000000000000DF13050010000000")
        )
        var aidList = AID_SmartCard
        var aidType = ConstIPBOC.updateAID.aidType.smart_card
        for (i in 0..1) {
            for (aid in aidList) {
                isSuccess = false
                if (aid.length == 0) {
                    continue
                }
                try {
                    val emvParamAppUMS = EMVParamAppCaseA()

                    emvParamAppUMS.setFlagAppendRemoveClear(ConstIPBOC.updateAID.operation.append)
                    emvParamAppUMS.setAidType(aidType)
                    emvParamAppUMS.append(aid)
                    isSuccess = pboc.updateAID(
                        emvParamAppUMS.getFlagAppendRemoveClear(),
                        emvParamAppUMS.getAidType(),
                        emvParamAppUMS.tlvString
                    )
                } catch (e: RemoteException) {
                    e.printStackTrace()
                }


                if (isSuccess) {
                    Log.d(tag, "update AID success")
                } else {
                    Log.d(tag, "updateAID false")
                }
            }
            aidList = AID_CTLS_Card
            aidType = ConstIPBOC.updateAID.aidType.contactless
        }
    }
}
package id.mikaapp.sdk.service.cardpayment

import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Message
import id.mikaapp.sdk.enums.CardTransactionServiceLifeCycle

internal abstract class DeviceCardTransactionService(
    protected val context: Context,
    internal val listener: DeviceCardTransactionServiceListener
) {

    companion object {
        internal const val ERROR_DEVICE_NOT_SUPPORTED_CODE = -2901
        internal const val ERROR_DEVICE_NOT_SUPPORTED_MESSAGE = "Device not supported"
        internal const val ERROR_SERVICE_NOT_CONNECTED_CODE = -2902
        internal const val ERROR_SERVICE_NOT_CONNECTED_MESSAGE = "Service not connected"
        internal const val ERROR_CARD_INFORMATION_NOT_FOUND_CODE = -2903
        internal const val ERROR_CARD_INFORMATION_NOT_FOUND_MESSAGE = "Card information not found"

        protected const val PROCESS_INITIALIZE = 0

        protected const val PROCESS_START_READ_CARD = 1

        protected const val PROCESS_FIND_MAGNETIC_CARD = 20
        protected const val PROCESS_FIND_IC_CARD = 21
        protected const val PROCESS_FIND_RF_CARD = 22

        protected const val PROCESS_START_EMV = 3

        protected const val PROCESS_EMV_CONFIRM_CARD_NO = 4

        protected const val PROCESS_REQUEST_PIN_PAD = 50
        protected const val PROCESS_REQUEST_SIGNATURE = 51

        protected const val PROCESS_PIN_PAD_BLOCK_RECEIVED = 6

        protected const val PROCESS_REQUEST_ONLINE_PROCESS = 7

        protected const val PROCESS_TRANSACTION_RESULT = 8

        protected const val PROCESS_ERROR = -1
        protected const val PROCESS_ERROR_READING_CARD = -11
    }

    var isReady = false

    //Device Card Transaction Service process handler on main thread
    private val processHandler = object : Handler(context.mainLooper) {
        override fun handleMessage(msg: Message) {
            super.handleMessage(msg)
            when (msg.what) {
                PROCESS_INITIALIZE -> handleProcessInitialize()

                PROCESS_START_READ_CARD -> handleProcessStartReadCard(msg.arg1, msg.obj as Array<CardType>)

                PROCESS_FIND_MAGNETIC_CARD -> handleProcessFindMagneticCard(msg.obj as Bundle?)
                PROCESS_FIND_IC_CARD -> handleProcessFindICCard(msg.obj as String?)
                PROCESS_FIND_RF_CARD -> handleProcessFindRFCard(msg.obj as String?)

                PROCESS_START_EMV -> handleProcessStartEmv(msg.arg1, msg.obj as CardType)

                PROCESS_EMV_CONFIRM_CARD_NO -> handleProcessEMVConfirmCardNumber(msg.obj as String)

                PROCESS_REQUEST_PIN_PAD -> {
                    handleProcessRequestPinPad(msg.obj as Boolean, msg.arg1)
                }
                PROCESS_REQUEST_SIGNATURE -> handleProcessRequestSignature()

                PROCESS_PIN_PAD_BLOCK_RECEIVED -> handleProcessPinPadResult(msg.obj as PinPadResult)

                PROCESS_REQUEST_ONLINE_PROCESS -> handleProcessRequestOnlineProcess()

                PROCESS_TRANSACTION_RESULT -> handleProcessTransactionResult(msg.arg1, msg.obj as String?)

                PROCESS_ERROR -> handleProcessError(msg.arg1, msg.obj as String?)
                PROCESS_ERROR_READING_CARD -> handleProcessErrorReadingCard(msg.arg1, msg.obj as String?)
            }
        }
    }

    abstract fun toMikaCardType(cardType: Int): CardType
    abstract fun toDeviceCardType(cardType: CardType): Int

    fun initialize() {
        startProcessInitialize()
    }

    fun startReadCard(timeout: Int, cardType: Array<CardType>) {
        startProcessStartReadCard(timeout, cardType)
    }

    abstract fun stopTransactionProcess(currentLifeCycle: CardTransactionServiceLifeCycle)
    abstract fun getTLVDataHexString(vararg desiredTagList: String): String?

    protected fun startProcessInitialize() {
        processHandler.obtainMessage(PROCESS_INITIALIZE).sendToTarget()
    }

    protected fun startProcessStartReadCard(timeout: Int, cardType: Array<CardType>) {
        processHandler.obtainMessage(PROCESS_START_READ_CARD, timeout, 0, cardType).sendToTarget()
    }

    protected fun startProcessErrorReadingCard(code: Int, message: String?) {
        processHandler.obtainMessage(PROCESS_ERROR_READING_CARD, code, 0, message).sendToTarget()
    }

    protected fun startProcessFindMagneticCard(trackData: Bundle?) {
        processHandler.obtainMessage(PROCESS_FIND_MAGNETIC_CARD, trackData).sendToTarget()
    }

    protected fun startProcessFindICCard(atrData: String?) {
        processHandler.obtainMessage(PROCESS_FIND_IC_CARD, atrData).sendToTarget()
    }

    protected fun startProcessFindRFCard(atrData: String?) {
        processHandler.obtainMessage(PROCESS_FIND_RF_CARD, atrData).sendToTarget()
    }

    protected fun startProcessStartEMV(amount: Int, cardType: CardType) {
        processHandler.obtainMessage(PROCESS_START_EMV, amount, 0, cardType).sendToTarget()
    }

    protected fun startProcessEMVConfirmCardNumber(cardNumber: String) {
        processHandler.obtainMessage(PROCESS_EMV_CONFIRM_CARD_NO, cardNumber).sendToTarget()
    }

    protected fun startProcessRequestPinPad(isOnlinePin: Boolean, retryTimes: Int) {
        processHandler.obtainMessage(PROCESS_REQUEST_PIN_PAD, retryTimes, 0, isOnlinePin).sendToTarget()
    }

    protected fun startProcessPinPadResult(result: PinPadResult) {
        processHandler.obtainMessage(PROCESS_PIN_PAD_BLOCK_RECEIVED, result).sendToTarget()
    }

    protected fun startProcessRequestSignature() {
        processHandler.obtainMessage(PROCESS_REQUEST_SIGNATURE).sendToTarget()
    }

    protected fun startProcessOnlineProcess() {
        processHandler.obtainMessage(PROCESS_REQUEST_ONLINE_PROCESS).sendToTarget()
    }

    protected fun startProcessOnTransactionResult(code: Int, message: String?) {
        processHandler.obtainMessage(PROCESS_TRANSACTION_RESULT, code, 0, message).sendToTarget()
    }

    protected abstract fun handleProcessInitialize()
    protected abstract fun handleProcessStartReadCard(timeout: Int, cardType: Array<CardType>)
    protected abstract fun handleProcessErrorReadingCard(code: Int, message: String?)
    protected abstract fun handleProcessFindMagneticCard(trackData: Bundle?)
    protected abstract fun handleProcessFindICCard(atrData: String?)
    protected abstract fun handleProcessFindRFCard(atrData: String?)
    protected abstract fun handleProcessStartEmv(amount: Int, cardType: CardType)
    protected abstract fun handleProcessEMVConfirmCardNumber(cardNumber: String)
    protected abstract fun handleProcessRequestPinPad(isOnlinePin: Boolean, retryTimes: Int)
    protected abstract fun handleProcessRequestSignature()
    protected abstract fun handleProcessPinPadResult(result: PinPadResult)
    protected abstract fun handleProcessRequestOnlineProcess()
    protected abstract fun handleProcessTransactionResult(code: Int, message: String?)
    protected abstract fun handleProcessError(code: Int, message: String?)

}
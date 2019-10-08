package id.mikaapp.mika.service.edc

import android.content.Context
import android.content.ServiceConnection
import android.os.Handler
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.OnLifecycleEvent
import id.mikaapp.edcdeviceservice.CardType
import id.mikaapp.edcdeviceservice.PinPadResult
import id.mikaapp.edcdeviceservice.PrintOperation
import id.mikaapp.edcdeviceservice.ReadCardResult
import org.koin.core.KoinComponent
import org.koin.core.inject

abstract class EdcDevice : LifecycleObserver, KoinComponent {

    protected val context: Context by inject()
    protected val uiHandler = Handler(context.mainLooper)
    protected abstract val connection: ServiceConnection
    protected abstract var bound: Boolean
    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    abstract fun stopService()

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    abstract fun startService(lifecycleOwner: LifecycleOwner)

    protected abstract fun isAvailable(): Boolean
    abstract fun beep(duration: Int = 150)
    abstract fun startReadCard(
        cardTypeToRead: Array<CardType>,
        timeout: Int,
        onResult: (ReadCardResult) -> Unit
    )

    abstract fun stopReadCard()
    abstract fun startEmvProcess(
        cardType: CardType,
        amount: Int,
        onConfirmCardNumber: (pan: String, proceed: () -> Unit) -> Unit,
        onRequestInputPIN: (isOnlinePin: Boolean, retryTimes: Int, proceed: (pinBlock: ByteArray?) -> Unit) -> Unit,
        onRequestOnlineProcess: (proceed: () -> Unit) -> Unit,
        onTransactionResult: (result: Int) -> Unit
    )

    abstract fun stopEmvProcess()

    abstract fun startPINPad(
        isOnlinePIN: Boolean, timeout: Int, pan: String,
        onInput: (length: Int, key: Int) -> Unit,
        onResult: (result: PinPadResult) -> Unit
    )

    abstract fun print(block: PrintOperation.() -> Unit)
}
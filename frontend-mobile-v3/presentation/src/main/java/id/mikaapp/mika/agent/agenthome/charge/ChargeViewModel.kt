package id.mikaapp.mika.agent.agenthome.charge

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.App
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetListItemUiModel.Acquirer
import id.mikaapp.mika.ext.currencyFormatted
import id.mikaapp.mika.ext.liveData
import id.mikaapp.mika.liveevent.LiveEvent
import id.mikaapp.sdk.enums.CardPaymentMethod
import id.mikaapp.sdk.enums.PaymentMethod
import org.javia.arity.Symbols
import org.javia.arity.SyntaxException

/**
 * Created by grahamdesmon on 18/04/19.
 */

class ChargeViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val loading = MutableLiveData<Boolean>()
    val loadingState: LiveData<Boolean> = loading

    private val warning = LiveEvent<String>()
    val warningState = warning.liveData

    private val equationText = MutableLiveData<String>()
    val equationTextState: LiveData<String> = equationText

    private val inputText = MutableLiveData<String>()
    val inputTextState: LiveData<String> = inputText

    private val canPay = MutableLiveData<Boolean>()
    val canPayState: LiveData<Boolean> = canPay

    private val startQrTransaction = LiveEvent<QrPaymentActivityPayload>()
    val startQrTransactionState = startQrTransaction.liveData

    private val startCardTransaction = LiveEvent<CardPaymentActivityPayload>()
    val startCardTransactionState = startCardTransaction.liveData

    private val showAcquirers = LiveEvent<Boolean>()
    val showAcquirersState = showAcquirers.liveData

    private var amount: Int = 0
    private val symbols = Symbols()

    init {
        canPay.value = false
    }

    fun onPayClicked() {
        showAcquirers.value = true
    }

    fun onAcquirerSelected(acquirer: Acquirer) {
        if (amount < acquirer.minimumAmount) {
            warning.value = "Minimum Pembayaran ${acquirer.name} ${acquirer.minimumAmount.currencyFormatted}"
        } else {
            if (acquirer.paymentMethod != PaymentMethod.EWallet)
                startCardTransaction.value = CardPaymentActivityPayload(
                    amount,
                    acquirer.id,
                    if (acquirer.paymentMethod == PaymentMethod.Credit) CardPaymentMethod.Credit else CardPaymentMethod.Debit,
                    acquirer.id
                )
            else startQrTransaction.value = QrPaymentActivityPayload(amount = amount, acquirerID = acquirer.id)
            equationText.value = ""
            processInput("0")
        }
    }

    fun processInput(input: String) {
        if (input == getApplication<App>().resources.getString(R.string.button_backspace)) {
            // Remove last index of equation
            equationText.value?.let { eq ->
                if (eq.isNotEmpty()) {
                    equationText.value = eq.substring(0, eq.length - 1)
                }
            }
        } else if (getApplication<App>().resources.getString(R.string.calc_sign).contains(input)) {
            // Added calculation input, do calculation
            val num = input[0]
            if (num.toInt() < 48 || num.toInt() > 57) {
                equationText.value?.let { eq ->
                    if (eq.isNotEmpty()) {
                        if (getApplication<App>().resources.getString(R.string.calc_sign).contains(eq[eq.length - 1] + "")) {
                            equationText.value = eq.substring(0, eq.length - 1)
                        }
                        equationText.value = "$eq$input"
                    }
                }
            }
        } else {
            equationText.value = "${equationText.value ?: ""}$input"
        }
        refreshInput()
    }

    private fun refreshInput() {
        equationText.value?.let {
            var eq = it
            if (eq.isNotEmpty()) {
                if (getApplication<App>().resources.getString(R.string.calc_sign).contains(eq[eq.length - 1] + "")) {
                    eq = eq.substring(0, eq.length - 1)
                }
                try {
                    amount = symbols.eval(eq).toInt()
                    canPay.value = amount > 0
                    inputText.value = amount.currencyFormatted

                } catch (e: SyntaxException) {
                    e.printStackTrace()
                }
            } else {
                inputText.value = 0.currencyFormatted
                canPay.value = false
            }
        }
    }
}
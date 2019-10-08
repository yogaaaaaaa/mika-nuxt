package id.mikaapp.mika.agent.agenthome.charge


import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import id.mikaapp.edcdeviceservice.Edc
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.cardpayment.CardPaymentActivity
import id.mikaapp.mika.agent.qrpayment.QrPaymentActivity
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetFragment
import id.mikaapp.mika.customview.CustomDialog
import id.mikaapp.mika.ext.observe
import id.mikaapp.mika.ext.showToast
import kotlinx.android.synthetic.main.fragment_charge.*
import org.koin.android.viewmodel.ext.android.viewModel

class ChargeFragment : Fragment() {
    private val viewModel: ChargeViewModel by viewModel()
    private val dialog: Dialog by lazy {
        CustomDialog.progressDialog(requireContext(), getString(R.string.loading), false)
    }
    private val acquirerFragment by lazy {
        SelectAcquirerBottomSheetFragment("Pilih Metode Pembayaran").also {
            it.setOnAcquirerSelected { acquirer ->
                Log.d("TESTTESTTEST", "Acquirer Selected: ${acquirer.name}")
                viewModel.onAcquirerSelected(acquirer)
            }
        }
    }

    private val payActiveBackground by lazy {
        ContextCompat.getDrawable(
            requireContext(),
            R.drawable.agent_charge_pay_button_active_background
        )
    }
    private val payInactiveBackground by lazy {
        ContextCompat.getDrawable(
            requireContext(),
            R.drawable.agent_charge_pay_button_deactive_background
        )
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Edc.device.startService(this)
        return inflater.inflate(R.layout.fragment_charge, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        listOf(
            chargeButton0,
            chargeButton1,
            chargeButton2,
            chargeButton3,
            chargeButton4,
            chargeButton5,
            chargeButton6,
            chargeButton7,
            chargeButton8,
            chargeButton9,
            chargeButtonAddition,
            chargeButtonSubtraction,
            chargeButtonMultiplication,
            chargeButtonDivision,
            chargeButtonPercent
        ).forEach { button ->
            button.setOnClickListener {
                viewModel.processInput(button.text.toString())
                Edc.device.beep()
            }
        }
        chargeButtonDelete.setOnClickListener {
            Edc.device.beep()
            viewModel.processInput(getString(R.string.button_backspace))
        }
        chargeButtonPay.setOnClickListener {
            Edc.device.beep()
            viewModel.onPayClicked()
        }
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        observe(viewModel.loadingState) { if (it) dialog.show() else dialog.dismiss() }
        observe(viewModel.warningState) { it?.let { requireContext().showToast(it) } }
        observe(viewModel.canPayState) {
            chargeButtonPay.apply {
                isEnabled = it
                background = if (it) payActiveBackground else payInactiveBackground
            }
        }
        observe(viewModel.equationTextState) { chargeTextViewEquation.text = it }
        observe(viewModel.inputTextState) { chargeTextViewInput.text = it }
        observe(viewModel.startQrTransactionState) { it?.let { startQrActivity(it) } }
        observe(viewModel.startCardTransactionState) { it?.let { startCardActivity(it) } }
        observe(viewModel.showAcquirersState) {
            if (it == null) return@observe
            if (it) if (!acquirerFragment.isAdded) acquirerFragment.show(
                childFragmentManager,
                "dialog"
            )
            else acquirerFragment.dismiss()
        }
    }

    private fun startQrActivity(payload: QrPaymentActivityPayload) {
        val intent = QrPaymentActivity.newIntent(
            requireContext(), payload.amount, payload.acquirerID
        )
        startActivity(intent)
    }

    private fun startCardActivity(payload: CardPaymentActivityPayload) {
        startActivity(
            CardPaymentActivity.newIntent(
                requireContext(), payload.amount, payload.acquirerID, payload.cardPaymentMethod
            )
        )
    }
}

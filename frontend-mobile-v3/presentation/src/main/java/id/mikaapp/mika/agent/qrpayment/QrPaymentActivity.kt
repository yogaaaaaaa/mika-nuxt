package id.mikaapp.mika.agent.qrpayment

import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenttransactiondetail.AgentTransactionDetail
import id.mikaapp.mika.agent.cardpayment.CardPaymentActivity
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetFragment
import id.mikaapp.mika.customview.CustomDialog
import id.mikaapp.mika.ext.*
import id.mikaapp.mika.service.TransactionBroadcastReceiver
import id.mikaapp.sdk.models.TransactionDetail
import kotlinx.android.synthetic.main.activity_qr_payment.*
import org.koin.android.viewmodel.ext.android.viewModel

class QrPaymentActivity : AppCompatActivity() {

    private val viewModel: QrPaymentViewModel by viewModel()
    private var loadingDialog: Dialog? = null
    private val transactionBroadcastReceiver by lazy {
        TransactionBroadcastReceiver(this, showNotification = false) {
            viewModel.receiveTransactionBroadcast(it)
        }
    }
    private var superBackPressed: (() -> Unit)? = null
    private val roundedCountDownFragment = RoundedCountDownFragment()
    private val createQrTransactionFragment = CreateQrTransactionFragment()
    private val amount by lazy { intent.getIntExtra(AMOUNT, 0) }
    private val acquirerFragment by lazy {
        SelectAcquirerBottomSheetFragment("Pilih Metode Pembayaran").also {
            it.setOnAcquirerSelected { acquirer ->
                viewModel.changeAcquirer(acquirer, amount)
            }
        }
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_payment)
        setSupportActionBar(qrPaymentToolbar)
        supportActionBar?.apply { setDisplayHomeAsUpEnabled(true);setDisplayHomeAsUpEnabled(true) }
        supportFragmentManager.beginTransaction()
            .replace(R.id.qrPaymentFragmentContainer, createQrTransactionFragment)
            .replace(R.id.qrPaymentCountDownContainer, roundedCountDownFragment)
            .commitNow()
        createQrTransactionFragment.setOnTransactionCreated { (transactionID, expirySecond) ->
            viewModel.loadData(transactionID)
            roundedCountDownFragment.start(expirySecond.toLong())
        }
        qrPaymentSuccess.setOnClickListener { viewModel.changeTransactionStatus("success") }
        qrPaymentFailed.setOnClickListener { viewModel.changeTransactionStatus("failed") }
        qrPaymentUpdateStatus.setOnClickListener { viewModel.updateStatus() }
        qrPaymentSelectAnotherAcquirer.setOnClickListener {
            acquirerFragment.show(
                supportFragmentManager,
                "Select Another Method"
            )
        }
        roundedCountDownFragment.setOnFinish { showToast("Timeout"); finish() }
        createQrTransactionFragment.createTransaction(intent.getStringExtra(ACQUIRER_ID), amount)
        observe(viewModel.transactionState) { updateUI(it) }
        observe(viewModel.merchantNameState) { qrPaymentMerchantName.text = it ?: "" }
        observe(viewModel.transactionSuccessState) {
            transactionBroadcastReceiver.stop()
            startActivity(AgentTransactionDetail.newIntent(this, it))
            finish()
        }
        observe(viewModel.transactionCancelledState) { if (it) superBackPressed?.invoke() }
        observe(viewModel.loadingState) {
            if (it == null) loadingDialog?.dismiss()
            else loadingDialog = CustomDialog.progressDialog(this, it, false).apply { show() }
        }
        observe(viewModel.warningState) { it?.let { showToast(it) } }
        observe(viewModel.acquirerChangedQRState) {
            it?.let { createQrTransactionFragment.createTransaction(it, amount) }
        }
        observe(viewModel.acquirerChangedCardState) {
            it?.let { startActivity(CardPaymentActivity.newIntent(this, amount, it.first, it.second)); finish() }
        }
        transactionBroadcastReceiver.start()
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed(); return true
    }

    override fun onBackPressed() {
        superBackPressed = { super.onBackPressed() }
        viewModel.cancelTransaction()
    }

    private fun updateUI(data: TransactionDetail) {
        qrPaymentDate.text = data.createdAt.mikaDate.toString(DateFormat.DayMonthYear)
        qrPaymentAmount.text = data.amount.currencyFormatted
        qrPaymentAcquirerName.text = data.acquirer.acquirerType.name
    }

    override fun onDestroy() {
        transactionBroadcastReceiver.stop()
        super.onDestroy()
    }


    companion object {
        private const val AMOUNT: String = "AMOUNT"
        private const val ACQUIRER_ID: String = "ACQUIRER_ID"

        fun newIntent(
            context: Context,
            amount: Int,
            acquirerID: String
        ): Intent {
            val i = Intent(context, QrPaymentActivity::class.java)
            i.putExtra(AMOUNT, amount)
            i.putExtra(ACQUIRER_ID, acquirerID)
            return i
        }
    }
}

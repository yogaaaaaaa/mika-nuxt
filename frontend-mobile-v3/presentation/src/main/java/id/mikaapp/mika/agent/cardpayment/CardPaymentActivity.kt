package id.mikaapp.mika.agent.cardpayment

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenttransactiondetail.AgentTransactionDetail
import id.mikaapp.mika.agent.qrpayment.QrPaymentActivity
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetFragment
import id.mikaapp.mika.customview.CustomDialog
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.ext.currencyFormatted
import id.mikaapp.mika.ext.observe
import id.mikaapp.mika.ext.showToast
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.enums.CardPaymentMethod
import id.mikaapp.sdk.enums.PaymentMethod
import id.mikaapp.sdk.service.cardpayment.CardPaymentException
import id.mikaapp.sdk.service.cardpayment.CardTransactionServiceListener
import id.mikaapp.sdk.service.cardpayment.CardType
import kotlinx.android.synthetic.main.activity_card_payment.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel
import org.koin.core.parameter.parametersOf

@SuppressLint("LongLogTag")
class CardPaymentActivity : AppCompatActivity(), CardTransactionServiceListener {

    private val cardPaymentMethod: CardPaymentMethod by lazy {
        intent.getSerializableExtra(
            CARD_PAYMENT_METHOD
        ) as CardPaymentMethod
    }
    private val amount: Int by lazy { intent.getIntExtra(AMOUNT, 0) }
    private val loadingDialog by lazy {
        CustomDialog.progressDialog(
            this,
            "Processing Transaction",
            false
        )
    }
    private val acquirerBottomSheetFragment =
        SelectAcquirerBottomSheetFragment("Pilih Metode Lainnya")

    override fun onReady() {
        Log.d(tag, "onReady")
        MikaSdk.instance.cardTransactionService.start()
    }

    override fun onRequestReadCardStep(
        proceed: (readTimeout: Int, cardTypeToRead: Array<CardType>) -> Unit
    ) {
        Log.d(tag, "onRequestReadCardStep")
        proceed(60, arrayOf(CardType.IC, CardType.Magnetic))
    }

    override fun onErrorReadingCard(
        code: Int, message: String?,
        retry: (readTimeout: Int, cardTypeToRead: Array<CardType>) -> Unit
    ) {
        Log.d(tag, "onErrorReadingCard: $code $message")
        showToast(message ?: "Error reading card")
//        retry(60, arrayOf(CardType.Magnetic))
    }

    override fun onCardAttached(cardType: CardType) {
        Log.d(tag, "onCardAttached: $cardType")
    }

    override fun onRequestStartEMVProcess(proceed: (amount: Int) -> Unit) {
        proceed(amount)
    }

    override fun onCardPanMaskedReceive(panMasked: String) {
        Log.d(tag, "onCardPanMaskedReceive: $panMasked")
        cardPaymentCardImageNumber.text = panMasked
    }

    override fun onRequestShowPinPadStep(proceed: (timeout: Int) -> Unit, skip: (() -> Unit)?) {
        Log.d(tag, "onRequestShowPinPadStep")
        if (skip != null && cardPaymentMethod == CardPaymentMethod.Credit) {
            AlertDialog.Builder(this)
                .setMessage("PinPad?")
                .setPositiveButton("YES") { _, _ -> proceed(60) }
                .setNegativeButton("NO") { _, _ -> skip() }
                .setCancelable(false)
                .show()
        } else {
            proceed(60)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed(); return true
    }

    override fun onRequestSignature(proceed: (signatureData: String) -> Unit) {
        signatureBottomSheetFragment.setOnSubmit { signatureBase64, signatureBitmap ->
            viewModel.signatureSubmit(signatureBitmap)
            proceed(signatureBase64)
        }
        signatureBottomSheetFragment.show(supportFragmentManager, "signatureBottomSheetFragment")
    }

    override fun onStartOnlineProcess(
        proceed: (
            acquirerID: String, amount: Int, locationLat: String?, locationLong: String?,
            cardPaymentMethod: CardPaymentMethod
        ) -> Unit
    ) {
        Log.d(tag, "onStartOnlineProcess")
        if (!loadingDialog.isShowing) loadingDialog.show()
        proceed(
            acquirerID,
            amount,
            localPersistentDataSource.latitude,
            localPersistentDataSource.longitude,
            cardPaymentMethod
        )
    }

    override fun onTransactionResult(code: Int, message: String?) {
        if (loadingDialog.isShowing) loadingDialog.dismiss()
        Log.d(tag, "onTransactionResult: [$code] $message")
        if (code == 0) {
            viewModel.cardPaymentSuccess(message!!)
            startActivity(AgentTransactionDetail.newIntent(this, message)); finish()
        } else {
            showToast(message ?: "Error Processing Transaction")
            MikaSdk.instance.cardTransactionService.stop()
            finish()
        }
    }

    override fun onDisconnected() {
        Log.d(tag, "onDisconnected")
    }

    override fun onError(exception: CardPaymentException) {
        if (loadingDialog.isShowing) loadingDialog.dismiss()
        showToast(exception.localizedMessage, Toast.LENGTH_LONG)
        Log.d(tag, "onError: $exception")
        onBackPressed()
    }

    private val tag = "MikaApp CardPaymentActivity"

    private val viewModel: CardPaymentViewModel by viewModel {
        parametersOf(
            intent.getIntExtra(AMOUNT, 0),
            intent.getSerializableExtra(CARD_PAYMENT_METHOD) as CardPaymentMethod
        )
    }
    private val localPersistentDataSource: LocalPersistentDataSource by inject()
    private val signatureBottomSheetFragment = SignatureBottomSheetFragment()

    private val acquirerID: String by lazy { intent.getStringExtra(ACQUIRER_ID) }

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_card_payment)

        setSupportActionBar(cardPaymentToolbar)
        supportActionBar?.apply { setDisplayHomeAsUpEnabled(true);setDisplayHomeAsUpEnabled(true) }

        observe(viewModel.dateState) { cardPaymentDate.text = it }
        observe(viewModel.merchantNameState) { cardPaymentMerchantName.text = it ?: "N/A" }
        observe(viewModel.cardTypeState) { cardType ->
            cardPaymentTitle.text = cardType
            cardPaymentActionText.text = "Silakan Masukkan ${cardType.capitalize()} anda"
            cardPaymentCardImageType.text = cardType.capitalize()
        }
        observe(viewModel.amountState) { cardPaymentAmount.text = it.currencyFormatted }
        acquirerBottomSheetFragment.setOnAcquirerSelected {
            if (it.paymentMethod.asCardPaymentMethod == this.cardPaymentMethod) return@setOnAcquirerSelected
            MikaSdk.instance.cardTransactionService.stop()
            if (it.paymentMethod == PaymentMethod.EWallet) {
                startActivity(QrPaymentActivity.newIntent(this, amount, it.id))
            } else {
                startActivity(
                    newIntent(
                        this,
                        amount,
                        it.id,
                        it.paymentMethod.asCardPaymentMethod!!
                    )
                )
            }
            finish()
        }
        cardPaymentSelectAnotherAcquirer.setOnClickListener {
            acquirerBottomSheetFragment.show(supportFragmentManager, "acquirerBottomSheetFragment")
        }
        MikaSdk.instance.cardTransactionService.setListener(this)
        viewModel.start()
    }

    override fun onBackPressed() {
        MikaSdk.instance.cardTransactionService.stop()
        super.onBackPressed()
    }

    companion object {
        private const val AMOUNT: String = "AMOUNT"
        private const val ACQUIRER_ID = "ACQUIRER_ID"
        private const val CARD_PAYMENT_METHOD = "CARD_PAYMENT_METHOD"

        fun newIntent(
            context: Context,
            amount: Int,
            acquirerID: String,
            cardPaymentMethod: CardPaymentMethod
        ) =
            Intent(context, CardPaymentActivity::class.java).apply {
                putExtra(AMOUNT, amount);putExtra(ACQUIRER_ID, acquirerID); putExtra(
                CARD_PAYMENT_METHOD,
                cardPaymentMethod
            )
            }
    }
}

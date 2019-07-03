package id.mikaapp.mika.agent.cardpayment

import android.app.Dialog
import androidx.lifecycle.Observer
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.os.CountDownTimer
import android.os.Handler
import androidx.core.content.ContextCompat
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import android.util.Base64
import android.view.View
import android.widget.*
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.acquirer.AcquirerFragment
import id.mikaapp.mika.agent.qrpayment.QrPaymentActivity
import id.mikaapp.mika.agent.transactiondetail.TransactionDetailActivity
import id.mikaapp.mika.utils.CustomDialog
import id.mikaapp.mika.utils.DateUtil
import id.mikaapp.mika.utils.NumberUtil
import id.mikaapp.mika.utils.StripeUtil
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.StartSunmiPayServiceCallback
import id.mikaapp.sdk.models.Acquirer
import jp.wasabeef.blurry.Blurry
import kotlinx.android.synthetic.main.activity_card_payment.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel
import java.io.ByteArrayOutputStream
import java.util.*
import java.util.concurrent.TimeUnit

class CardPaymentActivity : AppCompatActivity(), View.OnClickListener, AcquirerFragment.OnAcquirerSelected,
    PinFragment.OnOkClickListener, SignatureFragment.OnContinueClickListener {

    val mikaSdk: MikaSdk by inject()
    val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    private val viewModel: CardPaymentViewModel by viewModel()
    private lateinit var toolbar: Toolbar
    private lateinit var textViewTitle: TextView
    private lateinit var textViewDate: TextView
    private lateinit var textViewOutlet: TextView
    private lateinit var textViewCardNumber: TextView
    private lateinit var textViewType: TextView
    private lateinit var lytValid: View
    private lateinit var textViewValid: TextView
    private lateinit var textViewMessage: TextView
    private lateinit var textViewCardType: TextView
    private lateinit var textViewAmount: TextView
    private lateinit var btnChoosePayment: Button
    private lateinit var btnSignature: Button
    private lateinit var btnPin: Button
    private lateinit var imageViewCardType: ImageView
    private lateinit var textViewTimer: TextView
    private lateinit var lytRoot: RelativeLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var dialog: Dialog
    private lateinit var acquirerFragment: AcquirerFragment
    private lateinit var acquirerName: String
    private var acquirerId: String = ""
    private var mIsDebit: Boolean = false
    private var mCardReady: Boolean = false
    private var mAmount: Long = 0
    private lateinit var mFragmentPin: PinFragment
    private lateinit var mSignatureFragment: SignatureFragment
    private val duration = 60000
    private lateinit var mEmvData: String
    private var mCardNo: String? = ""
    private lateinit var mTrack2: String
    private var mCardBrand: String? = ""
    private var mCardLogo: Int = 0
    private lateinit var mCountDownTimer: CountDownTimer
    private var isTimerRunning = false
    private var mSignature: String? = null
    private val TAG = "CardPaymentActivity"
    private var latitude: String? = ""
    private var longitude: String? = ""
    private val LATITUDE_KEY = "last_latitude"
    private val LONGITUDE_KEY = "last_longitude"
    private var isWallet: Boolean = false
    private var mCardType: String? = ""
    private val CARD_TYPE_DEBIT = "debit"
    private val CARD_TYPE_CREDIT = "credit"
    private val EMV_CREDIT = "emvCredit"
    private val EMV_DEBIT = "emvDebit"
    private val CARD_IC = "ic"
    private val CARD_MAG = "magnetic"

    companion object {
        private const val AMOUNT_TRANSACTION: String = "amount"
        private const val ACQUIRER: String = "acquirer"
        private const val IS_DEBIT: String = "is_debit"
        private const val ID_ACQUIRER: String = "id_acquirer"

        fun newIntent(
            context: Context,
            amount: Long,
            acquirer: String,
            isDebit: Boolean,
            acquirerId: String
        ): Intent {
            val i = Intent(context, CardPaymentActivity::class.java)
            i.putExtra(AMOUNT_TRANSACTION, amount)
            i.putExtra(ACQUIRER, acquirer)
            i.putExtra(IS_DEBIT, isDebit)
            i.putExtra(ID_ACQUIRER, acquirerId)
            return i
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_card_payment)

        bindView()

        toolbar.title = ""
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)

        mIsDebit = intent.getBooleanExtra(IS_DEBIT, false)
        mAmount = intent.getLongExtra(AMOUNT_TRANSACTION, 0)
        acquirerId = intent.getStringExtra(ID_ACQUIRER)

        initView()
        startSunmiPayService()
        observeViewState()
    }

    override fun onStop() {
        super.onStop()
        mikaSdk.destroySunmiPayService()
    }

    override fun onDestroy() {
        super.onDestroy()
        mCountDownTimer.cancel()
        hideDialog(dialog)
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }

    override fun onClick(view: View?) {
        if (view === btnChoosePayment) {
            acquirerFragment = AcquirerFragment()
            acquirerFragment.setOnAcquirerSelected(this)
            acquirerFragment.show(supportFragmentManager, "dialog")
        } else if (view === btnPin) {
            if (mCardReady) {
                //Make blurry background
                Blurry.with(this)
                    .radius(25)
                    .sampling(2)
                    .color(Color.argb(66, 255, 255, 0))
                    .async()
                    .onto(lytRoot)

                mFragmentPin = PinFragment()
                mFragmentPin.isCancelable = false
                mFragmentPin.show(supportFragmentManager, "dialog")
            }
        } else if (view === btnSignature) {
            if (mCardReady) {
                //Make blurry background
                Blurry.with(this)
                    .radius(25)
                    .sampling(2)
                    .color(Color.argb(66, 255, 255, 0))
                    .async()
                    .onto(lytRoot)

                mSignatureFragment = SignatureFragment()
                mSignatureFragment.isCancelable = false
                mSignatureFragment.show(supportFragmentManager, "dialog")
            }
        }
    }

    override fun onSelected(acquirer: Acquirer) {
        if (mAmount.toInt() < acquirer.minimumAmount) {
            val message =
                "Minimum Pembayaran " + acquirer.acquirerType.name + " " + NumberUtil.formatCurrency(
                    acquirer.minimumAmount.toDouble()
                )
            Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()
        } else {
            acquirerName = acquirer.acquirerType.name
            retrieveLatLang()
            when (acquirer.acquirerType.classX) {
                EMV_DEBIT -> {
                    isWallet = false
                    mIsDebit = true
                    acquirerId = acquirer.id
                    resetUI()
                    initCardType()
                }
                EMV_CREDIT -> {
                    isWallet = false
                    mIsDebit = false
                    acquirerId = acquirer.id
                    resetUI()
                    initCardType()
                }
                else -> {
                    isWallet = true
                    viewModel.createTransactionWallet(acquirer.id, mAmount.toInt(), latitude!!, longitude!!)
                }
            }
        }
    }

    override fun onOkClicked(pin: String) {
        isWallet = true
        stopTimer()
        showDialog(dialog)
        retrieveLatLang()
        val cardType = if (mIsDebit) CARD_TYPE_DEBIT else CARD_TYPE_CREDIT
        when (mCardType) {
            CARD_IC -> {
                viewModel.createTransactionCard(
                    acquirerId!!,
                    mAmount.toInt(),
                    latitude!!,
                    longitude!!,
                    cardType,
                    pin,
                    ""
                )
            }
            CARD_MAG -> {
                viewModel.createTransactionCard(
                    acquirerId!!,
                    mAmount.toInt(),
                    latitude!!,
                    longitude!!,
                    cardType,
                    pin,
                    ""
                )
            }
        }
    }

    override fun onContinueClicked(signature: String) {
        isWallet = true
        mSignature = signature
        stopTimer()
        showDialog(dialog)
        retrieveLatLang()
        val cardType = if (mIsDebit) CARD_TYPE_DEBIT else CARD_TYPE_CREDIT
        when (mCardType) {
            CARD_IC -> {
                viewModel.createTransactionCard(
                    acquirerId!!,
                    mAmount.toInt(),
                    latitude!!,
                    longitude!!,
                    cardType,
                    "",
                    signature
                )
            }
            CARD_MAG -> {
                viewModel.createTransactionCard(
                    acquirerId!!,
                    mAmount.toInt(),
                    latitude!!,
                    longitude!!,
                    cardType,
                    "",
                    signature
                )
            }
        }
    }

    fun onPinButtonClicked(v: View) {
        val button = v as Button
        mFragmentPin.onClicked(button.text.toString())
    }

    private fun observeViewState() {
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            resetUI()
            throwable?.let {
                Toast.makeText(this, throwable.message, Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun handleViewState(state: CardPaymentViewState) {
        if (state.showLoading) {
            showDialog(dialog)
        } else {
            Handler().postDelayed({
                hideDialog(dialog)
            }, 1000)
        }

        state.cardTransaction?.let { data ->
            val signature = if (mSignature != null) Base64.decode(mSignature, Base64.NO_WRAP) else null
            val intent = TransactionDetailActivity.newIntent(
                applicationContext,
                true,
                true,
                true,
                data.transactionId,
                signature
            )
            startActivity(intent)
            finish()
        }

        state.tokenTransaction?.let { data ->
            val stream = ByteArrayOutputStream()
            if (!data.isUrl) {
                data.qrImage.compress(Bitmap.CompressFormat.PNG, 100, stream)
                val byteArray = stream.toByteArray()

                val intent = QrPaymentActivity.newIntent(
                    applicationContext,
                    mAmount.toString(),
                    acquirerName,
                    byteArray,
                    data.transactionId,
                    data.expirySecond
                )
                acquirerFragment.dismiss()
                startActivity(intent)
                finish()
            } else {
                Glide.with(this)
                    .asBitmap()
                    .load(data.token)
                    .into(object : CustomTarget<Bitmap>() {
                        override fun onLoadCleared(placeholder: Drawable?) {

                        }

                        override fun onResourceReady(
                            resource: Bitmap,
                            transition: com.bumptech.glide.request.transition.Transition<in Bitmap>?
                        ) {
                            resource.compress(Bitmap.CompressFormat.PNG, 100, stream)
                            val byteArray = stream.toByteArray()

                            val intent = QrPaymentActivity.newIntent(
                                applicationContext,
                                mAmount.toString(),
                                acquirerName,
                                byteArray,
                                data.transactionId,
                                data.expirySecond
                            )
                            acquirerFragment.dismiss()
                            startActivity(intent)
                            finish()
                        }

                    })
            }

        }
    }

    private fun bindView() {
        toolbar = toolbar_card_payment
        textViewTitle = text_title
        textViewDate = text_date
        textViewOutlet = text_outlet
        textViewCardNumber = text_card_number
        textViewType = text_type
        lytValid = lyt_valid
        textViewValid = text_valid
        textViewMessage = text_message
        textViewCardType = text_card_type
        textViewAmount = text_amount
        btnChoosePayment = btn_choose_acquirer
        btnSignature = btn_signature
        btnPin = btn_pin
        imageViewCardType = img_card_type
        textViewTimer = text_timer
        lytRoot = lyt_root
        progressBar = progress_bar
        dialog = CustomDialog.progressDialog(this, getString(R.string.loading))
    }

    private fun initView() {
        val interval = 1000

        val outletName = sharedPrefsLocalStorage.getStringPref(TransactionDetailActivity.OUTLET_KEY)
        textViewDate.text = DateUtil.formatDate(Date(System.currentTimeMillis()))
        textViewAmount.text = NumberUtil.formatCurrency(mAmount.toDouble())
        textViewOutlet.text = outletName
        progressBar.progress = 100
        initCardType()

        mCountDownTimer = object : CountDownTimer(duration.toLong(), interval.toLong()) {
            override fun onTick(millisUntilFinished: Long) {
                val progress = (millisUntilFinished * 100).toInt() / duration
                val time = TimeUnit.MILLISECONDS.toSeconds(millisUntilFinished).toString()
                isTimerRunning = true
                progressBar.progress = progress
                textViewTimer.text = time
            }

            override fun onFinish() {
                isTimerRunning = false
                textViewTimer.text = 0.toString()
                progressBar.progress = 0
                Toast.makeText(applicationContext, "Timeout", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
        btnPin.background = ContextCompat.getDrawable(applicationContext, R.drawable.btn_gray_outline)
        btnSignature.background = ContextCompat.getDrawable(applicationContext, R.drawable.btn_gray_outline)
        btnChoosePayment.setOnClickListener(this)
        btnPin.setOnClickListener(this)
        btnSignature.setOnClickListener(this)
    }

    private fun initCardType() {
        if (mIsDebit) {
            textViewTitle.setText(R.string.title_debit_card)
            textViewType.setText(R.string.title_debit_card)
            textViewCardType.setText(R.string.title_debit_card)
            textViewMessage.setText(R.string.message_insert_debit_card)
        } else {
            textViewTitle.setText(R.string.title_credit_card)
            textViewType.setText(R.string.title_credit_card)
            textViewCardType.setText(R.string.title_credit_card)
            textViewMessage.setText(R.string.message_insert_credit_card)
        }
    }

    private fun showDialog(dialog: Dialog) {
        if (!dialog.isShowing) {
            dialog.show()
        }
    }

    private fun hideDialog(dialog: Dialog) {
        if (dialog.isShowing) {
            dialog.dismiss()
        }
    }

    private fun showTimer() {
        isTimerRunning = true
        progressBar.visibility = View.VISIBLE
        textViewTimer.visibility = View.VISIBLE
        mCountDownTimer.start()
    }

    private fun hideTimer() {
        isTimerRunning = false
        mCountDownTimer.cancel()
        progressBar.visibility = View.GONE
        textViewTimer.visibility = View.GONE
    }

    private fun stopTimer() {
        isTimerRunning = false
        mCountDownTimer.cancel()
    }

    private fun startSunmiPayService() {
        mikaSdk.startSunmiPayService(mAmount.toString(), (duration / 1000), object : StartSunmiPayServiceCallback {
            override fun onAttach(attached: Boolean, loading: Boolean) {
                if (loading) {
                    showDialog(dialog)
                } else {
                    hideDialog(dialog)
                }

                if (!attached) {
                    resetUI()
                }
            }

            override fun onError(e: Throwable) {
                Toast.makeText(applicationContext, e.message, Toast.LENGTH_SHORT).show()
            }

            override fun onSuccessIcNfcCard(maskedPan: String) {
                mCardType = CARD_IC
//                mEmvData = emvData
                displayData(maskedPan, mCardType!!)
            }

            override fun onSuccessMagneticCard(maskedPan: String) {
                mCardType = CARD_MAG
//                mTrack2 = track2
                displayData(maskedPan, mCardType!!)
            }

            override fun onFailure(code: Int, message: String) {
                Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()
            }

        })
    }

    private fun displayData(maskedPan: String, type: String) {
        showDialog(dialog)
//        Log.d(TAG, track2)

//        mCardNo = if (type == CARD_IC) track2 else track2.substring(0, track2.indexOf("="))
        mCardBrand = StripeUtil.getBrand(mCardNo)
        mCardLogo = StripeUtil.getLogo(mCardNo)
//        var cardNo = mCardNo!!.substring(mCardNo!!.length - 4)
        val cardNo = maskedPan
        textViewCardNumber.text = cardNo
        if (mCardLogo != 0) imageViewCardType.setImageResource(mCardLogo)
        textViewMessage.visibility = View.GONE
        textViewCardNumber.visibility = View.VISIBLE
        textViewType.visibility = View.VISIBLE
        imageViewCardType.visibility = View.VISIBLE
        mCardReady = true
        btnPin.background = ContextCompat.getDrawable(applicationContext, R.drawable.blue_button_bg)
        btnSignature.background = ContextCompat.getDrawable(applicationContext, R.drawable.blue_button_bg)
        if (isTimerRunning) {
            mCountDownTimer.cancel()
            progressBar.progress = 100
        }
        showTimer()
        hideDialog(dialog)
    }

    private fun resetUI() {
        textViewMessage.visibility = View.VISIBLE
        textViewCardNumber.visibility = View.GONE
        textViewType.visibility = View.VISIBLE
        imageViewCardType.visibility = View.GONE
        progressBar.visibility = View.GONE
        textViewTimer.visibility = View.GONE
        lytValid.visibility = View.GONE
        textViewValid.visibility = View.GONE
        mCardReady = false
        btnPin.background = ContextCompat.getDrawable(applicationContext, R.drawable.btn_gray_outline)
        btnSignature.background = ContextCompat.getDrawable(applicationContext, R.drawable.btn_gray_outline)
        hideTimer()
    }

    private fun retrieveLatLang() {
        latitude = sharedPrefsLocalStorage.getStringPref(LATITUDE_KEY)
        longitude = sharedPrefsLocalStorage.getStringPref(LONGITUDE_KEY)
    }
}

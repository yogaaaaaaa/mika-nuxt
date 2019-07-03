package id.mikaapp.mika.agent.qrpayment

import android.app.Dialog
import android.app.NotificationManager
import androidx.lifecycle.Observer
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.os.CountDownTimer
import android.os.Handler
import android.util.Log
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.*
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.acquirer.AcquirerFragment
import id.mikaapp.mika.agent.cardpayment.CardPaymentActivity
import id.mikaapp.mika.agent.home.HomeActivity
import id.mikaapp.mika.agent.transactiondetail.TransactionDetailActivity
import id.mikaapp.mika.agent.transactiondetail.TransactionDetailActivity.Companion.OUTLET_KEY
import id.mikaapp.mika.utils.CustomDialog
import id.mikaapp.mika.utils.DateUtil
import id.mikaapp.mika.utils.NumberUtil
import id.mikaapp.sdk.models.Acquirer
import kotlinx.android.synthetic.main.activity_qr_payment.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel
import java.util.*
import java.util.concurrent.TimeUnit
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.ChangeTransactionStatusCallback
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.ChangeTransactionStatusRequest

class QrPaymentActivity : AppCompatActivity(), View.OnClickListener, AcquirerFragment.OnAcquirerSelected {

    private val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    private val viewModel: QrPaymentViewModel by viewModel()
    private lateinit var textViewDate: TextView
    private lateinit var textViewOutletName: TextView
    private lateinit var textViewAmount: TextView
    private lateinit var textViewType: TextView
    private lateinit var textViewTimer: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var btnCamera: View
    private lateinit var btnChoosePayment: Button
    private lateinit var imgQrcode: ImageView
    private lateinit var dialog: Dialog
    private lateinit var toolbar: Toolbar
    private lateinit var handler: Handler
    private lateinit var periodicRefresh: Runnable
    private lateinit var countDownTimer: CountDownTimer
    private var DURATION: Long = 60000
    private val REFRESH_TIME: Long = 30000
    private var remainingTime: Long = 0
    private var isRefresh: Boolean = false
    private lateinit var transactionId: String
    private lateinit var acquirerFragment: AcquirerFragment
    private lateinit var amount: String
    private lateinit var acquirerName: String
    private var outletName: String? = ""
    private lateinit var latitude: String
    private lateinit var longitude: String
    private val LATITUDE_KEY = "last_latitude"
    private val LONGITUDE_KEY = "last_longitude"

    companion object {
        private const val AMOUNT_TRANSACTION: String = "amount"
        private const val ACQUIRER: String = "acquirer"
        private const val QR_CODE: String = "qr_code"
        private const val TRANSACTION_ID: String = "transaction_id"
        private const val EXPIRY_SECOND: String = "expiry_second"

        fun newIntent(
            context: Context,
            amount: String,
            acquirer: String,
            qrCode: ByteArray,
            transactionId: String,
            expirySecond: Int
        ): Intent {
            val i = Intent(context, QrPaymentActivity::class.java)
            i.putExtra(AMOUNT_TRANSACTION, amount)
            i.putExtra(ACQUIRER, acquirer)
            i.putExtra(QR_CODE, qrCode)
            i.putExtra(TRANSACTION_ID, transactionId)
            i.putExtra(EXPIRY_SECOND, expirySecond)
            return i
        }
    }

    private val mReceiver = object : BroadcastReceiver() {
        override fun onReceive(p0: Context?, bundle: Intent?) {
            bundle?.let {
                val status = bundle.getStringExtra("status")
                val id = bundle.getStringExtra("id")
                val notificationId = bundle.getIntExtra("notificationId", 0)
                val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                if (notificationId > 0) {
                    notificationManager.cancel(notificationId)
                } else {
                    notificationManager.cancelAll()
                }

                if (transactionId == id) {
                    val intent = if (status == "success") {
                        TransactionDetailActivity.newIntent(
                            applicationContext, true, false, true, id
                        )

                    } else {
                        TransactionDetailActivity.newIntent(
                            applicationContext, true, false, false, id
                        )
                    }
                    startActivity(intent)
                    finish()
                }
            }
        }

    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_payment)
//        viewModel = ViewModelProviders.of(this, factory).get(QrPaymentViewModel::class.java)
        bindView()
        toolbar.title = ""
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)

        outletName = sharedPrefsLocalStorage.getStringPref(OUTLET_KEY)
        amount = intent.getStringExtra(AMOUNT_TRANSACTION)
        acquirerName = intent.getStringExtra(ACQUIRER)
        transactionId = intent.getStringExtra(TRANSACTION_ID)
        val expirySecond = intent.getIntExtra(EXPIRY_SECOND, 0)

        val byteArray = intent.getByteArrayExtra(QR_CODE)
        val qrCode = BitmapFactory.decodeByteArray(byteArray, 0, byteArray.size)

        textViewOutletName.text = outletName
        textViewDate.text = DateUtil.formatDate(Date(System.currentTimeMillis()))
        textViewAmount.text = NumberUtil.formatCurrency(amount.toDouble())

        bindData(transactionId, acquirerName, qrCode, expirySecond)
        @Suppress("ConstantConditionIf")
        if (BuildConfig.DEBUG && BuildConfig.SANDBOX_MODE) {
            buttonChangeStatusSuccess?.apply {
                visibility = View.VISIBLE
                setOnClickListener {
                    MikaSdk.instance.changeTransactionStatus(
                        ChangeTransactionStatusRequest(transactionId, "success")
                        , object : ChangeTransactionStatusCallback {
                            override fun onSuccess(response: BasicResponse) {
                                Log.d("TEST SANDBOX", "SUCCESS ${response.message}")
                            }

                            override fun onFailure(response: BasicResponse) {
                                Log.d("TEST SANDBOX", "FAILURE ${response.message}")
                            }

                            override fun onError(error: Throwable) {
                                Log.d("TEST SANDBOX", "onError ${error.message}")
                            }
                        }
                    )
                }
            }
            buttonChangeStatusFailed?.apply {
                visibility = View.VISIBLE
                setOnClickListener {
                    MikaSdk.instance.changeTransactionStatus(
                        ChangeTransactionStatusRequest(transactionId, "failed")
                        , object : ChangeTransactionStatusCallback {
                            override fun onSuccess(response: BasicResponse) {
                                Log.d("TEST SANDBOX", "SUCCESS ${response.message}")
                            }

                            override fun onFailure(response: BasicResponse) {
                                Log.d("TEST SANDBOX", "FAILURE ${response.message}")
                            }

                            override fun onError(error: Throwable) {
                                Log.d("TEST SANDBOX", "onError ${error.message}")
                            }
                        }
                    )
                }
            }
        }
        btnChoosePayment.setOnClickListener(this)

        periodicRefresh = object : Runnable {
            override fun run() {
                viewModel.getTransactionDetailPeriodic(transactionId)
                handler.postDelayed(this, REFRESH_TIME)
            }
        }
        handler.postDelayed(periodicRefresh, REFRESH_TIME)

        observeViewState()
    }

    private fun bindData(tId: String, acquirer: String, qrImg: Bitmap, expirySecond: Int) {
        if (expirySecond > 0) {
            DURATION = expirySecond.toLong() * 1000
        }
        transactionId = tId
        textViewType.text = acquirer
        imgQrcode.setImageBitmap(qrImg)
        initCountDownTimer(DURATION)
    }

    private fun bindView() {
        toolbar = toolbar_qr_payment
        handler = Handler()
        imgQrcode = img_qrcode
        textViewDate = text_date
        textViewOutletName = text_outlet_name
        textViewAmount = text_amount
        textViewType = text_acquirer_name
        progressBar = progressBar_timer
        textViewTimer = text_timer
        btnChoosePayment = btn_choose_acquirer
        btnCamera = btn_camera
        btnCamera.visibility = View.GONE
        dialog = CustomDialog.progressDialog(this, getString(R.string.loading))
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }

    override fun onResume() {
        super.onResume()
        val intentFilter = IntentFilter(HomeActivity.TRANSACTION_MQTT_ACTION)
        LocalBroadcastManager.getInstance(applicationContext).registerReceiver(mReceiver, intentFilter)
    }

    override fun onPause() {
        super.onPause()
        LocalBroadcastManager.getInstance(applicationContext).unregisterReceiver(mReceiver)
    }

    override fun onStop() {
        super.onStop()
        handler.removeCallbacksAndMessages(null)
    }

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer.cancel()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        val inflater = menuInflater
        inflater.inflate(R.menu.activity_scanqr, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            android.R.id.home -> onBackPressed()
            R.id.menu_refresh -> {
                if (!isRefresh) {
                    viewModel.getTransactionDetail(transactionId)
                }
            }
        }

        return super.onOptionsItemSelected(item)
    }

    override fun onSelected(acquirer: Acquirer) {
        if (amount.toInt() < acquirer.minimumAmount) {
            val message =
                "Minimum Pembayaran " + acquirer.acquirerType.name + " " + NumberUtil.formatCurrency(
                    acquirer.minimumAmount.toDouble()
                )
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        } else {
            retrieveLatLang()
            acquirerName = acquirer.acquirerType.name
            when (acquirer.acquirerType.classX) {
                "emvDebit" -> {
                    val intent = CardPaymentActivity.newIntent(
                        applicationContext, amount.toLong(), acquirerName, true, acquirer.id
                    )
                    acquirerFragment.dismiss()
                    startActivity(intent)
                    finish()
                }
                "emvCredit" -> {
                    val intent = CardPaymentActivity.newIntent(
                        applicationContext, amount.toLong(), acquirerName, false, acquirer.id
                    )
                    acquirerFragment.dismiss()
                    startActivity(intent)
                    finish()
                }
                else -> viewModel.createTransaction(acquirer.id, amount.toInt(), latitude!!, longitude!!)
            }
        }
    }

    override fun onClick(v: View?) {
        when (v) {
            btnChoosePayment -> {
                acquirerFragment = AcquirerFragment()
                acquirerFragment.setOnAcquirerSelected(this)
                acquirerFragment.show(supportFragmentManager, "dialog")
            }
        }
    }

    private fun observeViewState() {
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                Toast.makeText(this, throwable.message, Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun handleViewState(state: QrPaymentViewState) {
        if (state.showLoading) {
            showDialog(dialog)
        } else {
            hideDialog(dialog)
        }
        isRefresh = !state.transactionDetailLoaded

        state.transactionDetail?.let {
            val intent: Intent
            if (it.status != "created") {
                if (it.status == "success") {
                    intent = TransactionDetailActivity.newIntent(
                        this, true, false, true, transactionId
                    )
                    startActivity(intent)
                    finish()
                } else {
                    intent = TransactionDetailActivity.newIntent(
                        this, false, false, false, transactionId
                    )
                    startActivity(intent)
                    finish()
                }
            }
        }

        state.tokenTransaction?.let { data ->
            if (!data.isUrl) {
                countDownTimer.cancel()
                bindData(data.transactionId, acquirerName, data.qrImage, data.expirySecond)
                acquirerFragment.dismiss()
                state.tokenTransaction = null
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
                            countDownTimer.cancel()
                            bindData(data.transactionId, acquirerName, resource, data.expirySecond)
                            acquirerFragment.dismiss()
                            state.tokenTransaction = null
                        }

                    })
            }
        }
    }

    private fun initCountDownTimer(time: Long) {
        val interval = 1000

        progressBar.progress = 100

        countDownTimer = object : CountDownTimer(time, interval.toLong()) {
            override fun onTick(millisUntilFinished: Long) {
                remainingTime = millisUntilFinished
                val progress = (millisUntilFinished * 100).toInt() / DURATION
                val time = TimeUnit.MILLISECONDS.toSeconds(millisUntilFinished).toString()
                progressBar.progress = progress.toInt()
                textViewTimer.text = time
            }

            override fun onFinish() {
                textViewTimer.text = 0.toString()
                progressBar.progress = 0
                val intent = TransactionDetailActivity.newIntent(
                    applicationContext, false, false, false, transactionId
                )
                startActivity(intent)
                finish()
            }
        }.start()
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

    private fun retrieveLatLang() {
        sharedPrefsLocalStorage.getStringPref(LATITUDE_KEY)?.let {
            latitude = it
        }
        sharedPrefsLocalStorage.getStringPref(LONGITUDE_KEY)?.let {
            longitude = it
        }

    }
}

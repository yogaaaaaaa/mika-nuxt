package id.mikaapp.mika.agent.transactiondetail

import android.app.Dialog
import androidx.lifecycle.Observer
import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaPlayer
import android.os.Bundle
import android.os.Handler
import androidx.core.content.ContextCompat
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.WriterException
import com.journeyapps.barcodescanner.BarcodeEncoder
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.home.HomeActivity
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.utils.AidlUtil
import id.mikaapp.mika.utils.CustomDialog
import id.mikaapp.mika.utils.DateUtil
import id.mikaapp.mika.utils.NumberUtil
import id.mikaapp.sdk.models.MerchantTransactionDetail
import id.mikaapp.sdk.models.TransactionDetail
import kotlinx.android.synthetic.main.activity_transaction_detail.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel

class TransactionDetailActivity : AppCompatActivity(), View.OnClickListener {

    private val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    private val viewModel: TransactionDetailViewModel by viewModel()
    private lateinit var txtDate: TextView
    private lateinit var txtTo: TextView
    private lateinit var txtAmount: TextView
    private lateinit var txtTime: TextView
    private lateinit var txtPaymentMethod: TextView
    private lateinit var txtTransactionNo: TextView
    private lateinit var txtStatus: TextView
    private lateinit var txtStatusDescription: TextView
    private lateinit var txtPhoneNumber: TextView
    private lateinit var txtTransactionID: TextView
    private lateinit var txtMerchantName: TextView
    private lateinit var labelApprovalCode: TextView
    private lateinit var txtApprovalCode: TextView
    private lateinit var separator10: TextView
    private lateinit var labelPhoneNumber: TextView
    private lateinit var imgBarcode: ImageView
    private lateinit var imgStatus: ImageView
    private lateinit var imgPrinter: ImageView
    private lateinit var imgApprovalBarcode: ImageView
    private lateinit var dialog: Dialog
    private lateinit var toolbar: Toolbar
    private var isNotification: Boolean = false
    private var signature: Bitmap? = null
    private var mCardNo: String? = null
    private var isCardTransaction: Boolean = false
    private var mPlayRingtone: Boolean = false
    private lateinit var transactionDetail: TransactionDetail
    private var merchantName: String? = ""
    private var outletName: String? = ""
    private var outletAddress: String? = ""

    companion object {
        private const val PRINT: String = "print"
        private const val IS_CARD_TRANSACTION: String = "is_card_transaction"
        private const val PLAY_RINGTONE: String = "play_ringtone"
        private const val TRANSACTION_ID: String = "transaction_id"
        private const val SIGNATURE: String = "signature"
        const val MERCHANT_KEY = "merchant"
        const val OUTLET_KEY = "outlet"
        const val OUTLET_ADDRESS = "outlet_address"

        fun newIntent(
            context: Context,
            print: Boolean,
            isCardTransaction: Boolean,
            playRingtone: Boolean,
            transactionId: String
        ): Intent {
            val i = Intent(context, TransactionDetailActivity::class.java)
            i.putExtra(PRINT, print)
            i.putExtra(IS_CARD_TRANSACTION, isCardTransaction)
            i.putExtra(PLAY_RINGTONE, playRingtone)
            i.putExtra(TRANSACTION_ID, transactionId)
            return i
        }

        fun newIntent(
            context: Context,
            print: Boolean,
            isCardTransaction: Boolean,
            playRingtone: Boolean,
            transactionId: String,
            signature: ByteArray? = null
        ): Intent {
            val i = Intent(context, TransactionDetailActivity::class.java)
            i.putExtra(PRINT, print)
            i.putExtra(IS_CARD_TRANSACTION, isCardTransaction)
            i.putExtra(PLAY_RINGTONE, playRingtone)
            i.putExtra(TRANSACTION_ID, transactionId)
            i.putExtra(SIGNATURE, signature)
            return i
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_transaction_detail)

//        viewModel = ViewModelProviders.of(this, factory).get(TransactionDetailViewModel::class.java)

        bindView()

        toolbar.title = ""
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)

        isNotification = intent.getBooleanExtra(PRINT, false)
        mPlayRingtone = intent.getBooleanExtra(PLAY_RINGTONE, false)
        isCardTransaction = intent.getBooleanExtra(IS_CARD_TRANSACTION, false)

        val byteArray = intent.getByteArrayExtra(SIGNATURE)
        if (byteArray != null) {
            signature = BitmapFactory.decodeByteArray(byteArray, 0, byteArray.size)
        }
        val id = intent.getStringExtra(TRANSACTION_ID)

        when (sharedPrefsLocalStorage.getStringPref(LoginActivity.USER_TYPE_PREF)) {
            "agent" -> {
                viewModel.getTransactionDetail(id)
                viewModel.getAgentAccount()
            }

            "merchantStaff" -> {
                viewModel.getMerchantTransactionDetail(id)
                viewModel.getStaffAccount()
                separator_4.visibility = View.GONE
                label_to.visibility = View.GONE
                txtTo.visibility = View.GONE
            }
        }

        observeViewState()

        if (mPlayRingtone) {
            val mp = MediaPlayer.create(this, R.raw.payment_unlock)
            mp.setOnCompletionListener { mp.release() }
            mp.start()
        }
    }

    private fun bindView() {
        toolbar = toolbar_transaction_detail
        txtDate = text_date
        txtTo = text_to
        txtAmount = text_amount
        txtTime = text_time
        txtPaymentMethod = text_acquirer
        txtTransactionNo = text_transaction_no
        txtStatus = text_transaction_status
        txtStatusDescription = text_status_detail
        imgBarcode = img_transaction_barcode
        imgStatus = img_status
        imgPrinter = img_printer
        txtPhoneNumber = text_phone_number
        txtTransactionID = text_transaction_ID
        txtMerchantName = text_merchant_name
        labelApprovalCode = label_approval_code
        txtApprovalCode = text_approval_code
        separator10 = separator_10
        labelPhoneNumber = label_transaction_phone
        imgApprovalBarcode = img_approval_barcode
        dialog = CustomDialog.progressDialog(this, getString(R.string.loading))
        imgPrinter.setOnClickListener(this)
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }

    override fun onBackPressed() {
        super.onBackPressed()
        if (isNotification) {
            val i = Intent(this, HomeActivity::class.java)
            i.putExtra("exit", true)
            i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(i)
            finish()
        }
    }

    override fun onClick(view: View?) {
        when (view) {
            imgPrinter -> {
                printReceipt()
            }
        }
    }

    private fun printReceipt() {
        val mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
        if (mBluetoothAdapter == null) {
            Toast.makeText(
                this,
                "Device doesn't have bluetooth",
                Toast.LENGTH_SHORT
            ).show()
        } else {
            if (!mBluetoothAdapter.isEnabled) {
                Log.e("IMG PRINTER", "Bluetooth Adapter Not Enable")
                if (!AidlUtil.getInstance().isConnect) {
                    Log.e("IMG PRINTER", "Aidl not Connect")
                    connectPrinterService()
                } else {
                    Log.d("IMG PRINTER", "Aidl Connected")
                    if (isCardTransaction) {
                        AidlUtil.getInstance().printTransactionReceipt(
                            transactionDetail,
                            signature, mCardNo, transactionDetail.cardApprovalCode,
                            merchantName, outletName, outletAddress
                        )
                    } else {
                        AidlUtil.getInstance()
                            .printTransactionReceipt(transactionDetail, merchantName, outletName, outletAddress)
                    }
                }
            } else {
                Log.d("IMG PRINTER", "Bluetooth Adapter Enable")
                if (!AidlUtil.getInstance().printTransactionReceipt(
                        transactionDetail,
                        merchantName,
                        outletName,
                        outletAddress
                    )
                ) {
                    connectPrinterService()
                }
            }
        }
    }

    private fun connectPrinterService() {
        AidlUtil.getInstance().connectPrinterService(
            this,
            object : AidlUtil.OnPrinterConnectListener {
                override fun onConnect() {
                    if (isCardTransaction) {
                        AidlUtil.getInstance().printTransactionReceipt(
                            transactionDetail,
                            signature, mCardNo, transactionDetail.cardApprovalCode,
                            merchantName, outletName, outletAddress
                        )
                    } else {
                        AidlUtil.getInstance()
                            .printTransactionReceipt(transactionDetail, merchantName, outletName, outletAddress)
                    }
                }

                override fun onFailed() {

                }
            })
    }

    private fun observeViewState() {
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                if (throwable.message == getString(R.string.error_not_authenticated)) {
                    val homeIntent = Intent(this, LoginActivity::class.java)
                    homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(homeIntent)
                    finish()
                }
                Toast.makeText(this, throwable.message, Toast.LENGTH_LONG).show()
                hideDialog(dialog)
                finish()
            }
        })
    }

    private fun handleViewState(state: TransactionDetailViewState) {
        if (state.showLoading) {
            showDialog(dialog)
        }

        state.transactionDetail?.let { data ->
            transactionDetail = data
            setData(data)
            if (data.cardPan != null) {
                mCardNo = data.cardPan!!.substring(data.cardPan!!.length - 4)
                mCardNo = "xxxx xxxx xxxx $mCardNo"
                isCardTransaction = true
            }
            if (data.status == "success" && isNotification) {
                printReceipt()
            }

            Handler().postDelayed({
                hideDialog(dialog)
            }, 1000)
        }

        state.agentAccount?.let {
            txtMerchantName.text = it.data.outlet.merchant.name
            txtTo.text = it.data.outlet.name
            sharedPrefsLocalStorage.save(MERCHANT_KEY, it.data.outlet.merchant.name)
            sharedPrefsLocalStorage.save(OUTLET_KEY, it.data.outlet.name)
            it.data.outlet.streetAddress?.let { address ->
                sharedPrefsLocalStorage.save(OUTLET_ADDRESS, address)
            }
        }

        state.staffAccount?.let {
            txtMerchantName.text = it.data.merchant.name
            sharedPrefsLocalStorage.save(MERCHANT_KEY, it.data.merchant.name)
            it.data.streetAddress?.let { address ->
                sharedPrefsLocalStorage.save(OUTLET_ADDRESS, address)
            }
        }
    }

    private fun setData(data: TransactionDetail) {
        merchantName = sharedPrefsLocalStorage.getStringPref(MERCHANT_KEY)
        outletName = sharedPrefsLocalStorage.getStringPref(OUTLET_KEY)
        outletAddress = sharedPrefsLocalStorage.getStringPref(OUTLET_ADDRESS)

        txtDate.text = DateUtil.getDate(data.createdAt)
        txtAmount.text = NumberUtil.formatCurrency(data.amount.toDouble())
        txtTime.text = DateUtil.getHour(data.createdAt)
        txtPaymentMethod.text = data.acquirer.acquirerType.name
        txtStatus.text = data.status
        txtMerchantName.text = merchantName
        txtTo.text = outletName
        data.referenceNumber?.let { txtTransactionID.text = it.toString() }

        txtTransactionNo.text = data.idAlias

        val multiFormatWriter = MultiFormatWriter()
        try {
            val bitMatrix = multiFormatWriter.encode(
                data.id,
                BarcodeFormat.QR_CODE, 100, 100
            )
            val barcodeEncoder = BarcodeEncoder()
            val bitmap = barcodeEncoder.createBitmap(bitMatrix)
            imgBarcode.setImageBitmap(bitmap)
        } catch (e: WriterException) {
            e.printStackTrace()
        }

        if (data.cardPan != null) {
            labelPhoneNumber.setText(R.string.text_card_number)
            val cardPan = data.cardPan.toString()
            mCardNo = "xxxx xxxx xxxx " + cardPan.substring(cardPan.length - 4)
            txtPhoneNumber.text = mCardNo
        } else {
            txtPhoneNumber.text = ""
        }

        if (data.cardApprovalCode != null) {
            labelApprovalCode.visibility = View.VISIBLE
            txtApprovalCode.visibility = View.VISIBLE
            separator10.visibility = View.VISIBLE
            txtApprovalCode.text = data.cardApprovalCode.toString()

            try {
                val bitMatrix = multiFormatWriter.encode(
                    data.cardApprovalCode.toString(),
                    BarcodeFormat.CODE_128, 200, 50
                )
                val barcodeEncoder = BarcodeEncoder()
                val bitmap = barcodeEncoder.createBitmap(bitMatrix)
                imgApprovalBarcode.visibility = View.VISIBLE
                imgApprovalBarcode.setImageBitmap(bitmap)
            } catch (e: WriterException) {
                e.printStackTrace()
            }

        }

        if (data.status == getString(R.string.success)) {
            imgStatus.setImageDrawable(ContextCompat.getDrawable(applicationContext, R.drawable.ic_success))
            txtStatus.setTextColor(ContextCompat.getColor(applicationContext, R.color.colorSuccess))
            txtStatusDescription.text = getString(R.string.transaction_success)
            imgPrinter.visibility = View.VISIBLE
        } else {
            imgStatus.setImageDrawable(ContextCompat.getDrawable(applicationContext, R.drawable.ic_failed))
            txtStatus.setTextColor(ContextCompat.getColor(applicationContext, R.color.colorFailed))
            txtStatusDescription.text = getString(R.string.transaction_failed)
            imgPrinter.visibility = View.GONE
        }
    }

    private fun setData(data: MerchantTransactionDetail) {
        merchantName = sharedPrefsLocalStorage.getStringPref(MERCHANT_KEY)
        outletAddress = sharedPrefsLocalStorage.getStringPref(OUTLET_ADDRESS)

        txtDate.text = DateUtil.getDate(data.createdAt)
        txtAmount.text = NumberUtil.formatCurrency(data.amount.toDouble())
        txtTime.text = DateUtil.getHour(data.createdAt)
        txtPaymentMethod.text = data.acquirer.acquirerType.name
        txtStatus.text = data.status
        txtMerchantName.text = merchantName
        data.referenceNumber?.let { txtTransactionID.text = it.toString() }

        txtTransactionNo.text = data.idAlias

        val multiFormatWriter = MultiFormatWriter()
        try {
            val bitMatrix = multiFormatWriter.encode(
                data.id,
                BarcodeFormat.QR_CODE, 100, 100
            )
            val barcodeEncoder = BarcodeEncoder()
            val bitmap = barcodeEncoder.createBitmap(bitMatrix)
            imgBarcode.setImageBitmap(bitmap)
        } catch (e: WriterException) {
            e.printStackTrace()
        }

        if (data.cardPanMasked != null) {
            labelPhoneNumber.setText(R.string.text_card_number)
            val cardPan = data.cardPanMasked
            mCardNo = "xxxx xxxx xxxx " + cardPan.substring(cardPan.length - 4)
            txtPhoneNumber.text = mCardNo
        } else {
            txtPhoneNumber.text = ""
        }

        if (data.cardApprovalCode != null) {
            labelApprovalCode.visibility = View.VISIBLE
            txtApprovalCode.visibility = View.VISIBLE
            separator10.visibility = View.VISIBLE
            txtApprovalCode.text = data.cardApprovalCode

            try {
                val bitMatrix = multiFormatWriter.encode(
                    data.cardApprovalCode,
                    BarcodeFormat.CODE_128, 200, 50
                )
                val barcodeEncoder = BarcodeEncoder()
                val bitmap = barcodeEncoder.createBitmap(bitMatrix)
                imgApprovalBarcode.visibility = View.VISIBLE
                imgApprovalBarcode.setImageBitmap(bitmap)
            } catch (e: WriterException) {
                e.printStackTrace()
            }

        }

        if (data.status == getString(R.string.success)) {
            imgStatus.setImageDrawable(ContextCompat.getDrawable(applicationContext, R.drawable.ic_success))
            txtStatus.setTextColor(ContextCompat.getColor(applicationContext, R.color.colorSuccess))
            txtStatusDescription.text = getString(R.string.transaction_success)
            imgPrinter.visibility = View.VISIBLE
        } else {
            imgStatus.setImageDrawable(ContextCompat.getDrawable(applicationContext, R.drawable.ic_failed))
            txtStatus.setTextColor(ContextCompat.getColor(applicationContext, R.color.colorFailed))
            txtStatusDescription.text = getString(R.string.transaction_failed)
            imgPrinter.visibility = View.GONE
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
}

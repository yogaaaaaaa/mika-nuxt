package id.mikaapp.mika.agent.qrpayment

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import id.mikaapp.mika.R
import id.mikaapp.mika.customview.CustomDialog
import id.mikaapp.mika.ext.loadImage
import id.mikaapp.mika.ext.observe
import id.mikaapp.mika.ext.showToast
import id.mikaapp.mika.ext.toBarcode
import kotlinx.android.synthetic.main.fragment_qr_create_transaction.*
import org.koin.android.viewmodel.ext.android.viewModel

class CreateQrTransactionFragment : Fragment() {

    val viewModel: CreateQrTransactionViewModel by viewModel()
    private var loadingDialog: Dialog? = null
    private var onTransactionCreatedListener: ((Pair<String, Int>) -> Unit)? = null
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_qr_create_transaction, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        observe(viewModel.transactionCreatedState) {
            onTransactionCreatedListener?.invoke(Pair(it.transactionId, it.expirySecond))
            if (it.isUrl) {
                requireContext().loadImage(it.token, qrPaymentFragmentBarcode)
            } else {
                qrPaymentFragmentBarcode.setImageBitmap(it.token.toBarcode(200, 200))
            }
        }
        observe(viewModel.loadingState) { message ->
            if (message != null) context?.let {
                loadingDialog = CustomDialog.progressDialog(it, message, false).apply { show() }
            }
            else loadingDialog?.dismiss()
        }
        observe(viewModel.warningState) { context?.showToast(it) }
    }

    fun createTransaction(acquirerID: String, amount: Int) {
        viewModel.loadData(acquirerID, amount)
    }

    fun setOnTransactionCreated(listener: ((Pair<String, Int>) -> Unit)?) {
        onTransactionCreatedListener = listener
    }
}

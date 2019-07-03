package id.mikaapp.mika.agent.qrpayment

import id.mikaapp.sdk.models.TokenTransaction
import id.mikaapp.sdk.models.TransactionDetail

/**
 * Created by grahamdesmon on 15/04/19.
 */

data class QrPaymentViewState(
    val showLoading: Boolean = false,
    val transactionDetailLoaded: Boolean = true,
    var tokenTransaction: TokenTransaction? = null,
    val transactionDetail: TransactionDetail? = null
)
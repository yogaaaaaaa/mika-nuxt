package id.mikaapp.mika.merchant.transaction

import id.mikaapp.sdk.models.Acquirer
import id.mikaapp.sdk.models.MerchantTransaction

data class MerchantTransactionViewState(
    val showLoading: Boolean = true,
    val isLoading: Boolean = false,
    val isTransactionsRetrieved: Boolean = false,
    val acquirers: ArrayList<Acquirer>? = null,
    val transactions: ArrayList<MerchantTransaction>? = null,
    var transactionData: ArrayList<MerchantTransaction>? = null
)
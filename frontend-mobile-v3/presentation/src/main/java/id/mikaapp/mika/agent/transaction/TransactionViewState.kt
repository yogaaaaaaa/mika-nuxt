package id.mikaapp.mika.agent.transaction

import id.mikaapp.sdk.models.Acquirer
import id.mikaapp.sdk.models.Transaction

/**
 * Created by grahamdesmon on 13/04/19.
 */

data class TransactionViewState(
    val showLoading: Boolean = true,
    val isLoading: Boolean = false,
    val isTransactionsRetrieved: Boolean = false,
    val acquirers: ArrayList<Acquirer>? = null,
    val transactions: ArrayList<Transaction>? = null,
    var transactionData: ArrayList<Transaction>? = null
)
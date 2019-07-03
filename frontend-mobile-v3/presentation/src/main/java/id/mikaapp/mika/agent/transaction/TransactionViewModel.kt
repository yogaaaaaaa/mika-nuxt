package id.mikaapp.mika.agent.transaction

import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.AcquirerCallback
import id.mikaapp.sdk.callbacks.TransactionCallback
import id.mikaapp.sdk.models.Acquirer
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.Transaction

/**
 * Created by grahamdesmon on 13/04/19.
 */

class TransactionViewModel(
    private val mikaSdk: MikaSdk
) : BaseViewModel() {

    var viewState: MutableLiveData<TransactionViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = TransactionViewState()
    }

    fun getTransactions(page: String, perPage: String, order: String, getCount: String) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            isLoading = true
        )

        performGetTransactions(page, perPage, order, getCount)
    }

    fun getTransactionsByFilters(
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        getCount: String
    ) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            isLoading = true
        )

        performGetTransactionsByFilters(page, perPage, startDate, endDate, acquirerId, order, getCount)
    }

    private fun performGetTransactions(page: String, perPage: String, order: String, getCount: String) {
        mikaSdk.getTransactions(page, perPage, order, getCount, object : TransactionCallback {
            override fun onSuccess(response: ArrayList<Transaction>) {
                if (page == "1") {
                    viewState.value?.let {
                        val newState = viewState.value?.copy(
                            isLoading = false,
                            showLoading = false,
                            transactions = response,
                            isTransactionsRetrieved = true
                        )
                        newState?.transactionData = response
                        viewState.value = newState
                        errorState.value = null
                    }
                } else {
                    viewState.value?.let {
                        val combinedTransactionData = viewState.value?.transactionData
                        for (transaction in response) {
                            combinedTransactionData?.add(transaction)
                        }
                        val newState = viewState.value?.copy(
                            isLoading = false,
                            showLoading = false,
                            transactions = response,
                            isTransactionsRetrieved = true
                        )
                        newState?.transactionData = combinedTransactionData
                        viewState.value = newState
                        errorState.value = null
                    }
                }
            }

            override fun onFailure(errorResponse: BasicResponse) {
                viewState.value = viewState.value?.copy(isLoading = false, showLoading = false)
                errorState.value = Throwable(errorResponse.message)
            }

            override fun onError(error: Throwable) {
                viewState.value = viewState.value?.copy(isLoading = false, showLoading = false)
                errorState.value = error
            }

        })
    }

    private fun performGetTransactionsByFilters(
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        getCount: String
    ) {
        mikaSdk.getTransactionsByFilters(
            page,
            perPage,
            startDate,
            endDate,
            acquirerId,
            order,
            getCount,
            object : TransactionCallback {
                override fun onSuccess(response: ArrayList<Transaction>) {
                    if (page == "1") {
                        viewState.value?.let {
                            val newState = viewState.value?.copy(
                                isLoading = false,
                                showLoading = false,
                                transactions = response,
                                isTransactionsRetrieved = true
                            )
                            newState?.transactionData = response
                            viewState.value = newState
                            errorState.value = null
                        }
                    } else {
                        viewState.value?.let {
                            val combinedTransactionData = viewState.value?.transactionData
                            for (transaction in response) {
                                combinedTransactionData?.add(transaction)
                            }
                            val newState = viewState.value?.copy(
                                isLoading = false,
                                showLoading = false,
                                transactions = response,
                                isTransactionsRetrieved = true
                            )
                            newState?.transactionData = combinedTransactionData
                            viewState.value = newState
                            errorState.value = null
                        }
                    }
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    viewState.value = viewState.value?.copy(isLoading = false, showLoading = false)
                    errorState.value = Throwable(errorResponse.message)
                }

                override fun onError(error: Throwable) {
                    viewState.value = viewState.value?.copy(isLoading = false, showLoading = false)
                    errorState.value = error
                }

            })
    }

    fun getAcquirers() {
        mikaSdk.getAcquirers(object : AcquirerCallback {
            override fun onSuccess(response: ArrayList<Acquirer>) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        acquirers = response
                    )
                    viewState.value = newState
                    errorState.value = null
                }
            }

            override fun onFailure(errorResponse: BasicResponse) {
                errorState.value = Throwable(errorResponse.message)
            }

            override fun onError(error: Throwable) {
                errorState.value = error
            }

        })
    }
}
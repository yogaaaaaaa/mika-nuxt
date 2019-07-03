package id.mikaapp.mika.merchant.transaction

import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.AcquirerCallback
import id.mikaapp.sdk.callbacks.MerchantTransactionCallback
import id.mikaapp.sdk.models.Acquirer
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantTransaction

class MerchantTransactionViewModel(private val mikaSdk: MikaSdk) : BaseViewModel() {

    var viewState: MutableLiveData<MerchantTransactionViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = MerchantTransactionViewState()
    }

    fun getTransactions(
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        getCount: String,
        outletId: String
    ) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            isLoading = true
        )

        performGetTransactions(page, perPage, startDate, endDate, acquirerId, order, getCount, outletId)
    }

    private fun performGetTransactions(
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        getCount: String,
        outletId: String
    ) {
        mikaSdk.getMerchantTransactions(
            page,
            perPage,
            startDate,
            endDate,
            acquirerId,
            order,
            getCount,
            outletId,
            object : MerchantTransactionCallback {
                override fun onSuccess(response: ArrayList<MerchantTransaction>) {
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
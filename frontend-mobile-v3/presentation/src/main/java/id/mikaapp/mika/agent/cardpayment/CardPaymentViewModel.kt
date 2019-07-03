package id.mikaapp.mika.agent.cardpayment

import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.CardTransactionCallback
import id.mikaapp.sdk.callbacks.CreateTransactionCallback
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.CardTransaction
import id.mikaapp.sdk.models.TokenTransaction

class CardPaymentViewModel(
    private val mikaSdk: MikaSdk
) : BaseViewModel() {

    var viewState: MutableLiveData<CardPaymentViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = CardPaymentViewState()
    }

    fun createTransactionCard(
        acquirerId: String,
        amount: Int,
        locationLat: String,
        locationLong: String,
        cardType: String,
        pinData: String,
        signatureData: String
    ) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            showLoading = true
        )

        performCreateTransactionCard(
            acquirerId,
            amount,
            locationLat,
            locationLong,
            cardType,
            pinData,
            signatureData
        )

    }

    private fun performCreateTransactionCard(
        acquirerId: String,
        amount: Int,
        locationLat: String,
        locationLong: String,
        cardType: String,
        pinData: String,
        signatureData: String
    ) {
        mikaSdk.createTransaction(
            acquirerId,
            amount,
            locationLat,
            locationLong,
            cardType,
            pinData,
            signatureData,
            object : CardTransactionCallback {
                override fun onSuccess(response: CardTransaction) {
                    viewState.value?.let {
                        val newState = viewState.value?.copy(
                            showLoading = false,
                            tokenTransaction = null,
                            cardTransaction = response
                        )
                        viewState.value = newState
                        errorState.value = null
                    }
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = Throwable(errorResponse.message)
                }

                override fun onError(error: Throwable) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = error
                }

            })
    }

    fun createTransactionWallet(
        acquirerId: String,
        amount: Int,
        locationLat: String,
        locationLong: String
    ) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            showLoading = true
        )
        performCreateTransactionWallet(acquirerId, amount, locationLat, locationLong)
    }

    private fun performCreateTransactionWallet(
        acquirerId: String,
        amount: Int,
        locationLat: String,
        locationLong: String
    ) {
        mikaSdk.createTransaction(
            acquirerId,
            amount,
            locationLat,
            locationLong,
            object : CreateTransactionCallback {
                override fun onSuccess(response: TokenTransaction) {
                    viewState.value?.let {
                        val newState = viewState.value?.copy(
                            showLoading = false,
                            tokenTransaction = response,
                            cardTransaction = null
                        )
                        viewState.value = newState
                        errorState.value = null
                    }
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = Throwable(errorResponse.message)
                }

                override fun onError(error: Throwable) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = error
                }

            })
    }
}
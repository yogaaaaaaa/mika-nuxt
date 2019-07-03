package id.mikaapp.mika.agent.acquirer

import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.AcquirerCallback
import id.mikaapp.sdk.callbacks.CreateTransactionCallback
import id.mikaapp.sdk.models.Acquirer
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.TokenTransaction
import java.util.*

/**
 * Created by grahamdesmon on 13/04/19.
 */

class AcquirerViewModel(
    private val mikaSdk: MikaSdk
) : BaseViewModel() {

    var viewState: MutableLiveData<AcquirerViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = AcquirerViewState()
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

    fun createTransaction(
        acquirerId: String,
        amount: Int,
        locationLat: String,
        locationLong: String
    ) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            showLoadingDialog = true,
            acquirers = null
        )
        performCreateTransaction(acquirerId, amount, locationLat, locationLong)
    }

    private fun performCreateTransaction(
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
                            showLoadingDialog = false,
                            tokenTransaction = response
                        )
                        viewState.value = newState
                        errorState.value = null
                    }
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    viewState.value = viewState.value?.copy(showLoadingDialog = false)
                    errorState.value = Throwable(errorResponse.message)
                }

                override fun onError(error: Throwable) {
                    viewState.value = viewState.value?.copy(showLoadingDialog = false)
                    errorState.value = error
                }

            })
    }
}
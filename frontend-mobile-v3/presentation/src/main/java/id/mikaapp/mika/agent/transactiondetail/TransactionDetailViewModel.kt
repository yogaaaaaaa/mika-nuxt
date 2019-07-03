package id.mikaapp.mika.agent.transactiondetail

import androidx.lifecycle.MutableLiveData
import id.mikaapp.domain.common.Mapper
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.AgentInfoCallback
import id.mikaapp.sdk.callbacks.MerchantStaffCallback
import id.mikaapp.sdk.callbacks.MerchantTransactionDetailCallback
import id.mikaapp.sdk.callbacks.TransactionDetailCallback
import id.mikaapp.sdk.models.*

/**
 * Created by grahamdesmon on 14/04/19.
 */

class TransactionDetailViewModel(
    private val mikaSdk: MikaSdk,
    private val mapper: Mapper<MerchantTransactionDetail, TransactionDetail>
) : BaseViewModel() {

    var viewState: MutableLiveData<TransactionDetailViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = TransactionDetailViewState()
    }

    fun getTransactionDetail(id: String) {
        mikaSdk.getTransactionById(id, object : TransactionDetailCallback {
            override fun onSuccess(response: TransactionDetail) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        showLoading = false,
                        transactionDetail = response
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

    fun getAgentAccount() {
        mikaSdk.getAgentInfo(object : AgentInfoCallback {
            override fun onSuccess(response: AgentResponse) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        agentAccount = response,
                        transactionDetail = null
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

    fun getMerchantTransactionDetail(id: String) {
        mikaSdk.getMerchantTransactionById(id, object : MerchantTransactionDetailCallback {
            override fun onSuccess(response: MerchantTransactionDetail) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        showLoading = false,
                        transactionDetail = mapper.mapFrom(response)
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

    fun getStaffAccount(){
        mikaSdk.getMerchantStaffInfo(object: MerchantStaffCallback {
            override fun onSuccess(response: MerchantStaffResponse) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        showLoading = false,
                        staffAccount = response,
                        transactionDetail = null
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
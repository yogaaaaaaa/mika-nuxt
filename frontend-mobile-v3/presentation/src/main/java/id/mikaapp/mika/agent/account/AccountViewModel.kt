package id.mikaapp.mika.agent.account

import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.AgentInfoCallback
import id.mikaapp.sdk.callbacks.MerchantStaffCallback
import id.mikaapp.sdk.models.AgentResponse
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantStaffResponse

/**
 * Created by grahamdesmon on 13/04/19.
 */

class AccountViewModel(
    private val mikaSdk: MikaSdk
) : BaseViewModel() {

    var viewState: MutableLiveData<AccountViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = AccountViewState()
    }

    fun getAgentAccount() {
        mikaSdk.getAgentInfo(object : AgentInfoCallback {
            override fun onSuccess(response: AgentResponse) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        showLoading = false,
                        agentAccount = response
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
        mikaSdk.getMerchantStaffInfo(object:MerchantStaffCallback{
            override fun onSuccess(response: MerchantStaffResponse) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        showLoading = false,
                        staffAccount = response
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
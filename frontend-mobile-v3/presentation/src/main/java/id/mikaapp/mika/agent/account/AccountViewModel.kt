package id.mikaapp.mika.agent.account

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.liveevent.LiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.MikaCallback
import id.mikaapp.sdk.models.AgentResponse
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantStaffResponse

/**
 * Created by grahamdesmon on 13/04/19.
 */

class AccountViewModel(
    private val mikaSdk: MikaSdk
) : ViewModel() {

    var viewState = MutableLiveData<AccountViewState>()
    var errorState = LiveEvent<Throwable>()

    init {
        viewState.value = AccountViewState()
    }

    fun getAgentAccount() {
        mikaSdk.getAgentInfo(object : MikaCallback<AgentResponse> {
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
        mikaSdk.getMerchantStaffInfo(object:MikaCallback<MerchantStaffResponse>{
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
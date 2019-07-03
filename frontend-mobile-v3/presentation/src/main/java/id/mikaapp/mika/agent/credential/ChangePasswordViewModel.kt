package id.mikaapp.mika.agent.credential

import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.ChangePasswordCallback
import id.mikaapp.sdk.models.BasicResponse

/**
 * Created by grahamdesmon on 15/04/19.
 */

class ChangePasswordViewModel(
    private val mikaSdk: MikaSdk
) : BaseViewModel() {

    var viewState: MutableLiveData<ChangePasswordViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = ChangePasswordViewState()
    }

    fun changePassword(oldPassword: String, newPassword: String) {
        errorState.value = null

        if (oldPassword.isEmpty() || newPassword.isEmpty()) {
            viewState.value = viewState.value?.copy(
                isLoading = false,
                isPasswordEmpty = true,
                response = null,
                changePasswordSuccess = false
            )
        } else {
            viewState.value = viewState.value?.copy(
                isLoading = true,
                isPasswordEmpty = false,
                changePasswordSuccess = false
            )

            performChangePassword(oldPassword, newPassword)
        }
    }

    private fun performChangePassword(oldPassword: String, newPassword: String) {
        mikaSdk.changePassword(oldPassword, newPassword, object : ChangePasswordCallback {
            override fun onSuccess(response: BasicResponse) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        isLoading = false,
                        isPasswordEmpty = false,
                        changePasswordSuccess = true
                    )
                    viewState.value = newState
                    errorState.value = null
                }
            }

            override fun onFailure(errorResponse: BasicResponse) {
                viewState.value = viewState.value?.copy(isLoading = false)
                errorState.value = Throwable(errorResponse.message)
            }

            override fun onError(error: Throwable) {
                viewState.value = viewState.value?.copy(isLoading = false)
                errorState.value = error
            }

        })
    }
}
package id.mikaapp.mika.agent.credential

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.ext.liveData
import id.mikaapp.mika.liveevent.LiveEvent
import id.mikaapp.sdk.MikaSdk

/**
 * Created by grahamdesmon on 15/04/19.
 */

class ChangePasswordViewModel(
    private val mikaSdk: MikaSdk
) : ViewModel() {

    private val loading = MutableLiveData<Boolean>()
    val loadingState = loading.liveData

    private val warning = LiveEvent<String>()
    val warningState = warning.liveData

    private val changePasswordSuccess = LiveEvent<Boolean>()
    val changePasswordSuccessState = changePasswordSuccess.liveData

    fun changePassword(oldPassword: String, newPassword: String, confirmNewPassword: String) {
        if (oldPassword.isEmpty() || newPassword.isEmpty() || confirmNewPassword.isEmpty()) {
            warning.value = "Field cannot be empty"
            return
        }
        if (newPassword != confirmNewPassword) {
            warning.value = "Konfirmasi password baru tidak cocok"
            return
        }
        loading.value = true
        mikaSdk.changePassword(oldPassword, newPassword, BaseMikaCallback(
            complete = { loading.value = false },
            success = { changePasswordSuccess.value = true },
            failure = { warning.value = it.message },
            error = { warning.value = it.message }
        ))
    }
}
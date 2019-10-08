package id.mikaapp.mika.agent.agenthome.profile

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.ext.liveData
import id.mikaapp.mika.liveevent.LiveEvent
import id.mikaapp.sdk.MikaSdk

class ProfileViewModel(private val mikaSdk: MikaSdk) : ViewModel() {

    private val loading = MutableLiveData<Boolean>()
    val loadingState = loading.liveData

    private val logoutSuccess = LiveEvent<Boolean>()
    val logoutSuccessState = logoutSuccess.liveData

    private val warning = LiveEvent<String>()
    val warningState = warning.liveData

    fun logout() {
        loading.value = true
        mikaSdk.logout(BaseMikaCallback(
            complete = { loading.value = false },
            success = { logoutSuccess.value = true },
            failure = { warning.value = it.message },
            error = { warning.value = it.localizedMessage }
        ))
    }

}

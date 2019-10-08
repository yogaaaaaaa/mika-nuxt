package id.mikaapp.mika.login

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.agent.agenthome.AgentHomeActivity
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.ext.liveData
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.MikaCallback
import id.mikaapp.sdk.models.*

/**
 * Created by grahamdesmon on 05/04/19.
 */

class LoginViewModel(
    private val mikaSdk: MikaSdk,
    private val localPersistentDataSource: LocalPersistentDataSource,
    application: Application
) : AndroidViewModel(application) {

    private val loading = MutableLiveData<Boolean>()
    val loadingState: LiveData<Boolean> = loading

    private val usernameFieldError = MutableLiveData<String?>()
    val usernameFieldErrorState = usernameFieldError.liveData

    private val passwordFieldError = MutableLiveData<String?>()
    val passwordFieldErrorState = passwordFieldError.liveData

    private val warning = MutableLiveData<String>()
    val warningState: LiveData<String> = warning

    private val navigate = MutableLiveData<Class<*>>()
    val navigateState = navigate.liveData

    private var username = ""
    private var password = ""

    fun login() {
        val usernameEmpty = username.isEmpty()
        val passwordEmpty = password.isEmpty()
        if (usernameEmpty || passwordEmpty) {
            if (usernameEmpty) usernameFieldError.value = "Nama Pengguna tidak boleh kosong"
            if (passwordEmpty) passwordFieldError.value = "Kata Sandi tidak boleh kosong"
        } else {
            loading.value = true
            mikaSdk.login(username, password, object : MikaCallback<LoginResponse> {
                override fun onSuccess(response: LoginResponse) {
                    loading.value = false
                    getAccount(response.data.userType!!)
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    val warningConverted = when (errorResponse.message) {
                        "Invalid credential for authentication" -> "Username/Password salah"
                        else -> errorResponse.message
                    }
                    loading.value = false
                    warning.value = warningConverted
                }

                override fun onError(error: Throwable) {
                    loading.value = false
                    warning.value = error.localizedMessage
                }
            })
        }
    }

    fun processUsernameInput(input: String?) {
        username = input ?: ""
        usernameFieldError.apply { if (value != null) value = null }
    }

    fun processPasswordInput(input: String?) {
        password = input ?: ""
        passwordFieldError.apply { if (value != null) value = null }
    }

    private fun getAccount(userType: String) {
        when (userType) {
            "agent" -> {
                mikaSdk.getAgentInfo(object : MikaCallback<AgentResponse> {
                    override fun onSuccess(response: AgentResponse) {
                        localPersistentDataSource.save {
                            userType("agent")
                            outletName(response.data.outlet.name)
                            outletAddress(response.data.outlet.streetAddress)
                            merchantName(response.data.outlet.merchant.name)
                        }
                        getAcquirers(userType)
                    }

                    override fun onFailure(errorResponse: BasicResponse) {
                        loading.value = false
                        warning.value = errorResponse.message
                    }

                    override fun onError(error: Throwable) {
                        loading.value = false
                        warning.value = error.localizedMessage
                    }

                })
            }

            "merchantStaff" -> {
                mikaSdk.getMerchantStaffInfo(object : MikaCallback<MerchantStaffResponse> {
                    override fun onSuccess(response: MerchantStaffResponse) {
                        localPersistentDataSource.save {
                            userType("merchantStaff")
                            merchantName(response.data.merchant.name)
                            outletAddress(response.data.merchant.streetAddress)
                        }
                        getAcquirers(userType)
                    }

                    override fun onFailure(errorResponse: BasicResponse) {
                        loading.value = false
                        warning.value = errorResponse.message
                    }

                    override fun onError(error: Throwable) {
                        loading.value = false
                        warning.value = error.localizedMessage
                    }

                })
            }
        }
    }

    private fun getAcquirers(userType: String) {
        mikaSdk.getAcquirers(object : MikaCallback<ArrayList<Acquirer>> {
            override fun onSuccess(response: ArrayList<Acquirer>) {
                localPersistentDataSource.save { acquirers(response) }
                loading.value = false
                when (userType) {
                    "agent" -> navigate.value = AgentHomeActivity::class.java
                    else -> warning.value = "Tipe user tidak diketahui"
                }
            }

            override fun onFailure(errorResponse: BasicResponse) {
                loading.value = false
                warning.value = errorResponse.message
            }

            override fun onError(error: Throwable) {
                loading.value = false
                warning.value = error.localizedMessage
            }

        })
    }
}
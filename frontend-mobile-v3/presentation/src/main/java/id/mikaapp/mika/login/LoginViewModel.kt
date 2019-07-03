package id.mikaapp.mika.login

import androidx.lifecycle.MutableLiveData
import id.mikaapp.domain.common.Mapper
import id.mikaapp.domain.entities.UserEntity
import id.mikaapp.domain.usecases.UserLogin
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.mika.entities.User
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.AcquirerCallback
import id.mikaapp.sdk.callbacks.AgentInfoCallback
import id.mikaapp.sdk.callbacks.LoginCallback
import id.mikaapp.sdk.callbacks.MerchantStaffCallback
import id.mikaapp.sdk.models.*

/**
 * Created by grahamdesmon on 05/04/19.
 */

class LoginViewModel(
    private val userLogin: UserLogin,
    private val entityUserMapper: Mapper<UserEntity, User>,
    private val mikaSdk: MikaSdk
) : BaseViewModel() {

    var viewState: MutableLiveData<LoginViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = LoginViewState()
    }

    lateinit var userEntity: UserEntity

    fun login(username: String, password: String) {
        errorState.value = null

        if (username.isEmpty() || password.isEmpty()) {
            viewState.value = viewState.value?.copy(
                showLoading = false,
                isUsernameOrPasswordEmpty = true,
                user = null,
                agentInfo = null,
                loginSuccess = false
            )
        } else {
            viewState.value = viewState.value?.copy(
                showLoading = true,
                agentInfo = null,
                isUsernameOrPasswordEmpty = false,
                loginSuccess = false
            )

//            performLogin(username, password)
            performLoginSdk(username, password)
        }
    }

    fun getAccount(userType: String) {
        when (userType) {
            "agent" -> {
                mikaSdk.getAgentInfo(object : AgentInfoCallback {
                    override fun onSuccess(response: AgentResponse) {
                        viewState.value?.let {
                            val newState = viewState.value?.copy(
                                agentInfo = response,
                                showLoading = true
                            )
                            getAcquirers()
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

            "merchantStaff" -> {
                mikaSdk.getMerchantStaffInfo(object : MerchantStaffCallback {
                    override fun onSuccess(response: MerchantStaffResponse) {
                        viewState.value?.let {
                            val newState = viewState.value?.copy(
                                merchantStaffInfo = response,
                                showLoading = true
                            )
                            getAcquirers()
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
    }

    fun getAcquirers() {
        mikaSdk.getAcquirers(object : AcquirerCallback {
            override fun onSuccess(response: ArrayList<Acquirer>) {
                viewState.value?.let {
                    val newState = viewState.value?.copy(
                        showLoading = false,
                        acquirers = response
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

    private fun performLogin(username: String, password: String) {
        addDisposable(userLogin.login(username, password)
            .map {
                it.value?.let {
                    userEntity = it
                    entityUserMapper.mapFrom(userEntity)
                } ?: run {
                    throw Throwable("Something went wrong")
                }
            }
            .subscribe({ user ->
                viewState.value?.let {
                    val newState = this.viewState.value?.copy(
                        showLoading = false,
                        isUsernameOrPasswordEmpty = false,
                        user = user,
                        loginSuccess = true
                    )
                    this.viewState.value = newState
                    this.errorState.value = null
                }
            }, {
                viewState.value = viewState.value?.copy(showLoading = false)
                errorState.value = it
            })
        )
    }

    private fun performLoginSdk(username: String, password: String) {
        mikaSdk.login(username, password, loginCallback)
    }

    private val loginCallback = object : LoginCallback {
        override fun onSuccess(response: LoginResponse) {
            viewState.value?.let {
                val newState = viewState.value?.copy(
                    isUsernameOrPasswordEmpty = false,
                    loginSuccess = true,
                    showLoading = true,
                    agentInfo = null
                )

                getAccount(response.data.userType!!)
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
    }
}
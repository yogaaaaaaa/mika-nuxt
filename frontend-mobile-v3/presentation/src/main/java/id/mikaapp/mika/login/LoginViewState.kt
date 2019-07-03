package id.mikaapp.mika.login

import id.mikaapp.mika.entities.User
import id.mikaapp.sdk.models.Acquirer
import id.mikaapp.sdk.models.AgentResponse
import id.mikaapp.sdk.models.MerchantStaffResponse

/**
 * Created by grahamdesmon on 05/04/19.
 */

data class LoginViewState(
    val showLoading: Boolean = false,
    val isUsernameOrPasswordEmpty: Boolean = false,
    val user: User? = null,
    val agentInfo: AgentResponse? = null,
    val merchantStaffInfo: MerchantStaffResponse? = null,
    val loginSuccess: Boolean = false,
    val acquirers: ArrayList<Acquirer>? = null
)
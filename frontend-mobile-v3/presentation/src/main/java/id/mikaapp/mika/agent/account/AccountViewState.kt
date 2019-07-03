package id.mikaapp.mika.agent.account

import id.mikaapp.sdk.models.AgentResponse
import id.mikaapp.sdk.models.MerchantStaffResponse

/**
 * Created by grahamdesmon on 13/04/19.
 */

data class AccountViewState(
    val showLoading: Boolean = true,
    val agentAccount: AgentResponse? = null,
    val staffAccount: MerchantStaffResponse? = null
)
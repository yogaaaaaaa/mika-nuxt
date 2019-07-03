package id.mikaapp.mika.agent.transactiondetail

import id.mikaapp.sdk.models.AgentResponse
import id.mikaapp.sdk.models.MerchantStaffResponse
import id.mikaapp.sdk.models.TransactionDetail

/**
 * Created by grahamdesmon on 14/04/19.
 */

data class TransactionDetailViewState(
    val showLoading: Boolean = true,
    val transactionDetail: TransactionDetail? = null,
    val agentAccount: AgentResponse? = null,
    val staffAccount: MerchantStaffResponse? = null
)
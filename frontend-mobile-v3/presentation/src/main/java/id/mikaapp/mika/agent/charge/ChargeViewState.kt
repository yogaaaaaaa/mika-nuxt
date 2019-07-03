package id.mikaapp.mika.agent.charge

import id.mikaapp.sdk.models.TokenTransaction

/**
 * Created by grahamdesmon on 18/04/19.
 */

data class ChargeViewState(
    val showLoading: Boolean = false,
    var tokenTransaction: TokenTransaction? = null
)
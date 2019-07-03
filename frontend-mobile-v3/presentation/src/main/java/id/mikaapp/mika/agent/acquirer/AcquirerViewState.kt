package id.mikaapp.mika.agent.acquirer

import id.mikaapp.sdk.models.Acquirer
import id.mikaapp.sdk.models.TokenTransaction

/**
 * Created by grahamdesmon on 13/04/19.
 */

data class AcquirerViewState(
    val showLoadingDialog: Boolean = false,
    val acquirers: ArrayList<Acquirer>? = null,
    val tokenTransaction: TokenTransaction? = null
)
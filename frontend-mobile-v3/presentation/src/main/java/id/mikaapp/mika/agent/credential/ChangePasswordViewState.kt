package id.mikaapp.mika.agent.credential

import id.mikaapp.sdk.models.BasicResponse

/**
 * Created by grahamdesmon on 15/04/19.
 */

data class ChangePasswordViewState(
    val isLoading: Boolean = false,
    val isPasswordEmpty: Boolean = false,
    val changePasswordSuccess: Boolean = false,
    val response: BasicResponse? = null
)
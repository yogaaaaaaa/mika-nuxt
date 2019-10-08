package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.CheckResponse

interface CheckLoginSessionCallback : HttpRequestCallback {

    fun onSuccess(response: CheckResponse)
    fun onFailure(errorResponse: BasicResponse)
}


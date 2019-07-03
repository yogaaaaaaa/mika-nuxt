package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse

interface LogoutCallback : HttpRequestCallback {

    fun onSuccess(response: BasicResponse)
    fun onFailure(errorResponse: BasicResponse)
}
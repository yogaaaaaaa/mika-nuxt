package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.LoginResponse
import id.mikaapp.sdk.models.BasicResponse

interface LoginCallback : HttpRequestCallback {

    fun onSuccess(response: LoginResponse)
    fun onFailure(errorResponse: BasicResponse)
}
package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse

interface MikaCallback <T> {
    fun onSuccess(response: T)
    fun onFailure(errorResponse: BasicResponse)
    fun onError(error : Throwable)
}
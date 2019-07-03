package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.Acquirer
import java.util.*

interface AcquirerCallback : HttpRequestCallback {

    fun onSuccess(response: ArrayList<Acquirer>)
    fun onFailure(errorResponse: BasicResponse)
}
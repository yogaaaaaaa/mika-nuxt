package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantOutlet

interface MerchantOutletCallback : HttpRequestCallback {

    fun onSuccess(response: ArrayList<MerchantOutlet>)
    fun onFailure(errorResponse: BasicResponse)
}
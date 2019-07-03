package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantStatisticCount

interface MerchantStatisticCallback : HttpRequestCallback {

    fun onSuccess(response: ArrayList<MerchantStatisticCount>)
    fun onFailure(errorResponse: BasicResponse)
}
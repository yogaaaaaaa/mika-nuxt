package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantStaffResponse

interface MerchantStaffCallback : HttpRequestCallback {

    fun onSuccess(response: MerchantStaffResponse)
    fun onFailure(errorResponse: BasicResponse)
}
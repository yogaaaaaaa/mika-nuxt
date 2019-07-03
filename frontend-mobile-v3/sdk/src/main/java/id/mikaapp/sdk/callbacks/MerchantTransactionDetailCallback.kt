package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantTransactionDetail

interface MerchantTransactionDetailCallback : HttpRequestCallback {

    fun onSuccess(response: MerchantTransactionDetail)
    fun onFailure(errorResponse: BasicResponse)
}
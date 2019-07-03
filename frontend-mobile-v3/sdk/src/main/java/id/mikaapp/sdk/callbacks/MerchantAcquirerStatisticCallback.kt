package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.MerchantTransactionStatistic
import id.mikaapp.sdk.models.BasicResponse

interface MerchantAcquirerStatisticCallback : HttpRequestCallback {

    fun onSuccess(response: ArrayList<MerchantTransactionStatistic>)
    fun onFailure(errorResponse: BasicResponse)
}
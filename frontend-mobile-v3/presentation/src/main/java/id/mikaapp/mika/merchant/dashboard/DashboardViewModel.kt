package id.mikaapp.mika.merchant.dashboard

import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.MerchantAcquirerStatisticCallback
import id.mikaapp.sdk.callbacks.MerchantStatisticCallback
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantStatisticCount
import id.mikaapp.sdk.models.MerchantTransactionStatistic

class DashboardViewModel(private val mikaSdk: MikaSdk) : BaseViewModel() {

    var viewState: MutableLiveData<DashboardViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = DashboardViewState()
    }

    fun getMerchantStatisticByAcquirer(startDate: String, endDate: String, outletId: String) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            showLoading = true,
            transactionAcquirer = null,
            transactionCount = null,
            lineChartData = null
        )

        performGetStatByAcquirer(startDate, endDate, outletId)
    }

    fun getMerchantStatisticByTimeCount(
        group: String,
        groupTime: String,
        utcOffset: String,
        outletId: String,
        startDate: String,
        endDate: String
    ) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            showLoading = true,
            transactionAcquirer = null,
            transactionCount = null,
            lineChartData = null
        )

        performGetStatByTimeCount(group, groupTime, utcOffset, outletId, startDate, endDate)
    }

    fun getLineChartData(
        startDate: String,
        endDate: String,
        group: String,
        groupTime: String,
        utcOffset: String,
        outletId: String
    ) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            showLoading = true,
            transactionAcquirer = null,
            transactionCount = null,
            lineChartData = null
        )

        performGetLineChartData(startDate, endDate, group, groupTime, utcOffset, outletId)
    }

    private fun performGetStatByAcquirer(startDate: String, endDate: String, outletId: String) {
        mikaSdk.getMerchantStatisticByAcquirer(
            startDate,
            endDate,
            outletId,
            object : MerchantAcquirerStatisticCallback {
                override fun onSuccess(response: ArrayList<MerchantTransactionStatistic>) {
                    val newState = viewState.value?.copy(
                        transactionAcquirer = response,
                        transactionCount = null,
                        lineChartData = null
                    )
                    viewState.value = newState
                    errorState.value = null
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = Throwable(errorResponse.message)
                }

                override fun onError(error: Throwable) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = error
                }

            })
    }

    private fun performGetStatByTimeCount(
        group: String,
        groupTime: String,
        utcOffset: String,
        outletId: String,
        startDate: String,
        endDate: String
    ) {
        mikaSdk.getMerchantStatisticByTimeCount(
            startDate,
            endDate,
            group,
            groupTime,
            utcOffset,
            outletId,
            object : MerchantStatisticCallback {
                override fun onSuccess(response: ArrayList<MerchantStatisticCount>) {
                    val newState = viewState.value?.copy(
                        transactionAcquirer = null,
                        transactionCount = response,
                        lineChartData = null
                    )
                    viewState.value = newState
                    errorState.value = null
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = Throwable(errorResponse.message)
                }

                override fun onError(error: Throwable) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = error
                }

            })
    }


    private fun performGetLineChartData(
        startDate: String,
        endDate: String,
        group: String,
        groupTime: String,
        utcOffset: String,
        outletId: String
    ) {
        mikaSdk.getMerchantStatisticByTimeCount(
            startDate,
            endDate,
            group,
            groupTime,
            utcOffset,
            outletId,
            object : MerchantStatisticCallback {
                override fun onSuccess(response: ArrayList<MerchantStatisticCount>) {
                    val newState = viewState.value?.copy(
                        transactionAcquirer = null,
                        transactionCount = null,
                        lineChartData = response
                    )
                    viewState.value = newState
                    errorState.value = null
                }

                override fun onFailure(errorResponse: BasicResponse) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = Throwable(errorResponse.message)
                }

                override fun onError(error: Throwable) {
                    viewState.value = viewState.value?.copy(showLoading = false)
                    errorState.value = error
                }

            })
    }
}
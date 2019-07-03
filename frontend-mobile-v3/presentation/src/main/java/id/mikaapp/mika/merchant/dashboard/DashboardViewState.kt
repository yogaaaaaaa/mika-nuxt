package id.mikaapp.mika.merchant.dashboard

import id.mikaapp.sdk.models.MerchantStatisticCount
import id.mikaapp.sdk.models.MerchantTransactionStatistic

data class DashboardViewState(
    val showLoading: Boolean = false,
    val transactionCount: ArrayList<MerchantStatisticCount>? = null,
    val transactionAcquirer: ArrayList<MerchantTransactionStatistic>? = null,
    val lineChartData: ArrayList<MerchantStatisticCount>? = null
)
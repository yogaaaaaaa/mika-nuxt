package id.mikaapp.mika.merchant.dashboard

import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.PieEntry
import id.mikaapp.sdk.models.MerchantTransactionStatistic
import java.math.BigDecimal

data class DashboardModel(
    var totalIncome: BigDecimal = BigDecimal(0.0),
    var totalTransaction: Int = 0,
    var totalNett: Double = 0.0,
    var type: Int,
    var paymentMethods: ArrayList<MerchantTransactionStatistic> = ArrayList(),
    var pieEntries: ArrayList<PieEntry> = ArrayList(),
    var lineEntries: ArrayList<Entry> = ArrayList(),
    var colors: ArrayList<Int> = ArrayList(),
    var maxY: Long = -1,
    var minY: Long = java.lang.Long.MAX_VALUE,
    var title: String? = "",
    var maxTime: String? = "",
    var isShowTitle: Boolean = true,
    var year: String = "",
    var month: String = "",
    var day: String = "",
    var acquirerId: String = "",
    var timeGroup: String? = ""
)
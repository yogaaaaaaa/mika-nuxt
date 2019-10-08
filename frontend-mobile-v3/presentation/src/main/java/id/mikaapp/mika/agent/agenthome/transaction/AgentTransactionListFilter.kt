package id.mikaapp.mika.agent.agenthome.transaction

import id.mikaapp.mika.agent.agenthome.transaction.FilterTimeRange.Day
import id.mikaapp.mika.agent.agenthome.transaction.FilterTimeRange.Month
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerListItemUiModel.Acquirer
import id.mikaapp.mika.ext.DateFormat.DayNameDayMonthYear
import id.mikaapp.mika.ext.DateFormat.MonthNameYear
import id.mikaapp.mika.ext.apiStringFormat
import id.mikaapp.mika.ext.toString
import java.util.*

data class AgentTransactionListFilter(
    val acquirer: Acquirer? = null,
    val date: Date? = null,
    val filterTimeRange: FilterTimeRange? = null
) {
    constructor(day: Int, month: Int, year: Int, filterTimeRange: FilterTimeRange) : this(
        date = Calendar.getInstance().apply { set(year, month, day) }.time,
        filterTimeRange = filterTimeRange
    )

    fun copy(): AgentTransactionListFilter {
        return AgentTransactionListFilter()
    }

    val startDate: String? = if (filterTimeRange != null && date != null) when (filterTimeRange) {
        Day -> Calendar.getInstance().apply {
            time = date
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.time.apiStringFormat
        Month -> Calendar.getInstance().apply {
            time = date
            set(Calendar.DATE, 1)
        }.time.apiStringFormat
    } else null

    val endDate: String? = if (filterTimeRange != null && date != null) Calendar.getInstance().apply {
        time = date
        when (filterTimeRange) {
            Day -> {
                add(Calendar.DATE, 1)
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            Month -> {
                add(Calendar.MONTH, 1)
                set(Calendar.DATE, 1)
                add(Calendar.DATE, -1)
            }
        }
    }.time.apiStringFormat else null

    val hasFilter: Boolean
        get() {
            if (date != null && filterTimeRange != null) return true
            if (acquirer != null) return true
            return false
        }

    fun uiModel(): String? {
        var result = ""
        if (filterTimeRange != null && date != null) {
            result += when (filterTimeRange) {
                Day -> date.toString(DayNameDayMonthYear)
                Month -> date.toString(MonthNameYear)
            }
            if (acquirer != null) result += ", "
        }
        if (acquirer != null) {
            result += acquirer.name
        }
        return if (result.isEmpty()) null else result
    }
}
package id.mikaapp.mika.ext

import id.mikaapp.mika.ext.DateConstants.Companion.apiDateFormat
import id.mikaapp.mika.ext.DateFormat.*
import java.text.SimpleDateFormat
import java.util.*

class DateConstants {
    companion object {
        const val apiDateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        const val dayNameDayMonthYearFormat = "EEEE, d-MMM-y"
        const val dayMonthYearFormat = "d-MMM-y"
        const val hourMinuteSecondFormat = "HH:mm:ss"
        const val MonthNameYearFormat = "MMMM-y"
    }
}

enum class DateFormat {
    DayNameDayMonthYear,
    DayMonthYear,
    HourMinuteSecond,
    MonthNameYear
}

// 2019-07-23T04:05:18.000Z
fun Date.toString(format: DateFormat): String {
    val locale = Locale("in", "ID")
    return when (format) {
        DayNameDayMonthYear -> {
            SimpleDateFormat(DateConstants.dayNameDayMonthYearFormat, locale).apply {
                timeZone = TimeZone.getDefault()
            }.format(this)
        }
        DayMonthYear -> {
            SimpleDateFormat(DateConstants.dayMonthYearFormat, locale).apply {
                timeZone = TimeZone.getDefault()
            }.format(this)
        }
        HourMinuteSecond -> {
            SimpleDateFormat(DateConstants.hourMinuteSecondFormat, locale).apply {
                timeZone = TimeZone.getDefault()
            }.format(this)
        }
        MonthNameYear -> {
            SimpleDateFormat(DateConstants.MonthNameYearFormat, locale).apply {
                timeZone = TimeZone.getDefault()
            }.format(this)
        }
    }
}

fun Date.isSameDay(other: Date): Boolean {
    val sdf = SimpleDateFormat("yyMMdd", Locale("in", "ID"))
    return (sdf.format(this) == sdf.format(other))
}

val Date.apiStringFormat: String
    get() = SimpleDateFormat(
        apiDateFormat,
        Locale.ENGLISH
    ).format(this)

fun getDate(day: Int, month: Int, year: Int): Date {
    return Calendar.getInstance()
        .apply { set(year, month, day, 0, 0, 0); set(Calendar.MILLISECOND, 0) }.time
}
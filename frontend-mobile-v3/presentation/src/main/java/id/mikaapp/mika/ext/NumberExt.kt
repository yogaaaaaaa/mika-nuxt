package id.mikaapp.mika.ext

import java.text.NumberFormat
import java.util.*

val Number.currencyFormatted: String
    get() = NumberFormat.getCurrencyInstance(Locale("in", "ID"))
        .format(this).replaceRange(2, 2, " ")
package id.mikaapp.mika.ext

import kotlin.math.ceil
import kotlin.math.floor

val Float.floorInt
    get() = floor(this).toInt()
val Float.ceilInt
    get() = ceil(this).toInt()
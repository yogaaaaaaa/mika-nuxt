package id.mikaapp.mika.ext

import android.graphics.Bitmap
import android.text.TextUtils
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.journeyapps.barcodescanner.BarcodeEncoder
import id.mikaapp.mika.R
import id.mikaapp.mika.ext.DateConstants.Companion.apiDateFormat
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.min

private val PREFIXES_AMERICAN_EXPRESS = arrayOf("34", "37")
private val PREFIXES_DISCOVER = arrayOf("60", "62", "64", "65")
private val PREFIXES_JCB = arrayOf("35")
private val PREFIXES_DINERS_CLUB = arrayOf("300", "301", "302", "303", "304", "305", "309", "36", "38", "39")
private val PREFIXES_VISA = arrayOf("4")
private val PREFIXES_MASTERCARD = arrayOf(
    "2221",
    "2222",
    "2223",
    "2224",
    "2225",
    "2226",
    "2227",
    "2228",
    "2229",
    "223",
    "224",
    "225",
    "226",
    "227",
    "228",
    "229",
    "23",
    "24",
    "25",
    "26",
    "270",
    "271",
    "2720",
    "50",
    "51",
    "52",
    "53",
    "54",
    "55"
)

val String.mikaDate: Date
    get() {
        return SimpleDateFormat(apiDateFormat, Locale.ENGLISH)
            .apply { timeZone = TimeZone.getTimeZone("UTC") }
            .parse(this)
    }

fun String.insertEvery(every: Int, toInsert: String): String {
    val stringSplit = ArrayList<String>()
    var index = 0
    while (index < length) {
        stringSplit.add(substring(index, min(index + every, length)))
        index += every
    }
    return TextUtils.join(toInsert, stringSplit)
}

fun String.toBarcode(width: Int, height: Int): Bitmap {
    val multiFormatWriter = MultiFormatWriter()
    val bitMatrix = multiFormatWriter.encode(this, BarcodeFormat.QR_CODE, width, height)
    val barcodeEncoder = BarcodeEncoder()
    return barcodeEncoder.createBitmap(bitMatrix)
}

fun <T> tryOptional(block: () -> T): T? {
    return try {
        block()
    } catch (e: Exception) {
        null
    }
}

val String.cardLogoDrawableRes: Int?
    get() {
        PREFIXES_AMERICAN_EXPRESS.forEach { if (startsWith(it)) return R.drawable.logo_american_express }
        PREFIXES_DISCOVER.forEach { if (startsWith(it)) return R.drawable.logo_discovers }
        PREFIXES_JCB.forEach { if (startsWith(it)) return R.drawable.logo_jcb }
        PREFIXES_DINERS_CLUB.forEach { if (startsWith(it)) return R.drawable.logo_diners_club }
        PREFIXES_VISA.forEach { if (startsWith(it)) return R.drawable.logo_visa }
        PREFIXES_MASTERCARD.forEach { if (startsWith(it)) return R.drawable.logo_mastercard }
        return null
    }
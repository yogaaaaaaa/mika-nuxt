package id.mikaapp.sdk.ext

import android.text.TextUtils
import android.util.Log
import id.mikaapp.sdk.models.TLV
import java.util.*

fun String.toTlvMap(): Map<String, TLV> {
    val map = LinkedHashMap<String, TLV>()
    if (TextUtils.isEmpty(this) || length % 2 != 0) return map
    var position = 0
    while (position < this.length) {
        val tupleTag = getTlvTag(position)
        if (TextUtils.isEmpty(tupleTag.first) || "00" == tupleTag.first) {
            break
        }
        val tupleLen = getTlvLength(tupleTag.second)
        val tupleValue = getTlvValue(tupleLen.second, tupleLen.first)
        Log.e("TLV-buildTLVMap", tupleTag.first + ":" + tupleValue.second)
        map[tupleTag.first] = TLV(tupleTag.first, tupleLen.first, tupleValue.first)
        position = tupleValue.second
    }
    return map
}


fun String.getTlvTag(position: Int): Pair<String, Int> {
    var tag = ""
    try {
        val byte1 = substring(position, position + 2)
        val byte2 = substring(position + 2, position + 4)
        val b1 = Integer.parseInt(byte1, 16)
        val b2 = Integer.parseInt(byte2, 16)
        tag = if (b1 and 0x1F == 0x1F) {
            if (b2 and 0x80 == 0x80) {
                substring(position, position + 6)
            } else {
                substring(position, position + 4)
            }
        } else {
            substring(position, position + 2)
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }

    return Pair(tag.toUpperCase(), position + tag.length)
}

fun String.getTlvLength(position: Int): Pair<Int, Int> {

    var index = position
    var hexLen = substring(index, index + 2)
    index += 2
    val byte1 = Integer.parseInt(hexLen, 16)
    if (byte1 and 0x80 != 0) {// 最左侧的bit位为1
        val subLen = byte1 and 0x7F
        hexLen = substring(index, index + subLen * 2)
        index += subLen * 2
    }
    return Pair(Integer.parseInt(hexLen, 16), index)
}

fun String.getTlvValue(position: Int, len: Int): Pair<String, Int> {
    var value = ""
    try {
        value = substring(position, position + len * 2)
    } catch (e: Exception) {
        e.printStackTrace()
    }

    return Pair(value.toUpperCase(), position + len * 2)

}

fun String.hexToByteArray(): ByteArray {
    val hexStr = toLowerCase()
    val length = hexStr.length
    val bytes = ByteArray(length shr 1)
    var index = 0
    for (i in 0 until length) {
        if (index > hexStr.length - 1) return bytes
        val highDit = (Character.digit(hexStr[index], 16) and 0xFF).toByte()
        val lowDit = (Character.digit(hexStr[index + 1], 16) and 0xFF).toByte()
        bytes[i] = (highDit.toInt() shl 4 or lowDit.toInt()).toByte()
        index += 2
    }
    return bytes
}
package id.mikaapp.sdk.ext

internal fun ByteArray.toHexString(): String {
    val sb = StringBuilder()
    for (b in this) {
        val st = String.format("%02X", b)
        sb.append(st)
    }
    return sb.toString().toUpperCase()
}
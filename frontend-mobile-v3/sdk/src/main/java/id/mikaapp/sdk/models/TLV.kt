package id.mikaapp.sdk.models

class TLV {

    val tag: String
    val length: Int
    val value: String

    constructor(tag: String, value: String) {
        this.tag = null2UpperCaseString(tag)
        this.value = null2UpperCaseString(value)
        this.length = value.toByteArray().size
    }

    constructor(tag: String, length: Int, value: String) {
        this.tag = null2UpperCaseString(tag)
        this.length = length
        this.value = null2UpperCaseString(value)
    }


//    fun recoverToHexStr(): String {
//        return TLVUtil.revertToHexStr(this)
//    }
//
//
//    fun recoverToBytes(): ByteArray {
//        return TLVUtil.revertToBytes(this)
//    }

    override fun toString(): String {
        return "tag=[$tag],length=[$length],value=[$value]"
    }

    private fun null2UpperCaseString(src: String?): String {
        return src?.toUpperCase() ?: ""
    }


}
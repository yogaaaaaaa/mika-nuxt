package id.mikaapp.sdk.models

import android.graphics.Bitmap
import com.google.gson.annotations.SerializedName

data class TokenTransaction(
    @SerializedName("transactionId")
    val transactionId: String,
    @SerializedName("agentId")
    internal val agentId: String,
    @SerializedName("acquirerId")
    val acquirerId: String,
    @SerializedName("amount")
    val amount: Int,
    @SerializedName("transactionStatus")
    /**
     * Indicate status of transaction, two state define :
     * inquiry means transaction is already created and pending for payment,
     * success means transaction is finished,
     * failed means transaction is failed in processing or timed out
     */
    val transactionStatus: String,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("expirySecond")
    val expirySecond: Int,
    @SerializedName("token")
    /**
     * Token value, dependent to tokenType attributes
     */
    val token: String,
    @SerializedName("tokenType")
    /**
     * Describe type of token, because payment gateway have different kind of token to represent payment identifier,
     * like number or QR Code.
     * Two tokenType is defined for now, qrCodeContent means that token attributes value need to be converted into
     * QR Code, qrCodeUrlImage means that token attributes value is a URL of already generated QR Code image.
     */
    val tokenType: String,
    /**
     * The QR code image generated if the tokenType value is qrCodeContent
     */
    var qrImage: Bitmap,
    var isUrl: Boolean
)
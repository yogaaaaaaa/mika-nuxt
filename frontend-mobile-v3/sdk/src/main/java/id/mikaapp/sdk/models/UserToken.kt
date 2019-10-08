package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class UserToken(
    @SerializedName("cardTypesOnly")
    val cardTypesOnly: List<String>,
    @SerializedName("signatureData")
    val signatureData: String,
    @SerializedName("pinblockData")
    val pinBlockData: String,
    @SerializedName("emvData")
    val emvData: String,
    @SerializedName("track2Data")
    val track2Data: String
)
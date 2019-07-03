package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class MerchantStaff(
    @SerializedName("city")
    val city: Any,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("description")
    val description: Any,
    @SerializedName("district")
    val district: Any,
    @SerializedName("email")
    val email: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("idCardNumber")
    val idCardNumber: String,
    @SerializedName("idCardType")
    val idCardType: String,
    @SerializedName("locality")
    val locality: Any,
    @SerializedName("locationLat")
    val locationLat: Any,
    @SerializedName("locationLong")
    val locationLong: Any,
    @SerializedName("merchant")
    val merchant: Merchant,
    @SerializedName("merchantId")
    val merchantId: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("occupation")
    val occupation: String,
    @SerializedName("phoneNumber")
    val phoneNumber: Any,
    @SerializedName("postalCode")
    val postalCode: Any,
    @SerializedName("province")
    val province: Any,
    @SerializedName("streetAddress")
    val streetAddress: String,
    @SerializedName("updatedAt")
    val updatedAt: String,
    @SerializedName("userId")
    val userId: String
)
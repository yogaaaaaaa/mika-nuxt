package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class Outlet(
    @SerializedName("businessType")
    val businessType: Any,
    @SerializedName("city")
    val city: Any,
    @SerializedName("description")
    val description: Any,
    @SerializedName("district")
    val district: Any,
    @SerializedName("email")
    val email: Any,
    @SerializedName("id")
    val id: String,
    @SerializedName("idAlias")
    val idAlias: Any,
    @SerializedName("locality")
    val locality: Any,
    @SerializedName("locationLat")
    val locationLat: Any,
    @SerializedName("locationLong")
    val locationLong: Any,
    @SerializedName("merchant")
    val merchant: Merchant,
    @SerializedName("name")
    val name: String,
    @SerializedName("phoneNumber")
    val phoneNumber: String,
    @SerializedName("postalCode")
    val postalCode: Any,
    @SerializedName("province")
    val province: Any,
    @SerializedName("status")
    val status: Any,
    @SerializedName("streetAddress")
    val streetAddress: String,
    @SerializedName("website")
    val website: Any
)
package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class MerchantOutlet(
    @SerializedName("businessDurationMonth")
    val businessDurationMonth: Any? = null,
    @SerializedName("businessMonthlyTurnover")
    val businessMonthlyTurnover: Any? = null,
    @SerializedName("businessType")
    val businessType: Any? = null,
    @SerializedName("cashierDeskPhotoResourceId")
    val cashierDeskPhotoResourceId: Any? = null,
    @SerializedName("city")
    val city: Any? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("description")
    val description: Any? = null,
    @SerializedName("district")
    val district: Any? = null,
    @SerializedName("email")
    val email: Any? = null,
    @SerializedName("id")
    val id: String,
    @SerializedName("idAlias")
    val idAlias: Any? = null,
    @SerializedName("locality")
    val locality: Any? = null,
    @SerializedName("locationLat")
    val locationLat: Any? = null,
    @SerializedName("locationLong")
    val locationLong: Any? = null,
    @SerializedName("merchantId")
    val merchantId: Int,
    @SerializedName("name")
    val name: String,
    @SerializedName("otherPaymentSystems")
    val otherPaymentSystems: Any? = null,
    @SerializedName("outletPhotoResourceId")
    val outletPhotoResourceId: Any? = null,
    @SerializedName("ownershipType")
    val ownershipType: Any? = null,
    @SerializedName("phoneNumber")
    val phoneNumber: String? = null,
    @SerializedName("postalCode")
    val postalCode: Any? = null,
    @SerializedName("province")
    val province: Any? = null,
    @SerializedName("rentDurationMonth")
    val rentDurationMonth: Any? = null,
    @SerializedName("rentStartDate")
    val rentStartDate: Any? = null,
    @SerializedName("status")
    val status: Any? = null,
    @SerializedName("streetAddress")
    val streetAddress: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null,
    @SerializedName("website")
    val website: Any? = null
)
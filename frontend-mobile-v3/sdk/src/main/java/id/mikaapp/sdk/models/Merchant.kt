package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class Merchant(
    @SerializedName("city")
    val city: Any,
    @SerializedName("companyForm")
    val companyForm: String,
    @SerializedName("description")
    val description: Any,
    @SerializedName("district")
    val district: Any,
    @SerializedName("email")
    val email: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("idAlias")
    val idAlias: String,
    @SerializedName("locality")
    val locality: Any,
    @SerializedName("name")
    val name: String,
    @SerializedName("ownerEmail")
    val ownerEmail: Any,
    @SerializedName("ownerName")
    val ownerName: Any,
    @SerializedName("ownerOccupation")
    val ownerOccupation: Any,
    @SerializedName("ownerPhoneNumber")
    val ownerPhoneNumber: Any,
    @SerializedName("phoneNumber")
    val phoneNumber: Any,
    @SerializedName("postalCode")
    val postalCode: Any,
    @SerializedName("province")
    val province: Any,
    @SerializedName("shortName")
    val shortName: String,
    @SerializedName("status")
    val status: Any,
    @SerializedName("streetAddress")
    val streetAddress: String,
    @SerializedName("website")
    val website: Any
)
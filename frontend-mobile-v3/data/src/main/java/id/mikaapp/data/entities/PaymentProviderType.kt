package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class PaymentProviderType(
    @SerializedName("chartColor")
    var chartColor: String,
    @SerializedName("class")
    var classX: String,
    @SerializedName("description")
    var description: Any,
    @SerializedName("id")
    var id: Int,
    @SerializedName("name")
    var name: String,
    @SerializedName("thumbnail")
    var thumbnail: String,
    @SerializedName("thumbnailGray")
    var thumbnailGray: String
)
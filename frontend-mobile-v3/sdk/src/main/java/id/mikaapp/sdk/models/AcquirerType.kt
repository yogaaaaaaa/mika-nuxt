package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class AcquirerType(
    @SerializedName("id")
    val id: String,
    @SerializedName("class")
    val classX: String,
    /**
     * Acquirer name
     */
    @SerializedName("name")
    val name: String,
    @SerializedName("description")
    val description: Any,
    @SerializedName("thumbnail")
    /**
     * Acquirer logo
     */
    val thumbnail: String,
    @SerializedName("thumbnailGray")
    /**
     * Acquirer logo in gray
     */
    val thumbnailGray: String,
    @SerializedName("chartColor")
    val chartColor: String
)
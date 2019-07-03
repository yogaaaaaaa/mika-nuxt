package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName
import java.math.BigDecimal

data class Handler(
    @SerializedName("name")
    val name: String,
    @SerializedName("classes")
    val classes: List<String>,
    @SerializedName("defaultMaximumAmount")
    val defaultMaximumAmount : BigDecimal? = null,
    @SerializedName("defaultMinimumAmount")
    val defaultMinimumAmount : BigDecimal? = null,
    @SerializedName("properties")
    val properties: Properties
)
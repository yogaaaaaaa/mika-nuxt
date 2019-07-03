package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class Handler(
    @SerializedName("classes")
    var classes: List<String>,
    @SerializedName("name")
    var name: String,
    @SerializedName("properties")
    var properties: Properties
)
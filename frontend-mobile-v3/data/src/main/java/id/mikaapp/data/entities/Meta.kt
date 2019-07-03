package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class Meta(
    @SerializedName("ofPages")
    var ofPages: Int,
    @SerializedName("page")
    var page: Int,
    @SerializedName("totalCount")
    var totalCount: Int
)
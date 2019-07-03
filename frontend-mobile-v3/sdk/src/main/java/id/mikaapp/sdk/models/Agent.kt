package id.mikaapp.sdk.models


import com.google.gson.annotations.SerializedName

data class Agent(
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("description")
    val description: Any,
    @SerializedName("generalLocationLat")
    val generalLocationLat: Any,
    @SerializedName("generalLocationLong")
    val generalLocationLong: Any,
    @SerializedName("generalLocationRadiusMeter")
    val generalLocationRadiusMeter: Any,
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("outlet")
    val outlet: Outlet,
    @SerializedName("outletId")
    val outletId: String,
    @SerializedName("updatedAt")
    val updatedAt: String,
    @SerializedName("userId")
    val userId: String
)
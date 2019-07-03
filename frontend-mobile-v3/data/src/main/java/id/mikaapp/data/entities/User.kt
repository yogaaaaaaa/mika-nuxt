package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("userData")
    var userData: UserData,
    @SerializedName("isError")
    var isError: Boolean,
    @SerializedName("message")
    var message: String,
    @SerializedName("status")
    var status: String
)
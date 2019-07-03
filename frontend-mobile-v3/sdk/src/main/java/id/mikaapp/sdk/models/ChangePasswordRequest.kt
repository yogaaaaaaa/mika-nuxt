package id.mikaapp.sdk.models

import com.google.gson.annotations.SerializedName

data class ChangePasswordRequest(
    @SerializedName("oldPassword")
    var oldPassword: String,
    @SerializedName("password")
    var password: String
)
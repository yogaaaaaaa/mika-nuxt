package id.mikaapp.data.entities

import com.google.gson.annotations.SerializedName

data class Properties(
    @SerializedName("flows")
    var flows: List<String>,
    @SerializedName("tokenTypes")
    var tokenTypes: List<String>,
    @SerializedName("userTokenTypes")
    var userTokenTypes: List<Any>
)
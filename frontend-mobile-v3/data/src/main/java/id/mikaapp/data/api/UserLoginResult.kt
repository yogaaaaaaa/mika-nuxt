package id.mikaapp.data.api

import com.google.gson.annotations.SerializedName
import id.mikaapp.data.entities.UserData

/**
 * Created by grahamdesmon on 08/04/19.
 */

class UserLoginResult {
    @SerializedName("data")
    lateinit var data: UserData
}
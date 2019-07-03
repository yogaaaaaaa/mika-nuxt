package id.mikaapp.data.api

import com.google.gson.annotations.SerializedName
import id.mikaapp.data.entities.PaymentProviderData

/**
 * Created by grahamdesmon on 08/04/19.
 */

class PaymentProviderResult {
    @SerializedName("userData")
    lateinit var `data`: List<PaymentProviderData>
    @SerializedName("isError")
    var isError: Boolean? = false
    @SerializedName("message")
    lateinit var message: String
    @SerializedName("status")
    lateinit var status: String
}
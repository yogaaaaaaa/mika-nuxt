package id.mikaapp.mika.datasource

import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import id.mikaapp.sdk.models.Acquirer

/**
 * Created by grahamdesmon on 06/04/19.
 */

class LocalPersistentDataSource(private val sharedPreferences: SharedPreferences) {

    private val arrayListAcquirerType = object : TypeToken<ArrayList<Acquirer>>() {}.type

    // Keys
    private val userTypeKey = "USER_TYPE"
    private val merchantNameKey = "MERCHANT_NAME"
    private val outletNameKey = "OUTLET_NAME"
    private val outletAddressKey = "OUTLET_ADDRESS"
    private val arrayListAcquirerJSONKey = "ARRAY_LIST_ACQUIRER_JSON"
    private val latitudeKey = "LATITUDE"
    private val longitudeKey = "LONGITUDE"

    // Saved Value
    val acquirers
        get(): ArrayList<Acquirer>? {
            sharedPreferences.getString(arrayListAcquirerJSONKey, null)?.let {
                return try {
                    Gson().fromJson<ArrayList<Acquirer>>(it, arrayListAcquirerType)
                } catch (t: Throwable) {
                    null
                }
            }
            return null
        }
    val userType get(): String? = sharedPreferences.getString(userTypeKey, null)
    val outletName get(): String? = sharedPreferences.getString(outletNameKey, null)
    val outletAddress get(): String? = sharedPreferences.getString(outletAddressKey, null)
    val merchantName get(): String? = sharedPreferences.getString(merchantNameKey, null)
    val latitude get(): String? = sharedPreferences.getString(latitudeKey, null)
    val longitude get(): String? = sharedPreferences.getString(longitudeKey, null)

    fun save(block: Saver.() -> Unit) {
        with(sharedPreferences.edit()) {
            block(Saver(this))
            apply()
        }
    }

    inner class Saver(private val editor: SharedPreferences.Editor) {
        fun userType(value: String?) {
            editor.putString(userTypeKey, value)
        }

        fun outletName(value: String?) {
            editor.putString(outletNameKey, value)
        }

        fun outletAddress(value: String?) {
            editor.putString(outletAddressKey, value)
        }

        fun merchantName(value: String?) {
            editor.putString(merchantNameKey, value)
        }

        fun acquirers(value: ArrayList<Acquirer>) {
            editor.putString(arrayListAcquirerJSONKey, Gson().toJson(value))
        }

        fun latitude(value: String?) {
            editor.putString(latitudeKey, value)
        }

        fun longitude(value: String?) {
            editor.putString(longitudeKey, value)
        }
    }
}
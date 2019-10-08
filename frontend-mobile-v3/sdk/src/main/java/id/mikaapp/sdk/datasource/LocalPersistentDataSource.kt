package id.mikaapp.sdk.datasource

import android.content.SharedPreferences
import com.google.gson.Gson
import id.mikaapp.sdk.models.BrokerDetail

class LocalPersistentDataSource(private val sharedPreferences: SharedPreferences) {

//    private val arrayListAcquirerType = object : TypeToken<ArrayList<Acquirer>>() {}.type

    // Keys
    private val thumbnailBaseURLKey = "THUMBNAIL_BASE_URL"
    private val sessionTokenKey = "SESSION_TOKEN"
    private val userTypeKey = "USER_TYPE"
    private val brokerDetailJSONKey = "BROKER_DETAIL_JSON"

    // Saved Value
    val thumbnailBaseURL get(): String? = sharedPreferences.getString(thumbnailBaseURLKey, null)
    val sessionToken get(): String? = sharedPreferences.getString(sessionTokenKey, null)
    val userType get(): String? = sharedPreferences.getString(userTypeKey, null)
    val brokerDetail
        get(): BrokerDetail? =
            sharedPreferences.getString(brokerDetailJSONKey, null)?.let {
                return try {
                    Gson().fromJson(it, BrokerDetail::class.java)
                } catch (t: Throwable) {
                    null
                }
            }

    fun save(block: Saver.() -> Unit) {
        with(sharedPreferences.edit()) {
            block(Saver(this))
            apply()
        }
    }

    inner class Saver(private val editor: SharedPreferences.Editor) {
        fun thumbnailBaseURL(value: String?) {
            editor.putString(thumbnailBaseURLKey, value)
        }

        fun sessionToken(value: String?) {
            editor.putString(sessionTokenKey, value)
        }

        fun userType(value: String?) {
            editor.putString(userTypeKey, value)
        }

        fun brokerDetail(value: BrokerDetail?) {
            editor.putString(brokerDetailJSONKey, if (value == null) null else Gson().toJson(value))
        }
    }
}
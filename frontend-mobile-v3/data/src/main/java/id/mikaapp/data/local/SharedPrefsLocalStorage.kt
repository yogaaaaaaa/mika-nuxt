package id.mikaapp.data.local

import android.content.SharedPreferences
import id.mikaapp.domain.LocalStorage

/**
 * Created by grahamdesmon on 06/04/19.
 */

class SharedPrefsLocalStorage(private val prefs: SharedPreferences) : LocalStorage {
    override fun save(key: String, value: Int) {
        with(prefs.edit()) {
            putInt(key, value)
            apply()
        }
    }

    override fun save(key: String, value: String) {
        with(prefs.edit()) {
            putString(key, value)
            apply()
        }
    }

    override fun save(key: String, value: Boolean) {
        with(prefs.edit()) {
            putBoolean(key, value)
            apply()
        }
    }

    override fun getIntPref(key: String): Int? = prefs.getInt(key, 0)

    override fun getStringPref(key: String): String? = prefs.getString(key, "")

    override fun getBooleanPref(key: String): Boolean? = prefs.getBoolean(key, false)
}
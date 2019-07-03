package id.mikaapp.domain

/**
 * Created by grahamdesmon on 06/04/19.
 */

interface LocalStorage {

    fun save(key: String, value: Int)
    fun save(key: String, value: String)
    fun save(key: String, value: Boolean)
    fun getIntPref(key: String): Int?
    fun getStringPref(key: String): String?
    fun getBooleanPref(key: String): Boolean?
}

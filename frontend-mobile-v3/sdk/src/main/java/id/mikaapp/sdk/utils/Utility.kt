package id.mikaapp.sdk.utils

import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Bitmap
import android.net.ConnectivityManager
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.journeyapps.barcodescanner.BarcodeEncoder
import com.securepreferences.SecurePreferences
import id.mikaapp.sdk.models.BrokerDetail
import id.mikaapp.sdk.mqtt.MikaMqttService
import java.util.*

const val UTC_TIMEZONE = "UTC"

internal interface IUtility {

    fun getCurrentTimeInUTC(): Date

    /**
     * Save an object to Secure Preferences
     */
    fun saveObjectsToSharedPref(keyName: String, data: String, sharedPreferences: SecurePreferences)

    /**
     * Retrieve an object from Secure Preferences
     */
    fun retrieveObjectFromSharedPref(keyName: String, sharedPreferences: SecurePreferences): String?

    /**
     * Delete an object from Secure Preferences
     */
    fun deleteObjectsFromSharedPref(keyName: String, sharedPreferences: SecurePreferences)

    /**
     * Check whether the internet connection is available
     */
    fun isNetworkAvailable(): Boolean

    /**
     * Generate a QR Code
     * @param token Transaction token
     */
    fun generateQrTransaction(token: String): Bitmap

    /**
     * Start MIKA SDK MQTT Service
     */
    fun startMqttService(
            useWebSocket: Boolean = true,
            keepAliveInterval: Int = 60,
            brokerDetail: BrokerDetail,
            serviceConnection: ServiceConnection
    )
}

internal class Utility(var context: Context) : IUtility {

    override fun getCurrentTimeInUTC(): Date {
        val utcTimeZone = TimeZone.getTimeZone(UTC_TIMEZONE)
        TimeZone.setDefault(utcTimeZone)
        val calendar = Calendar.getInstance(utcTimeZone)

        return calendar.time
    }

    /**
     * Save an object to Secure Preferences
     */
    override fun saveObjectsToSharedPref(keyName: String, data: String, sharedPreferences: SecurePreferences) {
        val sharedPreferenceEditor = sharedPreferences.edit()
        sharedPreferenceEditor.putString(keyName, data).apply()
        sharedPreferenceEditor.commit()
    }

    /**
     * Retrieve an object from Secure Preferences
     * @return String object saved in Secure Preferences (the default value is null)
     */
    override fun retrieveObjectFromSharedPref(keyName: String, sharedPreferences: SecurePreferences): String? {
        return sharedPreferences.getString(keyName, null)
    }

    /**
     * Delete an object from Secure Preferences
     */
    override fun deleteObjectsFromSharedPref(keyName: String, sharedPreferences: SecurePreferences) {
        val sharedPreferenceEditor = sharedPreferences.edit()
        sharedPreferenceEditor.remove(keyName)
        sharedPreferenceEditor.apply()
    }

    /**
     * Check whether the internet connection is available
     * @return Boolean (availability of network connection)
     */
    override fun isNetworkAvailable(): Boolean {
        try {
            val connManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            if (connManager.activeNetworkInfo != null && connManager.activeNetworkInfo
                            .isAvailable && connManager.activeNetworkInfo.isConnected
            ) {
                return true
            }
        } catch (ex: Exception) {
            return false
        }

        return false
    }

    /**
     * Generate a QR Code
     * @param token Transaction token
     * @return QR Coda Bitmap
     */
    override fun generateQrTransaction(token: String): Bitmap {
        val multiFormatWriter = MultiFormatWriter()
        val bitMatrix = multiFormatWriter.encode(token, BarcodeFormat.QR_CODE, 200, 200)
        val barcodeEncoder = BarcodeEncoder()

        return barcodeEncoder.createBitmap(bitMatrix)
    }

    /**
     * Start MIKA SDK MQTT Service
     */
    override fun startMqttService(
            useWebSocket: Boolean,
            keepAliveInterval: Int,
            brokerDetail: BrokerDetail,
            serviceConnection: ServiceConnection
    ) {

        val startServiceIntent = Intent(context, MikaMqttService::class.java)
        context.bindService(startServiceIntent, serviceConnection, 0)
        startServiceIntent.action = MikaMqttService.MQTT_CONNECT
        startServiceIntent.putExtra(MikaMqttService.MQTT_SERVER_URL, brokerDetail.brokerUrl)
        startServiceIntent.putExtra(MikaMqttService.MQTT_SERVER_ALT_URL, brokerDetail.brokerUrlAlt)
        startServiceIntent.putExtra(MikaMqttService.MQTT_CLIENT_ID, brokerDetail.clientId)
        startServiceIntent.putExtra(MikaMqttService.MQTT_CLIENT_USERNAME, brokerDetail.user)
        startServiceIntent.putExtra(MikaMqttService.MQTT_CLIENT_PASSWORD, brokerDetail.password)
        startServiceIntent.putExtra(MikaMqttService.MQTT_CLIENT_TOPIC, brokerDetail.clientTopic)
        startServiceIntent.putExtra(MikaMqttService.MQTT_CLEAN_SESSION, brokerDetail.cleanSession)
        startServiceIntent.putExtra(MikaMqttService.MQTT_KEEP_ALIVE_INTERVAL, keepAliveInterval)
        startServiceIntent.putExtra(MikaMqttService.MQTT_USE_WEB_SOCKET, useWebSocket)
        context.startService(startServiceIntent)
    }
}
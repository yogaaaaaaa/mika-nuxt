package id.mikaapp.sdk.mqtt

import android.util.Log
import id.mikaapp.sdk.utils.Constant.Companion.TAG_MQTT
import org.eclipse.paho.android.service.BuildConfig
import org.eclipse.paho.android.service.MqttTraceHandler

internal class CustomMqttLog : MqttTraceHandler {
    override fun traceDebug(tag: String?, message: String?) {
        if (BuildConfig.DEBUG) {
            Log.d(TAG_MQTT, "$tag - $message")
        }
    }

    override fun traceException(tag: String?, message: String?, e: Exception?) {
        if (BuildConfig.DEBUG) {
            Log.d(TAG_MQTT, "$tag - $message \n${e.toString()}")
        }
    }

    override fun traceError(tag: String?, message: String?) {
        if (BuildConfig.DEBUG) {
            Log.d(TAG_MQTT, "$tag - $message")
        }
    }

}
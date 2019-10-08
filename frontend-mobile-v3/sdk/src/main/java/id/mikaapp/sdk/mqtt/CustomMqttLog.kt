package id.mikaapp.sdk.mqtt

import id.mikaapp.sdk.ext.log
import org.eclipse.paho.android.service.MqttTraceHandler

internal class CustomMqttLog : MqttTraceHandler {
    override fun traceDebug(tag: String?, message: String?) {
        log("traceDebug: tag: $tag, message: $message")
    }

    override fun traceException(tag: String?, message: String?, e: Exception?) {
        log("traceException: tag: $tag, message: $message, exception: ${e.toString()}")
    }

    override fun traceError(tag: String?, message: String?) {
        log("traceError: tag: $tag, message: $message")
    }

}
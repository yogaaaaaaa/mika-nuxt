package id.mikaapp.sdk.mqtt

import id.mikaapp.sdk.models.Transaction
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken
import java.io.Serializable

interface MikaMqttCallback : Serializable {
    fun connectComplete(reconnect: Boolean, serverURI: String?)
    fun messageArrived(topic: String?, transaction: Transaction?)
    fun connectionLost(cause: Throwable?)
    fun deliveryComplete(token: IMqttDeliveryToken?)
}
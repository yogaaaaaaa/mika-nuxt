package id.mikaapp.mika

import android.util.Log
import id.mikaapp.mika.service.BroadcastService
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.MikaCallback
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.CheckResponse
import id.mikaapp.sdk.models.Transaction
import id.mikaapp.sdk.mqtt.MikaMqttCallback
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken

class MqttHandler(private val mikaSdk: MikaSdk, private val broadcastService: BroadcastService) :
    MikaMqttCallback {

    override fun connectComplete(reconnect: Boolean, serverURI: String?) {
        Log.d("TESTTESTTEST", "MQTT connectComplete reconnect: $reconnect")
    }

    override fun messageArrived(topic: String?, transaction: Transaction?) {
        Log.d("TESTTESTTEST", "MQTT message arrived: $topic, $transaction")
        transaction?.let {
            broadcastService.broadcastTransaction(it)
        }
    }

    override fun connectionLost(cause: Throwable?) {
        Log.d("TESTTESTTEST", "MQTT connection lost: $cause")
        checkAuthStatus()
    }

    override fun deliveryComplete(token: IMqttDeliveryToken?) {}

    private fun checkAuthStatus() {
        mikaSdk.checkLoginSession(object : MikaCallback<CheckResponse> {
            override fun onSuccess(response: CheckResponse) {}
            override fun onFailure(errorResponse: BasicResponse) {
                if (errorResponse.message == "Invalid session token") {
                    mikaSdk.clearSharedPreference()
                }
            }

            override fun onError(error: Throwable) {}
        })
    }
}
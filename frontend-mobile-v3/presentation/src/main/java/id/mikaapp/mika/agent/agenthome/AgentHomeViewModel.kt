package id.mikaapp.mika.agent.agenthome

import android.util.Log
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.MqttHandler
import id.mikaapp.sdk.MikaSdk

class AgentHomeViewModel(mikaSdk: MikaSdk, mqttHandler: MqttHandler) : ViewModel() {

    init {
        try {
            mikaSdk.startMikaMqttService(useWebSocket = true, callback = mqttHandler)
        } catch (e: Exception) {
            Log.d("TESTTESTTEST", "startMikaMqttService Error: ${e.localizedMessage}")
        }
    }
}
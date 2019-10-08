package id.mikaapp.sdk.mqtt

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.Build
import com.google.gson.Gson
import id.mikaapp.sdk.models.Transaction
import org.eclipse.paho.android.service.MqttAndroidClient
import org.eclipse.paho.client.mqttv3.*
import org.json.JSONObject

internal class MikaMqttService : Service(), BaseMqtt {

    private lateinit var serverUrl: String
    private var serverAltUrl: String? = null
    private lateinit var clientId: String
    private lateinit var user: String
    private lateinit var userPassword: String
    private lateinit var topic: String
    private var cleanSession: Boolean = false
    private var keepAliveInterval: Int = 60
    private var useWebSocket: Boolean = true
    lateinit var client: MqttAndroidClient
    private var mikaMqttCallback: MikaMqttCallback? = null

    companion object {
        const val MQTT_CONNECT = "mqtt_connect"
        const val MQTT_DISCONNECT = "mqtt_disconnect"
        const val MQTT_SERVER_URL = "server_url"
        const val MQTT_SERVER_ALT_URL = "server_alt_url"
        const val MQTT_CLIENT_ID = "client_id"
        const val MQTT_CLIENT_USERNAME = "client_username"
        const val MQTT_CLIENT_PASSWORD = "client_password"
        const val MQTT_CLIENT_TOPIC = "client_topic"
        const val MQTT_CLEAN_SESSION = "clean_session"
        const val MQTT_KEEP_ALIVE_INTERVAL = "keep_alive_interval"
        const val MQTT_USE_WEB_SOCKET = "use_web_socket"
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) {
            stopSelf()
            return START_NOT_STICKY
        }

        if (MQTT_CONNECT == intent.action!!) {
            serverUrl = intent.getStringExtra(MQTT_SERVER_URL)
            serverAltUrl = intent.getStringExtra(MQTT_SERVER_ALT_URL)
            clientId = intent.getStringExtra(MQTT_CLIENT_ID)
            user = intent.getStringExtra(MQTT_CLIENT_USERNAME)
            userPassword = intent.getStringExtra(MQTT_CLIENT_PASSWORD)
            topic = intent.getStringExtra(MQTT_CLIENT_TOPIC)
            cleanSession = intent.getBooleanExtra(MQTT_CLEAN_SESSION, false)
            keepAliveInterval = intent.getIntExtra(MQTT_KEEP_ALIVE_INTERVAL, 60)
            useWebSocket = intent.getBooleanExtra(MQTT_USE_WEB_SOCKET, true)
            connectToServer()
        } else if (MQTT_DISCONNECT == intent.action) {
            disconnectFromServer()
        }

        return super.onStartCommand(intent, flags, startId)
    }

    override fun setClientCallback(mqttCallback: MikaMqttCallback?) {
        mikaMqttCallback = mqttCallback
    }

    override fun connectToServer() {
        client = MqttAndroidClient(this, if (useWebSocket) serverUrl else serverAltUrl
                ?: serverUrl, clientId)

        // enable logs from library
        client.setTraceEnabled(true)
        client.setTraceCallback(CustomMqttLog())
        val options = MqttConnectOptions()
        options.apply {
            userName = user
            password = userPassword.toCharArray()
            isAutomaticReconnect = true
            isCleanSession = cleanSession
            keepAliveInterval = this@MikaMqttService.keepAliveInterval
        }
        client.connect(options, this, object : IMqttActionListener {
            override fun onSuccess(asyncActionToken: IMqttToken?) {
                val disconnectedBufferOptions = DisconnectedBufferOptions()
                disconnectedBufferOptions.isBufferEnabled = true
                disconnectedBufferOptions.bufferSize = 100
                disconnectedBufferOptions.isPersistBuffer = false
                disconnectedBufferOptions.isDeleteOldestMessages = false
                client.setBufferOpts(disconnectedBufferOptions)
                client.setCallback(object : MqttCallbackExtended {
                    override fun connectComplete(reconnect: Boolean, serverURI: String?) {
                        mikaMqttCallback?.connectComplete(reconnect, serverURI)
                    }

                    override fun messageArrived(topic: String?, message: MqttMessage?) {
                        message?.let {
                            val transactionJson = JSONObject(String(it.payload)).getJSONObject("data")
                            val transaction = Gson().fromJson(
                                    transactionJson.toString(),
                                    Transaction::class.java
                            )
                            mikaMqttCallback?.messageArrived(topic, transaction)
                        } ?: run {
                            mikaMqttCallback?.messageArrived(topic, null)
                        }
                    }

                    override fun connectionLost(cause: Throwable?) {
                        mikaMqttCallback?.connectionLost(cause)
                    }

                    override fun deliveryComplete(token: IMqttDeliveryToken?) {
                        mikaMqttCallback?.deliveryComplete(token)
                    }
                })
                subscribeToTopic(topic)
            }

            override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) {}
        })
    }

    override fun disconnectFromServer() {
        client.disconnect(this, object : IMqttActionListener {
            override fun onSuccess(asyncActionToken: IMqttToken?) {
                client.unregisterResources()
                client.close()
                stopSelf()
            }

            override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) {}

        })
    }

    override fun subscribeToTopic(topic: String) {
        client.subscribe(topic, 2, this, object : IMqttActionListener {
            override fun onSuccess(asyncActionToken: IMqttToken?) {}

            override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) {}

        })
    }

    override fun onDestroy() {
        super.onDestroy()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            stopForeground(true)
        }
    }

    override fun onBind(intent: Intent?) = mBinder

    private val mBinder = LocalBinder()

    inner class LocalBinder : Binder() {
        val service: MikaMqttService
            get() = this@MikaMqttService
    }
}
package id.mikaapp.sdk.mqtt

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.Build
import android.util.Log
import id.mikaapp.sdk.BuildConfig
import id.mikaapp.sdk.utils.Constant.Companion.TAG_MQTT
import org.eclipse.paho.android.service.MqttAndroidClient
import org.eclipse.paho.client.mqttv3.DisconnectedBufferOptions
import org.eclipse.paho.client.mqttv3.IMqttActionListener
import org.eclipse.paho.client.mqttv3.IMqttToken
import org.eclipse.paho.client.mqttv3.MqttConnectOptions

internal class MikaMqttService : Service(), BaseMqtt {

    private lateinit var serverUrl: String
    private lateinit var clientId: String
    private lateinit var user: String
    private lateinit var userPassword: String
    private lateinit var topic: String
    private val cleanSession = false
    lateinit var client: MqttAndroidClient

    companion object {
        const val MQTT_CONNECT = "mqtt_connect"
        const val MQTT_DISCONNECT = "mqtt_disconnect"
        const val MQTT_SERVER_URL = "server_url"
        const val MQTT_CLIENT_ID = "client_id"
        const val MQTT_CLIENT_USERNAME = "client_username"
        const val MQTT_CLIENT_PASSWORD = "client_password"
        const val MQTT_CLIENT_TOPIC = "client_topic"
        const val MQTT_CLEAN_SESSION = "clean_session"
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) {
            stopSelf()
            return START_NOT_STICKY
        }

        if (MQTT_CONNECT == intent.action!!) {
            serverUrl = intent.getStringExtra(MQTT_SERVER_URL)
            clientId = intent.getStringExtra(MQTT_CLIENT_ID)
            user = intent.getStringExtra(MQTT_CLIENT_USERNAME)
            userPassword = intent.getStringExtra(MQTT_CLIENT_PASSWORD)
            topic = intent.getStringExtra(MQTT_CLIENT_TOPIC)
            cleanSession

            connectToServer()
        } else if (MQTT_DISCONNECT == intent.action) {
            disconnectFromServer()
        }

        return super.onStartCommand(intent, flags, startId)
    }

    override fun setClientCallback(mqttCallback: MikaMqttCallback) {
        client.setCallback(mqttCallback)
        if (BuildConfig.DEBUG) {
            Log.d(TAG_MQTT, "setClientCallback")
        }
    }

    override fun connectToServer() {
        client = MqttAndroidClient(this, serverUrl, clientId)

        // enable logs from library
        client.setTraceEnabled(true)
        client.setTraceCallback(CustomMqttLog())

        val options = MqttConnectOptions()
        options.apply {
            userName = user
            password = userPassword.toCharArray()
            isAutomaticReconnect = true
            isCleanSession = cleanSession
        }

        client.connect(options, this, object : IMqttActionListener {
            override fun onSuccess(asyncActionToken: IMqttToken?) {
                if (BuildConfig.DEBUG) {
                    Log.d(TAG_MQTT, "Connection success")
                }
                val disconnectedBufferOptions = DisconnectedBufferOptions()
                disconnectedBufferOptions.isBufferEnabled = true
                disconnectedBufferOptions.bufferSize = 100
                disconnectedBufferOptions.isPersistBuffer = false
                disconnectedBufferOptions.isDeleteOldestMessages = false
                client.setBufferOpts(disconnectedBufferOptions)

                subscribeToTopic(topic)
            }

            override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) {
                if (BuildConfig.DEBUG) {
                    Log.e(
                        TAG_MQTT,
                        "Connection failed, message: ${exception?.message}, cause: ${exception?.cause?.message}"
                    )
                }
            }
        })
    }

    override fun disconnectFromServer() {
        client.disconnect(this, object : IMqttActionListener {
            override fun onSuccess(asyncActionToken: IMqttToken?) {
                if (BuildConfig.DEBUG) {
                    Log.d(TAG_MQTT, "Disconnect success")
                }
                client.unregisterResources()
                client.close()
                stopSelf()
            }

            override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) {
                if (BuildConfig.DEBUG) {
                    Log.d(TAG_MQTT, "Disconnect failed")
                }
            }

        })
    }

    override fun subscribeToTopic(topic: String) {
        client.subscribe(topic, 1, this, object : IMqttActionListener {
            override fun onSuccess(asyncActionToken: IMqttToken?) {
                if (BuildConfig.DEBUG) {
                    Log.d(TAG_MQTT, "{$topic} subscribed")
                }
            }
            override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) {
                if (BuildConfig.DEBUG) {
                    Log.d(TAG_MQTT, "Subscribe to {$topic} failed")
                }
            }

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
package id.mikaapp.mika.agent.home

import android.content.Intent
import android.os.Build
import android.os.Bundle
import com.google.android.material.bottomnavigation.BottomNavigationView
import androidx.appcompat.app.AppCompatActivity
import android.util.Log
import android.view.MenuItem
import com.google.gson.Gson
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.charge.ChargeFragment
import id.mikaapp.mika.agent.profile.ProfileFragment
import id.mikaapp.mika.agent.transaction.TransactionFragment
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.utils.NotificationHelper
import id.mikaapp.mika.utils.PrinterUtil
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.CheckLoginSessionCallback
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.CheckResponse
import id.mikaapp.sdk.models.Transaction
import id.mikaapp.sdk.mqtt.MikaMqttCallback
import kotlinx.android.synthetic.main.activity_home_agent.*
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken
import org.eclipse.paho.client.mqttv3.MqttMessage
import org.json.JSONObject
import org.koin.android.ext.android.inject

class HomeActivity : AppCompatActivity(), BottomNavigationView.OnNavigationItemSelectedListener {

    val mikaSdk: MikaSdk by inject()
    val notificationHelper: NotificationHelper by inject()
    private lateinit var navigationBar: BottomNavigationView
    private lateinit var deviceModel: String

    companion object {
        const val TRANSACTION_MQTT_ACTION = "transaction_complete"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_agent)

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.container, ChargeFragment(), "charge")
                .commitNow()
        }

        navigationBar = bottomNavigationView
        navigationBar.setOnNavigationItemSelectedListener(this)

        initPrinter()
        deviceModel = Build.MODEL

        mikaSdk.startMikaMqttService(mqttCallback)
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        if (item.itemId == navigationBar.selectedItemId) {
            return false
        }

        when (item.itemId) {

            R.id.navigation_charge -> {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.container, ChargeFragment(), "charge")
                    .commitNow()
            }

            R.id.navigation_profile -> {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.container, ProfileFragment(), "profile")
                    .commitNow()
            }

            R.id.navigation_transaction -> {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.container, TransactionFragment(), "transaction")
                    .commitNow()
            }
        }

        return true
    }

    private fun initPrinter() {
        val printerUtil = PrinterUtil.getInstance(this)
        printerUtil.connectBluetooth()
        printerUtil.initializeDevice()
    }

    private val mqttCallback = object : MikaMqttCallback {

        override fun connectComplete(reconnect: Boolean, serverURI: String?) {
            if (BuildConfig.DEBUG) {
                when (reconnect) {
                    true -> Log.d("MQTT", "reconnect $serverURI")
                    false -> Log.d("MQTT", "connect $serverURI")
                }

            }
        }

        override fun messageArrived(topic: String?, message: MqttMessage?) {
            if (BuildConfig.DEBUG)
                Log.d("MQTT messageArrived", String(message!!.payload))

            message?.let {
                val message = Gson().fromJson<Any>(
                    String(it.payload),
                    Transaction::class.java
                )
                val msg = JSONObject(String(it.payload))
                val dataObj = msg.getJSONObject("data")
                val acquirerObj = dataObj.getJSONObject("acquirer")
                val acquirerTypeObj = acquirerObj.getJSONObject("acquirerType")
                val status = dataObj.getString("status")
                val id = dataObj.getString("id")
                val idAlias = dataObj.getString("idAlias")
                val thumbnail = acquirerTypeObj.getString("thumbnail")
                val thumbnailGray = acquirerTypeObj.getString("thumbnailGray")
                notificationHelper.setTransactionNotification(status, id, idAlias, thumbnail, thumbnailGray)

            }
        }

        override fun connectionLost(cause: Throwable?) {
            if (BuildConfig.DEBUG) {
                Log.d("MQTT", "connectionLost ${cause?.message.toString()}")
            }
            checkAuthStatus()
        }

        override fun deliveryComplete(token: IMqttDeliveryToken?) {

        }

    }

    private fun checkAuthStatus() {
        mikaSdk.checkLoginSession(object : CheckLoginSessionCallback {
            override fun onSuccess(response: CheckResponse) {

            }

            override fun onFailure(errorResponse: BasicResponse) {
                if (errorResponse.message == "Invalid session token") {
                    mikaSdk.clearSharedPreference()
                    val homeIntent = Intent(applicationContext, LoginActivity::class.java)
                    homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(homeIntent)
                    finish()
                }
            }

            override fun onError(error: Throwable) {

            }

        })
    }
}
package id.mikaapp.mika.main

import android.Manifest.permission.ACCESS_FINE_LOCATION
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.work.*
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenthome.AgentHomeActivity
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.service.PrinterService
import id.mikaapp.mika.worker.LocationWorker
import id.mikaapp.sdk.MikaSdk
import org.koin.android.ext.android.inject
import java.util.concurrent.TimeUnit
import kotlin.reflect.KClass


class MainActivity : AppCompatActivity() {

    val mikaSdk: MikaSdk by inject()
    private val printerService: PrinterService by inject()
    private val localPersistentDataSource: LocalPersistentDataSource by inject()
    private val requestLocationCode = 99
    private val tag = "MainActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        printerService.startService()
        requestLocation()
    }

    private fun requestLocation() {
        Log.d(tag, "requestLocation")
        if (isLocationGranted()) {
            Log.d(tag, "permission granted")
            onLocationPermissionGranted()
        } else {
            Log.d(tag, "permission not granted")
            ActivityCompat.requestPermissions(this, arrayOf(ACCESS_FINE_LOCATION), requestLocationCode)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        Log.d(tag, "onRequestPermissionResult: $permissions")
        when (requestCode) {
            requestLocationCode -> {
                // If request is cancelled, the result arrays are empty.
                if (grantResults.isNotEmpty() && isLocationGranted()) {
                    Log.d(tag, "permission granted")
                    onLocationPermissionGranted()
                } else {
                    Log.d(tag, "permission denied")
                    onLocationPermissionNotGranted()
                }
            }
        }
    }

    private fun isLocationGranted() =
        ContextCompat.checkSelfPermission(this, ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED

    private fun onLocationPermissionGranted() {
        startLocationWorker()
        mikaSdk.checkLoginSession(BaseMikaCallback(
            success = {
                when (it.data.userType) {
                    "agent" -> {
                        mikaSdk.getAcquirers(BaseMikaCallback(
                            success = { acquirers -> localPersistentDataSource.save { acquirers(acquirers) } },
                            complete = { navigate(AgentHomeActivity::class) }
                        ))
                    }
                    "merchantStaff" -> navigate(LoginActivity::class)
                }
            },
            failure = { navigate(LoginActivity::class) },
            error = { navigate(LoginActivity::class) }
        ))
    }

    private fun onLocationPermissionNotGranted() = finish()

    private fun startLocationWorker() {
        val cons = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val locWorker = PeriodicWorkRequestBuilder<LocationWorker>(1, TimeUnit.HOURS)
            .setConstraints(cons)
            .build()
        WorkManager.getInstance(applicationContext)
            .enqueueUniquePeriodicWork(tag, ExistingPeriodicWorkPolicy.REPLACE, locWorker)
    }

    private fun <T> navigate(to: KClass<T>) where T : Any {
        val intent = Intent(this, to.java)
        startActivity(intent)
        finish()
    }
}

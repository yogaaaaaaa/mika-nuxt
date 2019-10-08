package id.mikaapp.mika.worker

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import android.preference.PreferenceManager
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.work.Worker
import androidx.work.WorkerParameters
import id.mikaapp.mika.datasource.LocalPersistentDataSource

class LocationWorker(private val appContext: Context, workerParams : WorkerParameters) : Worker(appContext, workerParams) {
    override fun doWork(): Result {
        Log.d("WORKER", "STARTED")
        if (ContextCompat.checkSelfPermission(
                appContext,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            Log.d("WORKER", "PERMISSION GRANTED")
            val locationManager = appContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val locationListener = object : LocationListener {
                override fun onLocationChanged(loc: Location?) {
                    Log.d("Location", "onLocationChanged: $loc")
                    loc?.let { location ->
                        LocalPersistentDataSource(
                            PreferenceManager.getDefaultSharedPreferences(
                                appContext
                            )
                        ).also {
                            Log.d("WORKER", "lat:${location.latitude},long:${location.longitude}")
                            it.save {
                                latitude(location.latitude.toString())
                                longitude(location.longitude.toString())
                            }
                        }
                    }
                }

                override fun onStatusChanged(p0: String?, p1: Int, p2: Bundle?) {
                    Log.d("WORKER", "onStatusChanged: $p0, $p1, $p2")
                }

                override fun onProviderEnabled(p0: String?) {
                    Log.d("WORKER", "onProviderEnabled: $p0")
                }

                override fun onProviderDisabled(p0: String?) {
                    Log.d("WORKER", "onProviderDisabled: $p0")
                }
            }
            if (locationManager.allProviders.contains(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestSingleUpdate(LocationManager.NETWORK_PROVIDER, locationListener, Looper.getMainLooper())
            }

            if (locationManager.allProviders.contains(LocationManager.GPS_PROVIDER)) {
                locationManager.requestSingleUpdate(LocationManager.GPS_PROVIDER, locationListener, Looper.getMainLooper())
            }
        } else {
            Log.d("WORKER", "PERMISSION NOT GRANTED")
        }
        return Result.success()
    }

}
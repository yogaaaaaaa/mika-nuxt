package id.mikaapp.mika.agent.charge


import android.app.Dialog
import androidx.lifecycle.Observer
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import com.google.android.material.snackbar.Snackbar
import androidx.fragment.app.Fragment
import androidx.appcompat.app.AlertDialog
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.location.*
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.acquirer.AcquirerFragment
import id.mikaapp.mika.agent.cardpayment.CardPaymentActivity
import id.mikaapp.mika.agent.qrpayment.QrPaymentActivity
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.utils.CustomDialog
import id.mikaapp.mika.utils.NumberUtil
import id.mikaapp.mika.utils.PermissionHelper
import id.mikaapp.sdk.models.Acquirer
import kotlinx.android.synthetic.main.fragment_charge.*
import org.javia.arity.Symbols
import org.javia.arity.SyntaxException
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel
import java.io.ByteArrayOutputStream

/**
 * A simple [Fragment] subclass.
 *
 */
class ChargeFragment : Fragment(), View.OnClickListener, AcquirerFragment.OnAcquirerSelected {

    val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    val viewModel: ChargeViewModel by viewModel()
    private lateinit var btn0: Button
    private lateinit var btn1: Button
    private lateinit var btn2: Button
    private lateinit var btn3: Button
    private lateinit var btn4: Button
    private lateinit var btn5: Button
    private lateinit var btn6: Button
    private lateinit var btn7: Button
    private lateinit var btn8: Button
    private lateinit var btn9: Button
    private lateinit var btnDiv: Button
    private lateinit var btnMul: Button
    private lateinit var btnSub: Button
    private lateinit var btnAdd: Button
    private lateinit var btnPercent: Button
    private lateinit var btnPay: Button
    private lateinit var btnDel: Button
    private lateinit var textEquation: TextView
    private lateinit var textInput: TextView
    private lateinit var dialog: Dialog
    private lateinit var mSymbols: Symbols
    private lateinit var acquirerName: String
    private lateinit var acquirerFragment: AcquirerFragment
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationListener: LocationListener
    private var total: Long = 0
    private var knownLocation: Location? = null
    private var latitude: String? = ""
    private var longitude: String? = ""
    private lateinit var locationManager: LocationManager
    private lateinit var locationCallback: LocationCallback
    private val locationRequest = LocationRequest().apply {
        interval = 10000
        fastestInterval = 5000
        priority = LocationRequest.PRIORITY_HIGH_ACCURACY
    }
    private val TAG = this@ChargeFragment.javaClass.simpleName
    private val UPDATE_COUNT = 5
    private val LATITUDE_KEY = "last_latitude"
    private val LONGITUDE_KEY = "last_longitude"

    companion object {
        private const val PERMISSION_LOCATION = 1
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                if (throwable.message == getString(R.string.error_not_authenticated)) {
                    val homeIntent = Intent(activity, LoginActivity::class.java)
                    homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(homeIntent)
                    activity!!.finish()
                }
                if (throwable.message != "Entity Not found")
                    Toast.makeText(activity, throwable.message, Toast.LENGTH_LONG).show()
            }
        })

        checkLocation()

        if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context!!) == 0) {
            setupLocationPlayService()
        } else {
            setupLocationManager()
        }

        retrieveLatLang()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_charge, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        btn0 = btn_0
        btn1 = btn_1
        btn2 = btn_2
        btn3 = btn_3
        btn4 = btn_4
        btn5 = btn_5
        btn6 = btn_6
        btn7 = btn_7
        btn8 = btn_8
        btn9 = btn_9
        btnAdd = btn_addition
        btnSub = btn_subtraction
        btnMul = btn_multiplication
        btnDiv = btn_division
        btnPercent = btn_percent
        btnPay = btn_pay
        btnDel = btn_delete
        textEquation = text_equation
        textInput = text_input
        btn0.setOnClickListener(this)
        btn1.setOnClickListener(this)
        btn2.setOnClickListener(this)
        btn3.setOnClickListener(this)
        btn4.setOnClickListener(this)
        btn5.setOnClickListener(this)
        btn6.setOnClickListener(this)
        btn7.setOnClickListener(this)
        btn8.setOnClickListener(this)
        btn9.setOnClickListener(this)
        btnAdd.setOnClickListener(this)
        btnSub.setOnClickListener(this)
        btnMul.setOnClickListener(this)
        btnDiv.setOnClickListener(this)
        btnPay.setOnClickListener(this)
        btnDel.setOnClickListener(this)
        btnPercent.setOnClickListener(this)
        mSymbols = Symbols()
        dialog = CustomDialog.progressDialog(context!!, getString(R.string.loading))
        refreshInput()
    }

    override fun onSelected(acquirer: Acquirer) {
        if (total.toInt() < acquirer.minimumAmount) {
            val message =
                "Minimum Pembayaran " + acquirer.acquirerType.name + " " + NumberUtil.formatCurrency(
                    acquirer.minimumAmount.toDouble()
                )
            Toast.makeText(context!!, message, Toast.LENGTH_SHORT).show()
        } else {
            acquirerName = acquirer.acquirerType.name
            if (PermissionHelper.checkLocationPermission(context!!)) {
                if (latitude!!.isNotEmpty() && longitude!!.isNotEmpty()) {
                    when (acquirer.acquirerType.classX) {
                        "emvDebit" -> {
                            val intent = CardPaymentActivity.newIntent(
                                context!!, total, acquirerName, true, acquirer.id
                            )
                            acquirerFragment.dismiss()
                            startActivity(intent)
                        }
                        "emvCredit" -> {
                            val intent = CardPaymentActivity.newIntent(
                                context!!, total, acquirerName, false, acquirer.id
                            )
                            acquirerFragment.dismiss()
                            startActivity(intent)
                        }
                        else -> viewModel.createTransaction(acquirer.id, total.toInt(), latitude!!, longitude!!)
                    }
                } else {
                    checkLocation()
                    retrieveLastLocation()
                    retrieveLatLang()
                    Toast.makeText(context, getString(R.string.error_message_location), Toast.LENGTH_SHORT).show()
                }
            } else {
                PermissionHelper.requestLocationPermission(
                    activity!!,
                    this,
                    PERMISSION_LOCATION,
                    getString(R.string.message_activate_location)
                )
            }
        }
    }

    override fun onClick(v: View?) {
        when (v) {
            btnDel -> processButtonClicked(btnDel.text.toString())
            btnAdd -> processButtonClicked(btnAdd.text.toString())
            btnSub -> processButtonClicked(btnSub.text.toString())
            btnMul -> processButtonClicked(btnMul.text.toString())
            btnDiv -> processButtonClicked(btnDiv.text.toString())
            btnPercent -> processButtonClicked(btnPercent.text.toString())
            btn1 -> processButtonClicked(btn1.text.toString())
            btn2 -> processButtonClicked(btn2.text.toString())
            btn3 -> processButtonClicked(btn3.text.toString())
            btn4 -> processButtonClicked(btn4.text.toString())
            btn5 -> processButtonClicked(btn5.text.toString())
            btn6 -> processButtonClicked(btn6.text.toString())
            btn7 -> processButtonClicked(btn7.text.toString())
            btn8 -> processButtonClicked(btn8.text.toString())
            btn9 -> processButtonClicked(btn9.text.toString())
            btn0 -> processButtonClicked(btn0.text.toString())
            btnPay -> {
                acquirerFragment = AcquirerFragment()
                acquirerFragment.setOnAcquirerSelected(this)
                acquirerFragment.show(childFragmentManager, "dialog")
            }
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == PERMISSION_LOCATION) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startLocationUpdates()
            } else {
                // fragmentContainer
                val snackbar = Snackbar.make(container, getString(R.string.message_permission_location), Snackbar.LENGTH_INDEFINITE)
                snackbar.setAction("Settings") {
                    val intent = Intent()
                    intent.action = Settings.ACTION_APPLICATION_DETAILS_SETTINGS
                    val uri = Uri.fromParts("package", activity!!.packageName, null)
                    intent.data = uri
                    startActivity(intent)
                }
                snackbar.show()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopLocationUpdates()
    }

    private fun setupLocationPlayService() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(activity!!)
        if (PermissionHelper.checkLocationPermission(context!!)) {
            fusedLocationClient.lastLocation
                .addOnSuccessListener { location: Location? ->
                    location?.let {
                        knownLocation = it
                        saveLatLang(it)
                    }
                }
        }

        val builder = LocationSettingsRequest.Builder()
            .addLocationRequest(locationRequest)

        val client = LocationServices.getSettingsClient(activity!!)
        val task = client.checkLocationSettings(builder.build())

        var updateCount = 0

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult?) {
                updateCount++
                locationResult ?: return

                for (location in locationResult.locations) {

                    if (location != null) {
                        knownLocation = location
                        saveLatLang(location)
                    }
                }

                if (updateCount > this@ChargeFragment.UPDATE_COUNT) {
                    stopLocationUpdates()
                }
            }
        }
        task.addOnSuccessListener {
            locationCallback
        }

        if (PermissionHelper.requestLocationPermission(
                activity!!,
                this,
                PERMISSION_LOCATION,
                getString(R.string.message_permission_access_location)
            )
        ) {
            startLocationUpdates()
        }
    }

    private fun setupLocationManager() {
        locationManager = activity?.getSystemService(Context.LOCATION_SERVICE) as LocationManager

        var updateCount = 0

        locationListener = object : LocationListener {
            override fun onLocationChanged(p0: Location?) {
                if (p0 != null) {
                    updateCount++
                    knownLocation = p0
                    saveLatLang(p0)

                    if (updateCount > this@ChargeFragment.UPDATE_COUNT) {
                        stopLocationUpdates()
                    }
                }
            }

            override fun onStatusChanged(p0: String?, p1: Int, p2: Bundle?) {

            }

            override fun onProviderEnabled(p0: String?) {

            }

            override fun onProviderDisabled(p0: String?) {

            }

        }

        if (PermissionHelper.requestLocationPermission(activity!!, this, PERMISSION_LOCATION, getString(R.string.activate_location))) {
            startLocationUpdates()
        }
    }

    private fun retrieveLastLocation() {
        if (PermissionHelper.checkLocationPermission(context!!)) {
            if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context!!) == 0) {
                fusedLocationClient.lastLocation
                    .addOnSuccessListener { location: Location? ->
                        location?.let {
                            knownLocation = it
                            saveLatLang(it)
                        }
                    }
            } else {
                if (locationManager.allProviders.contains(LocationManager.NETWORK_PROVIDER)) {
                    val loc = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                    knownLocation = loc
                    loc?.let { saveLatLang(loc) }
                }
                if (locationManager.allProviders.contains(LocationManager.GPS_PROVIDER)) {
                    val loc = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                    knownLocation = loc
                    loc?.let { saveLatLang(loc) }
                }
            }
        }
    }

    private fun checkLocation(): Boolean {
        if (!isLocationEnabled())
            showAlert()
        return isLocationEnabled()
    }

    private fun isLocationEnabled(): Boolean {
        locationManager = activity!!.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) || locationManager.isProviderEnabled(
            LocationManager.NETWORK_PROVIDER
        )
    }

    private fun showAlert() {
        val dialog = AlertDialog.Builder(context!!)
        dialog.setTitle("Enable Location")
            .setMessage("Your Locations Settings is set to 'Off'.\nPlease Enable Location to " + "use this app")
            .setPositiveButton("Location Settings") { paramDialogInterface, paramInt ->
                val myIntent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
                startActivity(myIntent)
            }
            .setNegativeButton("Cancel") { paramDialogInterface, paramInt -> }
        dialog.show()
    }

    private fun startLocationUpdates() {
        if (PermissionHelper.checkLocationPermission(context!!)) {
            if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context!!) == 0) {
                fusedLocationClient.requestLocationUpdates(
                    locationRequest,
                    locationCallback,
                    null
                )
            } else {
                if (locationManager.allProviders.contains(LocationManager.NETWORK_PROVIDER)) {
                    locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0f, locationListener)
                }

                if (locationManager.allProviders.contains(LocationManager.GPS_PROVIDER)) {
                    locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0f, locationListener)
                }
            }
        }
    }

    private fun stopLocationUpdates() {
        if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context!!) == 0) {
            if (locationCallback != null) {
                fusedLocationClient.removeLocationUpdates(locationCallback)
            }
        } else {
            if (locationListener != null) {
                locationManager.removeUpdates(locationListener)
            }
        }
    }

    private fun handleViewState(state: ChargeViewState) {
        if (state.showLoading) {
            showDialog(dialog)
        } else {
            hideDialog(dialog)
        }
        state.tokenTransaction?.let { data ->
            val stream = ByteArrayOutputStream()
            if (!data.isUrl) {
                data.qrImage.compress(Bitmap.CompressFormat.PNG, 100, stream)
                val byteArray = stream.toByteArray()

                val intent = QrPaymentActivity.newIntent(
                    context!!, total.toString(), acquirerName, byteArray, data.transactionId, data.expirySecond
                )
                acquirerFragment.dismiss()
                startActivity(intent)
                state.tokenTransaction = null
            } else {
                Glide.with(this)
                    .asBitmap()
                    .load(data.token)
                    .into(object : CustomTarget<Bitmap>() {
                        override fun onLoadCleared(placeholder: Drawable?) {

                        }

                        override fun onResourceReady(
                            resource: Bitmap,
                            transition: com.bumptech.glide.request.transition.Transition<in Bitmap>?
                        ) {
                            resource.compress(Bitmap.CompressFormat.PNG, 100, stream)
                            val byteArray = stream.toByteArray()

                            val intent = QrPaymentActivity.newIntent(
                                context!!,
                                total.toString(),
                                acquirerName,
                                byteArray,
                                data.transactionId,
                                data.expirySecond
                            )
                            acquirerFragment.dismiss()
                            startActivity(intent)
                            state.tokenTransaction = null
                        }

                    })
            }
        }
    }

    private fun processButtonClicked(s: String) {
        if (resources.getString(R.string.button_backspace) == s) {
            var eq = textEquation.text.toString()
            if (eq.isNotEmpty()) {
                eq = eq.substring(0, eq.length - 1)
                textEquation.text = eq
            }
        } else if (resources.getString(R.string.calc_sign).contains(s)) {
            val num = s[0]
            if (num.toInt() < 48 || num.toInt() > 57) {
                var eq = textEquation.text.toString()
                if (eq.isNotEmpty()) {
                    if (resources.getString(R.string.calc_sign).contains(eq[eq.length - 1] + "")) {
                        eq = eq.substring(0, eq.length - 1)
                        textEquation.text = eq
                    }
                    textEquation.append(s)
                }
            }
        } else {
            textEquation.append(s)
        }
        refreshInput()
    }

    private fun refreshInput() {
        var eq = textEquation.text.toString()
        if (eq.isNotEmpty()) {
            if (resources.getString(R.string.calc_sign).contains(eq[eq.length - 1] + "")) {
                eq = eq.substring(0, eq.length - 1)
            }

            try {
                total = mSymbols.eval(eq).toLong()
                if (total > 0) {
                    btnPay.isEnabled = true
                    btnPay.alpha = 1f
                } else {
                    btnPay.isEnabled = false
                    btnPay.alpha = 0.3f
                }
                textInput.text = NumberUtil.formatCurrency(total.toDouble())

            } catch (e: SyntaxException) {
                e.printStackTrace()
            }

        } else {
            textInput.text = NumberUtil.formatCurrency(0.0)
            btnPay.isEnabled = false
            btnPay.alpha = 0.3f
        }
    }

    private fun showDialog(dialog: Dialog) {
        if (!dialog.isShowing) {
            dialog.show()
        }
    }

    private fun hideDialog(dialog: Dialog) {
        if (dialog.isShowing) {
            dialog.dismiss()
        }
    }

    private fun saveLatLang(location: Location) {
        Log.d(TAG, "lat:${location.latitude},long:${location.longitude}")
        sharedPrefsLocalStorage.save(LATITUDE_KEY, location.latitude.toString())
        sharedPrefsLocalStorage.save(LONGITUDE_KEY, location.longitude.toString())
    }

    private fun retrieveLatLang() {
        latitude = sharedPrefsLocalStorage.getStringPref(LATITUDE_KEY)
        longitude = sharedPrefsLocalStorage.getStringPref(LONGITUDE_KEY)
        Log.d(TAG, "lat:$latitude,long:$longitude")
    }
}

package id.mikaapp.sdk

import android.content.ComponentName
import android.content.Context
import android.content.ServiceConnection
import android.os.Build
import android.os.IBinder
import com.google.gson.Gson
import com.securepreferences.SecurePreferences
import com.sunmi.pay.hardware.aidlv2.emv.EMVOptV2
import com.sunmi.pay.hardware.aidlv2.pinpad.PinPadOptV2
import com.sunmi.pay.hardware.aidlv2.readcard.ReadCardOptV2
import com.sunmi.pay.hardware.aidlv2.security.SecurityOptV2
import com.sunmi.pay.hardware.aidlv2.system.BasicOptV2
import id.mikaapp.sdk.api.MikaApiService
import id.mikaapp.sdk.api.MikaRestAdapter
import id.mikaapp.sdk.callbacks.*
import id.mikaapp.sdk.models.*
import id.mikaapp.sdk.mqtt.BaseMqtt
import id.mikaapp.sdk.mqtt.MikaMqttCallback
import id.mikaapp.sdk.mqtt.MikaMqttService
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_DEVICE_NOT_SUPPORTED
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_FAILED_TO_CONNECT
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_NOT_IN_SANDBOX_MODE
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_SDK
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_UNAUTHENTICATED
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_USER_PASSWORD_EMPTY
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_MQTT_FAIL
import id.mikaapp.sdk.utils.Constant.Companion.MQTT_BROKER_PREF
import id.mikaapp.sdk.utils.Constant.Companion.SESSION_TOKEN_PREF
import id.mikaapp.sdk.utils.Constant.Companion.USER_TYPE_PREF
import id.mikaapp.sdk.utils.IUtility
import id.mikaapp.sdk.utils.PaymentCardUtil
import id.mikaapp.sdk.utils.Utility
import io.sentry.Sentry
import io.sentry.android.AndroidSentryClientFactory
import org.eclipse.paho.client.mqttv3.MqttException
import sunmi.paylib.SunmiPayKernel
import java.io.IOException
import java.lang.NullPointerException

class MikaSdk {
    private lateinit var apiService: MikaApiService
    private lateinit var mSMPayKernel: SunmiPayKernel
    private lateinit var mqttCallback: MikaMqttCallback
    private lateinit var mEMVOptV2: EMVOptV2
    private lateinit var paymentCardUtil: PaymentCardUtil
    internal var isSandbox = false

    private object Holder {
        val INSTANCE = MikaSdk()

    }

    companion object {
        val instance: MikaSdk by lazy { Holder.INSTANCE }
        internal const val TAG = "MikaSDK"
        internal var isSdkInitialized: Boolean = false
        internal var isConnectPaymentSdk: Boolean = false
        internal var isMqttConnected: Boolean = false
        internal lateinit var appContext: Context
        internal lateinit var utility: IUtility
        internal lateinit var sharedPreferences: SecurePreferences
        internal lateinit var mBasicOptV2: BasicOptV2
        internal lateinit var mReadCardOptV2: ReadCardOptV2
        internal lateinit var mPinPadOptV2: PinPadOptV2
        internal lateinit var mSecurityOptV2: SecurityOptV2
        internal lateinit var mEMVOptV2: EMVOptV2
        internal lateinit var mqttService: BaseMqtt
        internal lateinit var serviceConnection: ServiceConnection
        internal var isEmvInitialized: Boolean = false
    }

    /**
     * Initialize Mika SDK
     * @param context The application context.
     */
    fun initialize(context: Context, isSandbox: Boolean = false) {
        if (isSdkInitialized) {
            return
        }

        //Global context of current app
        this.isSandbox = isSandbox
        appContext = context
        sharedPreferences = SecurePreferences(context)
        utility = Utility(context)
        apiService = MikaApiService(MikaRestAdapter().newMikaApiService())
        mSMPayKernel = SunmiPayKernel.getInstance()

        // Initialize Sentry
        val sentryDsn = if (isSandbox) BuildConfig.SENTRY_SANDBOX_DSN else BuildConfig.SENTRY_PRODUCTION_DSN
        Sentry.init(sentryDsn, AndroidSentryClientFactory(context))

        //create service connection for MQTT
        serviceConnection = object : ServiceConnection {
            override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
                mqttService = (service as MikaMqttService.LocalBinder).service
                mqttService.setClientCallback(mqttCallback)
                isMqttConnected = true
            }

            override fun onServiceDisconnected(name: ComponentName?) {
                isMqttConnected = false
            }
        }
        isSdkInitialized = true
    }

    /**
     * Login to set credential for accessing MIKA API
     * @param username
     * @param password
     * @param callback LoginCallback
     */
    fun login(username: String, password: String, callback: LoginCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // validate whether the username or password is empty
        if (username.isEmpty() || password.isEmpty()) {
            callback.onError(Throwable(MESSAGE_ERROR_USER_PASSWORD_EMPTY))
        } else {
            //validate internet connection
            if (utility.isNetworkAvailable()) {
                val loginRequest = LoginRequest(username, password)
                apiService.login(loginRequest, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        }
    }

    /**
     * Set callback for Mika MQTT
     * @param mqttCallback MikaMqttCallback
     */
    @Throws(NullPointerException::class, IOException::class)
    fun setMikaTransactionMqttCallback(mqttCallback: MikaMqttCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            throw NullPointerException(MESSAGE_ERROR_SDK)
        }

        if (isMqttConnected) {
            mqttService.setClientCallback(mqttCallback)
        } else {
            throw IOException(MESSAGE_MQTT_FAIL)
        }
    }

    /**
     * Validate whether the login session is still valid
     * @param callback CheckLoginSessionCallback
     */
    fun checkLoginSession(callback: CheckLoginSessionCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                val request = CheckRequest(it)
                apiService.checkLoginSession(request, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Clear the user login session and delete all the entries from shared preference
     * @param callback LogoutCallback
     */
    fun logout(callback: LogoutCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.logout(it, callback)
                if (isMqttConnected) {
                    mqttService.disconnectFromServer()
                }
                clearSharedPreference()
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Delete all the entries from shared preference
     *
     */
    fun clearSharedPreference() {
        utility.deleteObjectsFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        utility.deleteObjectsFromSharedPref(MQTT_BROKER_PREF, sharedPreferences)
        utility.deleteObjectsFromSharedPref(USER_TYPE_PREF, sharedPreferences)
    }

    /**
     * Retrieve all acquirers
     * @param callback AcquirerCallback
     */
    fun getAcquirers(callback: AcquirerCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getAcquirers(it, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve all transactions
     * @param order asc or desc
     * @param callback TransactionCallback
     */
    fun getTransactions(order: String, callback: TransactionCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getTransactions(it, "", "", order, "0", callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve all transactions
     * @param page Page number
     * @param perPage Number of item per page
     * @param order asc or desc
     * @param getCount include total counting
     * @param callback TransactionCallback
     */
    fun getTransactions(page: String, perPage: String, order: String, getCount: String, callback: TransactionCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getTransactions(it, page, perPage, order, getCount, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve all transactions with filters
     * @param page Page number
     * @param perPage Number of item per page
     * @param startDate Start date filter
     * @param endDate End date filter
     * @param acquirerId Acquirer Id filter
     * @param order asc or desc
     * @param getCount include total counting
     * @param callback TransactionCallback
     */
    fun getTransactionsByFilters(
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        getCount: String,
        callback: TransactionCallback
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getTransactionsByFilters(
                    it,
                    page,
                    perPage,
                    startDate,
                    endDate,
                    acquirerId,
                    order,
                    getCount,
                    callback
                )
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve all transactions by filtering transaction date
     * @param page Page number
     * @param perPage Number of item per page
     * @param startDate Start date filter
     * @param endDate End date filter
     * @param order asc or desc
     * @param getCount include total counting
     * @param callback TransactionCallback
     */
    fun getTransactionsByDate(
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        order: String,
        getCount: String,
        callback: TransactionCallback
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getTransactionsByFilters(
                    it,
                    page,
                    perPage,
                    startDate,
                    endDate,
                    "",
                    order,
                    getCount,
                    callback
                )
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve all transactions by filtering the acquirers
     * @param page Page number
     * @param perPage Number of item per page
     * @param acquirerId Acquirer id filter
     * @param order asc or desc
     * @param getCount include total counting
     * @param callback TransactionCallback
     */
    fun getTransactionsByAcquirer(
        page: String,
        perPage: String,
        acquirerId: String,
        order: String,
        getCount: String,
        callback: TransactionCallback
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getTransactionsByFilters(
                    it,
                    page,
                    perPage,
                    "",
                    "",
                    acquirerId,
                    order,
                    getCount,
                    callback
                )
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve detail of transaction by id
     * @param id Transaction id
     * @param callback TransactionDetailCallback
     */
    fun getTransactionById(id: String, callback: TransactionDetailCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getTransactionById(id, it, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve detail of transaction by alias id
     * @param idAlias Transaction id
     * @param callback TransactionDetailCallback
     */
    fun getTransactionByIdAlias(idAlias: String, callback: TransactionDetailCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getTransactionByIdAlias(idAlias, it, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Create a new wallet transaction request
     * @param acquirerId Id of acquirer
     * @param amount Transaction amount
     * @param locationLat Latitude of current location
     * @param locationLong Longitude of current location
     * @param callback CreateTransactionCallback
     */
    fun createTransaction(
        acquirerId: String,
        amount: Int,
        locationLat: String,
        locationLong: String,
        callback: CreateTransactionCallback
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                val request = WalletTransactionRequest(
                    acquirerId,
                    amount,
                    arrayListOf(),
                    locationLat,
                    locationLong,
                    arrayListOf(),
                    ""
                )
                apiService.createTransactionWallet(it, request, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    //* @param track2Data Track2 data
    //* @param emvData EMV data
    /**
     * Create a new card transaction request
     * @param acquirerId Id of acquirer
     * @param amount Transaction amount
     * @param locationLat Latitude of current location
     * @param locationLong Longitude of current location
     * @param cardType Type of card (debit/credit)
     * @param pinData Pin
     * @param signatureData Signature
     * @param callback CreateTransactionCallback
     */
    fun createTransaction(
        acquirerId: String,
        amount: Int,
        locationLat: String,
        locationLong: String,
        cardType: String,
        pinData: String,
        signatureData: String,
        callback: CardTransactionCallback
    ) {
        if (paymentCardUtil.magneticTrack2.isEmpty() && paymentCardUtil.mEmvData.isEmpty())
            callback.onError(Throwable("No card detected"))
        createTransaction(
            acquirerId,
            amount,
            locationLat,
            locationLong,
            cardType,
            paymentCardUtil.magneticTrack2,
            paymentCardUtil.mEmvData,
            pinData,
            signatureData,
            callback
        )
    }

    private fun createTransaction(
        acquirerId: String,
        amount: Int,
        locationLat: String,
        locationLong: String,
        cardType: String,
        track2Data: String,
        emvData: String,
        pinData: String,
        signatureData: String,
        callback: CardTransactionCallback
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                val userToken = if (track2Data.isNotEmpty()) {
                    UserToken(arrayListOf(cardType), signatureData, pinData, "", track2Data)
                } else {
                    UserToken(arrayListOf(cardType), signatureData, pinData, emvData, "")
                }
                val request =
                    CardTransactionRequest(acquirerId, amount, ArrayList(), locationLat, locationLong, userToken)
                apiService.createTransactionCard(it, request, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve agent information
     * @param callback AgentInfoCallback
     */
    fun getAgentInfo(callback: AgentInfoCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getAgentInfo(it, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Change user password
     * @param oldPassword
     * @param newPassword
     * @param callback ChangePasswordCallback
     */
    fun changePassword(oldPassword: String, newPassword: String, callback: ChangePasswordCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                val request = ChangePasswordRequest(oldPassword, newPassword)
                apiService.changePassword(it, request, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    fun startSunmiPayService(amount: String, readTimeout: Int, callback: StartSunmiPayServiceCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        val deviceModel = Build.MODEL
        if (deviceModel.toLowerCase().startsWith("p1")) {
            mSMPayKernel.initPaySDK(appContext, object : SunmiPayKernel.ConnectCallback {
                override fun onConnectPaySDK() {
                    try {
                        mEMVOptV2 = mSMPayKernel.mEMVOptV2
                        mBasicOptV2 = mSMPayKernel.mBasicOptV2
                        mPinPadOptV2 = mSMPayKernel.mPinPadOptV2
                        mReadCardOptV2 = mSMPayKernel.mReadCardOptV2
                        mSecurityOptV2 = mSMPayKernel.mSecurityOptV2
                        isConnectPaymentSdk = true
                        paymentCardUtil = PaymentCardUtil(
                            callback, amount, readTimeout, mBasicOptV2, mReadCardOptV2, mPinPadOptV2,
                            mSecurityOptV2, mEMVOptV2
                        )
                        paymentCardUtil.stopEmvProcess()
                        paymentCardUtil.cancelCheckCard()
                        paymentCardUtil.initEmvProcess()
                    } catch (e: Exception) {
                        e.message?.let { callback.onError(Throwable(it)) }
                    }
                }

                override fun onDisconnectPaySDK() {
                    paymentCardUtil.stopEmvProcess()
                }
            })
        } else {
            callback.onError(Throwable(MESSAGE_DEVICE_NOT_SUPPORTED))
        }
    }

    fun destroySunmiPayService() {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            throw Exception(MESSAGE_ERROR_SDK)
        }

        if (mSMPayKernel != null) {
            paymentCardUtil.stopEmvProcess()
            paymentCardUtil.cancelCheckCard()
            paymentCardUtil.cancelAttachedCard()
            mSMPayKernel.destroyPaySDK()
        }
    }

    /**
     * Start the SDK MQTT service
     * @param callback MikaMqttCallback
     */
    fun startMikaMqttService(callback: MikaMqttCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            throw Exception(MESSAGE_ERROR_SDK)
        }

        mqttCallback = callback
        // retrieve the broker information from shared preference
        val brokerJson = utility.retrieveObjectFromSharedPref(MQTT_BROKER_PREF, sharedPreferences)
        if (brokerJson == null) {
            throw Exception(MESSAGE_ERROR_UNAUTHENTICATED)
        } else {
            try {
                val brokerDetail = Gson().fromJson(brokerJson, BrokerDetail::class.java)
                utility.startMqttService(brokerDetail, serviceConnection)
            } catch (exception: MqttException) {
                throw exception
            }
        }
    }

    fun getMerchantTransactions(
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        getCount: String,
        outletId: String,
        callback: MerchantTransactionCallback
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getMerchantTransactions(
                    it,
                    page,
                    perPage,
                    startDate,
                    endDate,
                    acquirerId,
                    order,
                    getCount,
                    outletId,
                    callback
                )
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    fun getMerchantTransactionById(id: String, callback: MerchantTransactionDetailCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getMerchantTransactionById(id, it, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Retrieve merchant staff information
     * @param callback MerchantStaffCallback
     */
    fun getMerchantStaffInfo(callback: MerchantStaffCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getMerchantStaffInfo(it, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    fun getMerchantStatisticByAcquirer(
        startDate: String,
        endDate: String,
        outletId: String,
        callback: MerchantAcquirerStatisticCallback
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getMerchantStatisticByAcquirer(it, startDate, endDate, outletId, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    fun getMerchantStatisticByTimeCount(
        startDate: String,
        endDate: String,
        group: String,
        groupTime: String,
        utcOffset: String,
        outletId: String,
        callback: MerchantStatisticCallback
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getMerchantStatisticByTimeCount(
                    it,
                    startDate,
                    endDate,
                    group,
                    groupTime,
                    utcOffset,
                    outletId,
                    callback
                )
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    fun getMerchantOutlets(page: String, perPage: String, outletName: String, callback: MerchantOutletCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getMerchantOutlets(it, page, perPage, outletName, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    //---------- SANDBOX FEATURE ----------
    /**
     * [SANDBOX FEATURE]
     * Set on process transaction status
     * @param request ChangeTransactionStatusRequest
     * @param callback ChangeTransactionStatusCallback
     */
    fun changeTransactionStatus(request: ChangeTransactionStatusRequest, callback: ChangeTransactionStatusCallback) {
        // verify can use sandbox feature
        if (!isSandbox)
            throw Exception(MESSAGE_ERROR_NOT_IN_SANDBOX_MODE)

        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        val sessionToken = utility.retrieveObjectFromSharedPref(SESSION_TOKEN_PREF, sharedPreferences)
        sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.changeTransactionStatus(sessionToken, request, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }
}
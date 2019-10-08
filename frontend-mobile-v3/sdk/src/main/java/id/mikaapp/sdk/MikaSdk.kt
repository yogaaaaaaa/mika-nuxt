package id.mikaapp.sdk

import android.content.ComponentName
import android.content.Context
import android.content.ServiceConnection
import android.os.Build
import android.os.IBinder
import com.sunmi.pay.hardware.aidlv2.emv.EMVOptV2
import com.sunmi.pay.hardware.aidlv2.pinpad.PinPadOptV2
import com.sunmi.pay.hardware.aidlv2.readcard.ReadCardOptV2
import com.sunmi.pay.hardware.aidlv2.security.SecurityOptV2
import com.sunmi.pay.hardware.aidlv2.system.BasicOptV2
import id.mikaapp.sdk.api.MikaApiService
import id.mikaapp.sdk.callbacks.MikaCallback
import id.mikaapp.sdk.callbacks.StartSunmiPayServiceCallback
import id.mikaapp.sdk.datasource.LocalPersistentDataSource
import id.mikaapp.sdk.di.MikaSdkKoinContext
import id.mikaapp.sdk.di.ModuleName
import id.mikaapp.sdk.models.*
import id.mikaapp.sdk.mqtt.BaseMqtt
import id.mikaapp.sdk.mqtt.MikaMqttCallback
import id.mikaapp.sdk.mqtt.MikaMqttService
import id.mikaapp.sdk.service.DeviceType
import id.mikaapp.sdk.service.cardpayment.CardTransactionService
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_DEVICE_NOT_SUPPORTED
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_FAILED_TO_CONNECT
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_NOT_IN_SANDBOX_MODE
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_SDK
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_UNAUTHENTICATED
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_ERROR_USER_PASSWORD_EMPTY
import id.mikaapp.sdk.utils.Constant.Companion.MESSAGE_MQTT_FAIL
import id.mikaapp.sdk.utils.IUtility
import id.mikaapp.sdk.utils.PaymentCardUtil
import io.sentry.Sentry
import io.sentry.android.AndroidSentryClientFactory
import org.koin.core.KoinComponent
import org.koin.core.inject
import sunmi.paylib.SunmiPayKernel
import java.io.IOException


// TODO Log only when in debug
class MikaSdk : KoinComponent {
    override fun getKoin() = MikaSdkKoinContext.koinApp.koin

    private val apiService: MikaApiService by inject(ModuleName.mikaApiService)
    private val utility: IUtility by inject(ModuleName.iUtility)
    private val localPersistentDataSource: LocalPersistentDataSource by inject(ModuleName.localPersistentDataSource)
    private lateinit var mSMPayKernel: SunmiPayKernel
    private lateinit var mqttCallback: MikaMqttCallback
    private lateinit var mEMVOptV2: EMVOptV2
    private lateinit var paymentCardUtil: PaymentCardUtil
    internal var isSandbox = false
    val cardTransactionService by lazy {
        CardTransactionService(
            appContext, when {
                Build.MODEL.toLowerCase().startsWith("p1") -> DeviceType.Sunmi
                Build.MODEL.toLowerCase() == "x990" -> DeviceType.Verifone
                else -> DeviceType.Unsupported
            }
        )
    }

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
        internal lateinit var mBasicOptV2: BasicOptV2
        internal lateinit var mReadCardOptV2: ReadCardOptV2
        internal lateinit var mPinPadOptV2: PinPadOptV2
        internal lateinit var mSecurityOptV2: SecurityOptV2
        internal lateinit var mEMVOptV2: EMVOptV2
        internal lateinit var mqttService: BaseMqtt
        internal lateinit var serviceConnection: ServiceConnection
    }

    val baseThumbnailURL get() = localPersistentDataSource.thumbnailBaseURL


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
        cardTransactionService
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

        // Log uncaught exception
        val defaultUncaughtExceptionHandler = Thread.currentThread().uncaughtExceptionHandler
        Thread.currentThread().uncaughtExceptionHandler = Thread.UncaughtExceptionHandler { thread, throwable ->
            Sentry.capture(throwable)
            defaultUncaughtExceptionHandler.uncaughtException(thread, throwable)
        }
        isSdkInitialized = true
    }

    /**
     * Login to set credential for accessing MIKA API
     * @param username
     * @param password
     * @param callback LoginCallback
     */
    fun login(username: String, password: String, callback: MikaCallback<LoginResponse>) {
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
     * Start the SDK MQTT service
     * @param useWebSocket Boolean
     * @param keepAliveInterval Int
     * @param callback MikaMqttCallback
     */
    fun startMikaMqttService(useWebSocket: Boolean = true, keepAliveInterval: Int = 60, callback: MikaMqttCallback) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            throw Exception(MESSAGE_ERROR_SDK)
        }

        mqttCallback = callback
        // retrieve the broker information from shared preference
        val brokerDetail = localPersistentDataSource.brokerDetail
        if (brokerDetail == null) {
            throw Exception(MESSAGE_ERROR_UNAUTHENTICATED)
        } else {
            utility.startMqttService(
                useWebSocket = useWebSocket, keepAliveInterval = keepAliveInterval,
                brokerDetail = brokerDetail, serviceConnection = serviceConnection
            )
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
    fun checkLoginSession(callback: MikaCallback<CheckResponse>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
    fun logout(callback: MikaCallback<BasicResponse>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
        localPersistentDataSource.save { sessionToken(null); brokerDetail(null); userType(null) }
    }

    /**
     * Retrieve all acquirers
     * @param callback MikaCallback<ArrayList<Acquirer>>
     */
    fun getAcquirers(callback: MikaCallback<ArrayList<Acquirer>>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
     * Retrieve acquirer by id
     * @param acquirerID String
     * @param callback MikaCallback<ArrayList<Acquirer>>
     */
    fun getAcquirerByID(acquirerID: String, callback: MikaCallback<Acquirer>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getAcquirerByID(it, acquirerID, callback)
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
    fun getTransactions(order: String, callback: MikaCallback<ArrayList<Transaction>>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
    fun getTransactions(
        page: String,
        perPage: String,
        order: String,
        getCount: String,
        callback: MikaCallback<ArrayList<Transaction>>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
        callback: MikaCallback<ArrayList<Transaction>>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
        callback: MikaCallback<ArrayList<Transaction>>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
        callback: MikaCallback<ArrayList<Transaction>>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
    fun getTransactionById(id: String, callback: MikaCallback<TransactionDetail>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
    fun getTransactionByIdAlias(idAlias: String, callback: MikaCallback<TransactionDetail>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
     * @param acquirerID ID of acquirer
     * @param amount Transaction amount
     * @param locationLat Latitude of current location
     * @param locationLong Longitude of current location
     * @param callback CreateTransactionCallback
     */
    fun createTransaction(
        acquirerID: String,
        amount: Int,
        locationLat: String?,
        locationLong: String?,
        callback: MikaCallback<TokenTransaction>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                if (locationLat != null && locationLong != null) {
                    apiService.createTransactionWallet(
                        sessionToken = it,
                        request = WalletTransactionRequest(
                            acquirerID,
                            amount,
                            arrayListOf(),
                            locationLat,
                            locationLong,
                            arrayListOf(),
                            ""
                        ),
                        callback = callback
                    )
                } else {
                    apiService.createTransactionWallet(
                        sessionToken = it,
                        request = WalletTransactionRequestWithoutLocation(
                            acquirerId = acquirerID,
                            amount = amount,
                            flags = arrayListOf(),
                            userToken = arrayListOf(),
                            userTokenType = ""
                        ),
                        callback = callback
                    )
                }
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
        acquirerID: String,
        amount: Int,
        locationLat: String,
        locationLong: String,
        cardType: String,
        pinData: String,
        signatureData: String,
        callback: MikaCallback<CardTransaction>
    ) {
        if (paymentCardUtil.magneticTrack2.isEmpty() && paymentCardUtil.mEmvData.isEmpty())
            callback.onError(Throwable("No card detected"))
        createTransaction(
            acquirerID,
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

    internal fun createTransaction(
        acquirerID: String,
        amount: Int,
        locationLat: String?,
        locationLong: String?,
        cardType: String,
        track2Data: String,
        emvData: String,
        pinBlockData: String,
        signatureData: String,
        callback: MikaCallback<CardTransaction>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                val userToken = if (track2Data.isNotEmpty()) {
                    UserToken(arrayListOf(cardType), signatureData, pinBlockData, "", track2Data)
                } else {
                    UserToken(arrayListOf(cardType), signatureData, pinBlockData, emvData, "")
                }
                if (locationLat != null || locationLong != null) {
                    val request =
                        CardTransactionRequest(
                            acquirerID,
                            amount,
                            ArrayList(),
                            locationLat!!,
                            locationLong!!,
                            userToken
                        )
                    apiService.createTransactionCard(it, request, callback)
                } else {
                    val request =
                        CardTransactionRequestWithoutLocation(acquirerID, amount, ArrayList(), userToken)
                    apiService.createTransactionCardWithoutLocation(it, request, callback)
                }
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
    fun getAgentInfo(callback: MikaCallback<AgentResponse>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
    fun changePassword(oldPassword: String, newPassword: String, callback: MikaCallback<BasicResponse>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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

    fun getMerchantTransactions(
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        getCount: String,
        outletId: String,
        callback: MikaCallback<ArrayList<MerchantTransaction>>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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

    fun getMerchantTransactionById(id: String, callback: MikaCallback<MerchantTransactionDetail>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
    fun getMerchantStaffInfo(callback: MikaCallback<MerchantStaffResponse>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
        callback: MikaCallback<ArrayList<MerchantTransactionStatistic>>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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
        callback: MikaCallback<ArrayList<MerchantStatisticCount>>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
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

    fun getMerchantOutlets(
        page: String,
        perPage: String,
        outletName: String,
        callback: MikaCallback<ArrayList<MerchantOutlet>>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.getMerchantOutlets(it, page, perPage, outletName, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }

    /**
     * Refund transaction
     * @param transactionID String
     * @param amount Int?
     * @param reason String?
     * @param callback MikaCallback<BasicResponse>
     */
    fun refundTransaction(
        transactionID: String,
        amount: Int? = null,
        reason: String? = null,
        callback: MikaCallback<BasicResponse>
    ) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.refundTransaction(
                    it,
                    transactionID,
                    RefundTransactionRequest(amount?.toString(), reason),
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
     * Cancel on going transaction
     * @param transactionID String
     * @param callback MikaCallback<BasicResponse>
     */
    fun cancelTransaction(transactionID: String, callback: MikaCallback<BasicResponse>) {
        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.cancelTransaction(it, transactionID, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }


//    fun startCardPaymentProcess(
////        acquirerID: String,
////        amount: Int,
////        locationLat: String?,
////        locationLong: String?,
////        cardPaymentMethod: CardPaymentMethod,
//        listener: CardTransactionServiceListener
//    ) {
//        cardTransactionProcess.setListener(listener)
//        cardTransactionProcess.start()
////        currentCardTransactionProcess = CardTransactionService(
////            context = appContext,
////            deviceType = DeviceType.Sunmi,
////            acquirerID = acquirerID,
////            amount = amount,
////            cardPaymentMethod = cardPaymentMethod,
////            locationLat = locationLat,
////            locationLong = locationLong,
////            listener = listener
////        )
////        currentCardTransactionProcess = CardTransactionProcess(
////            appContext,
////            cardType,
////            cardReadTimeout,
////            acquirerID,
////            amount,
////            locationLat,
////            locationLong,
////            listener
////        )
//    }

//    fun stopCardTransactionProcess() {
//        cardTransactionProcess.stop()
////        currentCardTransactionProcess = null
//    }
//---------- SANDBOX FEATURE ----------
    /**
     * [SANDBOX FEATURE]
     * Change on process transaction status
     * @param request ChangeTransactionStatusRequest
     * @param callback ChangeTransactionStatusCallback
     */
    fun changeTransactionStatus(request: ChangeTransactionStatusRequest, callback: MikaCallback<BasicResponse>) {
        // verify can use sandbox feature
        if (!BuildConfig.DEBUG && !isSandbox)
            throw Exception(MESSAGE_ERROR_NOT_IN_SANDBOX_MODE)

        // verify the SDK has been initialized
        if (!isSdkInitialized) {
            callback.onError(Throwable(MESSAGE_ERROR_SDK))
            return
        }

        // verify the session token (authenticated)
        localPersistentDataSource.sessionToken?.let {
            if (utility.isNetworkAvailable()) {
                apiService.changeTransactionStatus(it, request, callback)
            } else {
                callback.onError(Throwable(MESSAGE_ERROR_FAILED_TO_CONNECT))
            }
        } ?: run {
            callback.onError(Throwable(MESSAGE_ERROR_UNAUTHENTICATED))
        }
    }
}
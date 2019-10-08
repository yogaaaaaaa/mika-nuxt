package id.mikaapp.sdk

class MikaSdkTest {

//    private var loginCallback = mockk<MikaCallback<LoginResponse>>(relaxed = true)
//    private var acquirerCallback = mockk<AcquirerCallback>(relaxed = true)
//    private var transactionCallback = mockk<TransactionCallback>(relaxed = true)
//    private var transactionDetailCallback = mockk<TransactionDetailCallback>(relaxed = true)
//    private var createTransactionDetailCallback = mockk<CreateTransactionCallback>(relaxed = true)
//
//
//    private val fakeUsername = "fake_username"
//    private val fakePassword = "fake_password"
//    private val page = "1"
//    private val order = "asc"
//    private val perPage = "10"
//    private val getCount = "0"
//    private val transactionId = "1"
//    private val acquirerId = 1
//    private val amount = 1
//    private val latitude = "1"
//    private val longitude = "1"
//
//
//companion object {
//    private val mikaApiServiceMock: MikaApiService = mockkClass(MikaApiService::class, relaxed = true)
//    private var sharedPreferencesMock = mockk<SecurePreferences>(relaxed = true)
//
//    private val context : Context = mockk(relaxed = true)
//    private val utilityMock = mockk<IUtility>(relaxed = true)
//
//    @BeforeClass @JvmStatic
//    fun setUpOnce() {
//        MikaSdkKoinContext.koinApp = koinApplication {
//            androidContext(context)
//            modules(
//                listOf(
//                    module {
//                        single(ModuleName.mikaApiService) {
//                            mikaApiServiceMock
//                        }
//                        single(ModuleName.iUtility) {
//                            utilityMock
//                        }
//                        single(ModuleName.localPersistentDataSource) {
//                            sharedPreferencesMock
//                        }
//                    }
//                )
//            )
//        }
//    }
//}
//    @Before
//    fun setUp() {
//        clearAllMocks()
//        clearStaticMockk()
//        mockkStatic(Log::class)
//        every { Log.v(any(), any()) } returns 0
//        every { Log.d(any(), any()) } returns 0
//        every { Log.i(any(), any()) } returns 0
//        every { Log.e(any(), any()) } returns 0
//        appContext = context
//    }
//
//    @Test
//    fun `verify login without initializing the SDK`() {
//        every { utilityMock.isNetworkAvailable() }.returns(true)
//        MikaSdk.isSdkInitialized = false
//
//        MikaSdk.instance.login(fakeUsername, fakePassword, loginCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_SDK)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
//        assertEquals(error.message, slot.captured.message)
//    }
//
//    @Test
//    fun `verify login with empty username`() {
//        every { utilityMock.isNetworkAvailable() }.returns(true)
//        MikaSdk.isSdkInitialized = true
//
//        MikaSdk.instance.login("", fakePassword, loginCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_USER_PASSWORD_EMPTY)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
//        assertEquals(error.message, slot.captured.message)
//    }
//
//    @Test
//    fun `verify login with empty password`() {
//        every { utilityMock.isNetworkAvailable() }.returns(true)
//        MikaSdk.isSdkInitialized = true
//
//        MikaSdk.instance.login(fakeUsername, "", loginCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_USER_PASSWORD_EMPTY)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
//        assertEquals(error.message, slot.captured.message)
//    }
//
//    @Test
//    fun `verify login with empty username and password`() {
//        every { utilityMock.isNetworkAvailable() }.returns(true)
//        MikaSdk.isSdkInitialized = true
//
//        MikaSdk.instance.login("", "", loginCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_USER_PASSWORD_EMPTY)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
//        assertEquals(error.message, slot.captured.message)
//    }
//
//    @Test
//    fun `verify login with username and password`() {
//        every { utilityMock.isNetworkAvailable() }.returns(true)
//        MikaSdk.isSdkInitialized = true
//
//        MikaSdk.instance.login(fakeUsername, fakePassword, loginCallback)
//
//
//        val capturedLoginRequest = slot<LoginRequest>()
//        verify(exactly = 1) { mikaApiServiceMock.login(capture(capturedLoginRequest), loginCallback) }
//        assertEquals(fakeUsername, capturedLoginRequest.captured.username)
//        assertEquals(fakePassword, capturedLoginRequest.captured.password)
//    }
//
//    @Test
//    fun `verify login with network is not available`() {
//        every { utilityMock.isNetworkAvailable() }.returns(false)
//        MikaSdk.isSdkInitialized = true
//
//        MikaSdk.instance.login(fakeUsername, fakePassword, loginCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
//        assertEquals(error.message, slot.captured.message)
//    }
//
//    @Test
//    fun `verify startMikaMqttService with Uninitialized SDK`() {
//        // Given
//        MikaSdk.isSdkInitialized = false
//        val mikaMqttCallbackMock = mockk<MikaMqttCallback>(relaxed = true)
//
//        // When
//        var exception: Exception? = null
//        try {
//            MikaSdk.instance.startMikaMqttService(mikaMqttCallbackMock)
//        } catch (e: Exception) {
//            exception = e
//        }
//
//        // Then
//        assertEquals(MESSAGE_ERROR_SDK, exception?.message)
//    }
//
//    @Test
//    fun `Given Sdk isInitialized and brokerDetailData is not available, When startMikaMqttService, Then should throw error`() {
//        // Given
//        every { utilityMock.retrieveObjectFromSharedPref(any(), any()) } returns(null)
//        MikaSdk.isSdkInitialized = true
//        val mikaMqttCallbackMock = mockk<MikaMqttCallback>(relaxed = true)
//
//        // When
//        var exception: Exception? = null
//        try {
//            MikaSdk.instance.startMikaMqttService(mikaMqttCallbackMock)
//        } catch (e: Exception) {
//            exception = e
//        }
//        verify(exactly = 0) { utilityMock.startMqttService(any(), any()) }
//        assertEquals(MESSAGE_ERROR_UNAUTHENTICATED, exception?.message)
//    }
//
//    @Test
//    fun `Given Sdk isInitialized and brokerDetailData is available, When startMikaMqttService, Then utility_StartMqttService should be called with correct data and not thrown error`() {
//        // Given
//        MikaSdk.isSdkInitialized = true
//        MikaSdk.serviceConnection = mockk(relaxed = true)
//        every {
//            utilityMock.retrieveObjectFromSharedPref(
//                MQTT_BROKER_PREF,
//                sharedPreferencesMock
//            )
//        } returns Gson().toJson(loginResponseDummy.data.brokerDetailData)
//        val mikaMqttCallbackMock = mockk<MikaMqttCallback>(relaxed = true)
//
//        // When
//        var exception: Exception? = null
//        try {
//            MikaSdk.instance.startMikaMqttService(mikaMqttCallbackMock)
//        } catch (e: Exception) {
//            exception = e
//        }
//
//        // Then
//        verify(exactly = 1) { utilityMock.startMqttService(loginResponseDummy.data.brokerDetailData, any()) }
//        assertEquals(null, exception)
//
//    }
//
//    @Test
//    fun `verify retrieve transactions with network is not available`() {
//        every { utilityMock.isNetworkAvailable() }.returns(false)
//        MikaSdk.utilityMock = utilityMock
//        MikaSdk.isSdkInitialized = true
//
//        mikaSdk.getTransactions(page, perPage, order, getCount, transactionCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { transactionCallback.onError(capture(slot)) }
//        Assert.assertEquals(error.message, slot.captured.message)
//    }
//
//    @Test
//    fun `verify retrieve acquirers with network is not available`() {
//        every { utilityMock.isNetworkAvailable() }.returns(false)
//        MikaSdk.utilityMock = utilityMock
//        MikaSdk.isSdkInitialized = true
//
//        mikaSdk.getAcquirers(acquirerCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { acquirerCallback.onError(capture(slot)) }
//        Assert.assertEquals(error.message, slot.captured.message)
//    }
//
//    @Test
//    fun `verify retrieve transaction detail with network is not available`() {
//        every { utilityMock.isNetworkAvailable() }.returns(false)
//        MikaSdk.utilityMock = utilityMock
//        MikaSdk.isSdkInitialized = true
//
//        mikaSdk.getTransactionById(transactionId, transactionDetailCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { transactionDetailCallback.onError(capture(slot)) }
//        Assert.assertEquals(error.message, slot.captured.message)
//    }

//    @Test
//    fun `verify create transaction detail with network is not available`() {
//        every { utilityMock.isNetworkAvailable() }.returns(false)
//        MikaSdk.utilityMock = utilityMock
//        MikaSdk.isSdkInitialized = true
//
//        mikaSdk.createTransaction(acquirerId, amount, latitude, longitude, createTransactionDetailCallback)
//
//        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
//        val slot = slot<Throwable>()
//        verify(exactly = 1) { createTransactionDetailCallback.onError(capture(slot)) }
//        Assert.assertEquals(error.message, slot.captured.message)
//    }
}
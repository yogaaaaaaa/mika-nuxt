package id.mikaapp.sdk.utils

//@RunWith(RobolectricTestRunner::class)
//class UtilityTest {
//    private val contextMock = mockk<Context>(relaxed = true)
//    private val conManagerMock = mockk<ConnectivityManager>()
//    private val networkInfoMock = mockk<NetworkInfo>()
//    private val sharedPreferencesMock = mockk<SecurePreferences>(relaxed = true)
//    private val testKeyPreference = "test_key"
//
//    @Before
//    fun setUp() {
//        every { contextMock.getSystemService(Context.CONNECTIVITY_SERVICE) }.returns(conManagerMock)
//        every { contextMock.getSharedPreferences(any(), any()) }.returns(sharedPreferencesMock)
//    }
//
//    @Test
//    fun `verify network is available`() {
//        every { conManagerMock.activeNetworkInfo }.returns(networkInfoMock)
//        every { networkInfoMock.isAvailable }.returns(true)
//        every { networkInfoMock.isConnected }.returns(true)
//        assertTrue(Utility(contextMock).isNetworkAvailable())
//    }
//
//    @Test
//    fun `verify network availability with null scope`() {
//        every { conManagerMock.activeNetworkInfo }.returns(null)
//        every { networkInfoMock.isAvailable }.returns(true)
//        every { networkInfoMock.isConnected }.returns(true)
//
//        assertFalse(Utility(contextMock).isNetworkAvailable())
//    }
//
//    @Test
//    fun `verify network is not available`() {
//        every { conManagerMock.activeNetworkInfo }.returns(null)
//        every { networkInfoMock.isAvailable }.returns(false)
//        every { networkInfoMock.isConnected }.returns(true)
//
//        assertFalse(Utility(contextMock).isNetworkAvailable())
//    }
//
//    @Test
//    fun `verify network is not connected`() {
//        every { conManagerMock.activeNetworkInfo }.returns(null)
//        every { networkInfoMock.isAvailable }.returns(true)
//        every { networkInfoMock.isConnected }.returns(false)
//
//        assertFalse(Utility(contextMock).isNetworkAvailable())
//    }
//
//    @Test
//    fun `verify retrieve shared preference with empty value`() {
//        val keyName = testKeyPreference
//        Utility(contextMock).retrieveObjectFromSharedPref(keyName, sharedPreferencesMock)
//        verify { sharedPreferencesMock.getString(keyName, null) }
//    }
//
//    @Test
//    fun `When startMqttService, Then should call context_startService with correct data`() {
//        // Given
//        val sut = Utility(contextMock)
//        val brokerDetail = loginResponseDummy.data.brokerDetailData.copy(cleanSession = true)
//        val serviceConnectionMock = mockk<ServiceConnection>(relaxed = true)
//
//        // When
//        sut.startMqttService(brokerDetail, serviceConnectionMock)
//
//        // Then
//        val capturedIntent = slot<Intent>()
//        verify(exactly = 1) { contextMock.startService(capture(capturedIntent)) }
//        val i = capturedIntent.captured
//        listOf(
//            Pair(MQTT_CONNECT, i.action),
//            Pair(brokerDetail.brokerUrl, i.getStringExtra(MQTT_SERVER_URL)),
//            Pair(brokerDetail.clientId, i.getStringExtra(MQTT_CLIENT_ID)),
//            Pair(brokerDetail.user, i.getStringExtra(MQTT_CLIENT_USERNAME)),
//            Pair(brokerDetail.password, i.getStringExtra(MQTT_CLIENT_PASSWORD)),
//            Pair(brokerDetail.clientTopic, i.getStringExtra(MQTT_CLIENT_TOPIC)),
//            Pair(brokerDetail.cleanSession, i.getBooleanExtra(MQTT_CLEAN_SESSION, false))
//        ).forEach {
//            assertEquals(it.first, it.second)
//        }
//    }
//}
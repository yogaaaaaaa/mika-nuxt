package id.mikaapp.sdk.api

import android.content.Context
import android.util.Log
import com.google.gson.*
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonToken
import com.google.gson.stream.JsonWriter
import com.securepreferences.SecurePreferences
import id.mikaapp.sdk.*
import id.mikaapp.sdk.callbacks.MikaCallback
import id.mikaapp.sdk.di.MikaSdkKoinContext
import id.mikaapp.sdk.di.ModuleName
import id.mikaapp.sdk.models.*
import id.mikaapp.sdk.utils.Constant.Companion.MQTT_BROKER_PREF
import id.mikaapp.sdk.utils.Constant.Companion.SESSION_TOKEN_PREF
import id.mikaapp.sdk.utils.Constant.Companion.USER_TYPE_PREF
import id.mikaapp.sdk.utils.IUtility
import io.mockk.*
import okhttp3.*
import okio.Buffer
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.koinApplication
import org.koin.dsl.module
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.EOFException
import java.io.IOException
import java.math.BigDecimal
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit


class MikaApiServiceTest {

    private var context: Context = mockk()
    private val utilityMock = mockk<IUtility>(relaxed = true)
    private val sharedPreferencesMock = mockk<SecurePreferences>(relaxed = true)
    @Before
    fun setup() {
        clearAllMocks()
        mockkStatic(Log::class)
        every { Log.v(any(), any()) } returns 0
        every { Log.d(any(), any()) } returns 0
        every { Log.i(any(), any()) } returns 0
        every { Log.e(any(), any()) } returns 0
        MikaSdkKoinContext.koinApp = koinApplication {
            androidContext(context)
            modules(
                listOf(
                    module {
                        single(ModuleName.iUtility) {
                            utilityMock
                        }
                    },
                    module {
                        single(ModuleName.localPersistentDataSource) {
                            sharedPreferencesMock
                        }
                    }
                )
            )
        }

    }

    private inline fun <reified Receive> testRequest(
        responseCode: Int, responseMessage: String, responseBody: String,
        callbackMock: MikaCallback<Receive>,
        whenBlock: (sut: MikaApiService, callbackMock: MikaCallback<Receive>) -> Unit,
        crossinline onRequestBlock: (request: Request) -> Unit,
        thenBlock: (callbackMock: MikaCallback<Receive>) -> Unit
    ) where Receive : Any {
        // Given
        val countDownLatch = CountDownLatch(1)
        val sut = MikaApiService(createApiMock {
            onRequestBlock(it.request())
            okhttp3.Response.Builder()
                .request(it.request())
                .code(responseCode)
                .message(responseMessage)
                .protocol(Protocol.HTTP_1_1)
                .body(
                    ResponseBody.create(
                        MediaType.parse("application/json"), responseBody
                    )
                )
                .addHeader("content-type", "application/json")
                .build()
        })
        every { callbackMock.onSuccess(any()) } answers {
            countDownLatch.countDown()
        }
        every { callbackMock.onFailure(any()) } answers {
            countDownLatch.countDown()
        }
        every { callbackMock.onError(any()) } answers {
            countDownLatch.countDown()
        }

        // When
        whenBlock(sut, callbackMock)

        countDownLatch.await(10, TimeUnit.SECONDS)
        thenBlock(callbackMock)
    }

    // login
    @Test
    fun `When login with correct account, Then utility save sessionToken, userType, mqttBrokerDetailData, and callback_onSuccess called with correct data`() {
        val loginRequest = LoginRequest("a", "b")
        testRequest(
            responseCode = 200,
            responseMessage = "Login success",
            responseBody = loginCorrectAccountResponseDummy,
            callbackMock = mockk<MikaCallback<LoginResponse>>(relaxed = true),
            whenBlock = { sut, callbackMock ->
                sut.login(loginRequest, callbackMock)
            },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "login"), req.url().pathSegments())
                assertEquals(loginRequest, req.body()!!.toModel(LoginRequest::class.java))
            },
            thenBlock = { loginCallbackMock ->
                val loginResponse = Gson().fromJson(loginCorrectAccountResponseDummy, LoginResponse::class.java)

                // Utility save sessionToken
                verify(exactly = 1) {
                    utilityMock.saveObjectsToSharedPref(
                        SESSION_TOKEN_PREF,
                        loginResponse.data.sessionToken,
                        sharedPreferencesMock
                    )
                }

                // Utility save userType
                verify(exactly = 1) {
                    utilityMock.saveObjectsToSharedPref(
                        USER_TYPE_PREF,
                        loginResponse.data.userType!!,
                        sharedPreferencesMock
                    )
                }

                // Utility save brokerDetailData
                val brokerDetailDataJSON = Gson().toJson(loginResponse.data.brokerDetailData)
                verify(exactly = 1) {
                    utilityMock.saveObjectsToSharedPref(
                        MQTT_BROKER_PREF,
                        brokerDetailDataJSON,
                        sharedPreferencesMock
                    )
                }

                // callback.onSuccess called with correct data
                val capturedResponse = slot<LoginResponse>()
                verify(exactly = 0) { loginCallbackMock.onFailure(any()) }
                verify(exactly = 0) { loginCallbackMock.onError(any()) }
                verify(exactly = 1) { loginCallbackMock.onSuccess(capture(capturedResponse)) }
                assertEquals(loginResponse, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When login with correct account and got empty response body, Then callback_onError called with EOFException`() {
        val loginRequest = LoginRequest("a", "b")
        val wrongResponseBody = ""
        testRequest(
            responseCode = 200,
            responseMessage = "Login success",
            responseBody = wrongResponseBody,
            callbackMock = mockk<MikaCallback<LoginResponse>>(relaxed = true),
            whenBlock = { sut, callbackMock ->
                sut.login(loginRequest, callbackMock)
            },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "login"), req.url().pathSegments())
                assertEquals(loginRequest, req.body()!!.toModel(LoginRequest::class.java))
            },
            thenBlock = { loginCallbackMock ->
                val capturedResponse = slot<Throwable>()
                verify(exactly = 0) { loginCallbackMock.onFailure(any()) }
                verify(exactly = 0) { loginCallbackMock.onSuccess(any()) }
                verify(exactly = 1) { loginCallbackMock.onError(capture(capturedResponse)) }

                assertTrue(capturedResponse.captured is EOFException)
            }
        )
    }

    @Test
    fun `When login with correct account and got malformed response body, Then callback_onError called with JsonSyntaxException`() {
        val loginRequest = LoginRequest("a", "b")
        val wrongResponseBody = "Malformed"
        testRequest(
            responseCode = 200,
            responseMessage = "Login success",
            responseBody = wrongResponseBody,
            callbackMock = mockk<MikaCallback<LoginResponse>>(relaxed = true),
            whenBlock = { sut, callbackMock ->
                sut.login(loginRequest, callbackMock)
            },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "login"), req.url().pathSegments())
                assertEquals(loginRequest, req.body()!!.toModel(LoginRequest::class.java))
            },
            thenBlock = { loginCallbackMock ->
                val capturedResponse = slot<Throwable>()
                verify(exactly = 0) { loginCallbackMock.onFailure(any()) }
                verify(exactly = 0) { loginCallbackMock.onSuccess(any()) }
                verify(exactly = 1) { loginCallbackMock.onError(capture(capturedResponse)) }

                lateinit var thrown: Throwable
                try {
                    Gson().fromJson(wrongResponseBody, LoginResponse::class.java)
                } catch (t: Throwable) {
                    thrown = t
                }
                assertEquals(JsonSyntaxException::class, capturedResponse.captured::class)
                assertEquals(thrown.message, capturedResponse.captured.message)
            }
        )
    }

    @Test
    fun `When login with incorrect account, Then get callback_onFailure called with correct data`() {
        val loginRequest = LoginRequest("a", "b")
        testRequest(
            responseCode = 400,
            responseMessage = "Invalid credential for authentication",
            responseBody = loginInvalidAccountResponseDummy,
            callbackMock = mockk<MikaCallback<LoginResponse>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.login(loginRequest, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "login"), req.url().pathSegments())
                assertEquals(loginRequest, req.body()!!.toModel(LoginRequest::class.java))
            },
            thenBlock = { callbackMock ->
                // Then
                val capturedResponse = slot<BasicResponse>()
                verify(exactly = 0) { callbackMock.onSuccess(any()) }
                verify(exactly = 0) { callbackMock.onError(any()) }
                verify(exactly = 1) { callbackMock.onFailure(capture(capturedResponse)) }
                val expectedResponse = Gson().fromJson(loginInvalidAccountResponseDummy, BasicResponse::class.java)
                assertEquals(expectedResponse, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When login with incorrect account and got empty response body, Then callback_onError called with KotlinNullPointerException`() {
        val loginRequest = LoginRequest("a", "b")
        val wrongResponseBody = ""
        testRequest(
            responseCode = 400,
            responseMessage = "Invalid credential for authentication",
            responseBody = wrongResponseBody,
            callbackMock = mockk<MikaCallback<LoginResponse>>(relaxed = true),
            whenBlock = { sut, callbackMock ->
                sut.login(loginRequest, callbackMock)
            },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "login"), req.url().pathSegments())
                assertEquals(loginRequest, req.body()!!.toModel(LoginRequest::class.java))
            },
            thenBlock = { loginCallbackMock ->

                // callback.onSuccess called with correct data
                val capturedResponse = slot<Throwable>()
                verify(exactly = 0) { loginCallbackMock.onFailure(any()) }
                verify(exactly = 0) { loginCallbackMock.onSuccess(any()) }
                verify(exactly = 1) { loginCallbackMock.onError(capture(capturedResponse)) }
                assertEquals(KotlinNullPointerException::class, capturedResponse.captured::class)
                assertEquals("[400] Null Response Body", capturedResponse.captured.message)
            }
        )
    }

    @Test
    fun `When login with incorrect account and got wrong response body, Then callback_onError called with JsonSyntaxException`() {
        val loginRequest = LoginRequest("a", "b")
        val wrongResponseBody = "Wrong"
        testRequest(
            responseCode = 400,
            responseMessage = "Invalid credential for authentication",
            responseBody = wrongResponseBody,
            callbackMock = mockk<MikaCallback<LoginResponse>>(relaxed = true),
            whenBlock = { sut, callbackMock ->
                sut.login(loginRequest, callbackMock)
            },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "login"), req.url().pathSegments())
                assertEquals(loginRequest, req.body()!!.toModel(LoginRequest::class.java))
            },
            thenBlock = { loginCallbackMock ->

                val capturedResponse = slot<Throwable>()
                verify(exactly = 0) { loginCallbackMock.onFailure(any()) }
                verify(exactly = 0) { loginCallbackMock.onSuccess(any()) }
                verify(exactly = 1) { loginCallbackMock.onError(capture(capturedResponse)) }
                lateinit var expectedOnErrorParameter: Throwable
                try {
                    Gson().fromJson(wrongResponseBody, BasicResponse::class.java)
                } catch (ex: Throwable) {
                    expectedOnErrorParameter = ex
                }
                assertEquals(JsonSyntaxException::class, capturedResponse.captured::class)
                assertEquals(expectedOnErrorParameter.message, capturedResponse.captured.message)
            }
        )
    }

    @Test
    fun `When login and got network error, Then callback_onError called with IOException`() {
        val expectedThrowable = IOException("Network error")
        val loginRequest = LoginRequest("a", "b")
        testRequest(
            responseCode = 400,
            responseMessage = "Invalid credential for authentication",
            responseBody = loginInvalidAccountResponseDummy,
            callbackMock = mockk<MikaCallback<LoginResponse>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.login(loginRequest, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "login"), req.url().pathSegments())
                throw expectedThrowable
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<Throwable>()
                verify(exactly = 1) { callbackMock.onError(capture(capturedResponse)) }
                assertEquals(IOException::class, capturedResponse.captured::class)
                assertEquals(expectedThrowable, capturedResponse.captured)
            }
        )
    }

    // checkLoginSession
    @Test
    fun `When checkLoginSession with valid sessionToken, Then callback_onSuccess called with correct data`() {
        val checkSessionRequest = CheckRequest("a")
        testRequest(
            responseCode = 200,
            responseMessage = "Session token is still valid",
            responseBody = checkLoginSessionValidResponseDummy,
            callbackMock = mockk<MikaCallback<CheckResponse>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.checkLoginSession(checkSessionRequest, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "check"), req.url().pathSegments())
                assertEquals(checkSessionRequest, req.body()!!.toModel(CheckRequest::class.java))
            },
            thenBlock = { callbackMock ->
                val checkResponse = Gson().fromJson(checkLoginSessionValidResponseDummy, CheckResponse::class.java)
                val capturedResponse = slot<CheckResponse>()
                verify(exactly = 1) { callbackMock.onSuccess(capture(capturedResponse)) }
                assertEquals(checkResponse, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When checkLoginSession with invalid sessionToken, Then get callback_onFailure called with correct data`() {
        val checkSessionRequest = CheckRequest("a")
        testRequest(
            responseCode = 400,
            responseMessage = "Invalid session token",
            responseBody = checkLoginSessionInvalidResponseDummy,
            callbackMock = mockk<MikaCallback<CheckResponse>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.checkLoginSession(checkSessionRequest, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "check"), req.url().pathSegments())
                assertEquals(checkSessionRequest, req.body()!!.toModel(CheckRequest::class.java))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<BasicResponse>()
                verify(exactly = 1) { callbackMock.onFailure(capture(capturedResponse)) }
                val expectedResponse = Gson().fromJson(checkLoginSessionInvalidResponseDummy, BasicResponse::class.java)
                assertEquals(expectedResponse, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When checkLoginSession and got network error, Then callback_onError called with correct data`() {
        val expectedThrowable = IOException("Network error")
        val checkSessionRequest = CheckRequest("a")
        testRequest(
            responseCode = 400,
            responseMessage = "Invalid session token",
            responseBody = checkLoginSessionInvalidResponseDummy,
            callbackMock = mockk<MikaCallback<CheckResponse>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.checkLoginSession(checkSessionRequest, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "check"), req.url().pathSegments())
                throw expectedThrowable
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<Throwable>()
                verify(exactly = 1) { callbackMock.onError(capture(capturedResponse)) }
                assertEquals(expectedThrowable, capturedResponse.captured)
            }
        )
    }

    // logout
    @Test
    fun `When logout and authenticated, Then callback_onSuccess called with correct data`() {
        val sessionTokenMock = "12345"
        testRequest(
            responseCode = 200,
            responseMessage = "Logout success",
            responseBody = logoutSuccessDummyRaw,
            callbackMock = mockk<MikaCallback<BasicResponse>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.logout(sessionTokenMock, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "logout"), req.url().pathSegments())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<BasicResponse>()
                verify(exactly = 1) { callbackMock.onSuccess(capture(capturedResponse)) }
                val expectedResponse = Gson().fromJson(logoutSuccessDummyRaw, BasicResponse::class.java)
                assertEquals(expectedResponse, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When logout and not authenticated, Then callback_onFailure called with correct data`() {
        val sessionTokenMock = "12345"
        testRequest(
            responseCode = 401,
            responseMessage = "Not authenticated",
            responseBody = logoutNotAuthenticatedDummyRaw,
            callbackMock = mockk<MikaCallback<BasicResponse>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.logout(sessionTokenMock, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "logout"), req.url().pathSegments())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<BasicResponse>()
                verify(exactly = 1) { callbackMock.onFailure(capture(capturedResponse)) }
                val expectedResponse = Gson().fromJson(logoutNotAuthenticatedDummyRaw, BasicResponse::class.java)
                assertEquals(expectedResponse, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When logout and got network error, Then callback_onError called with correct data`() {
        val expectedThrowable = IOException("Network error")
        val sessionTokenMock = "12345"
        testRequest(
            responseCode = 401,
            responseMessage = "Not authenticated",
            responseBody = logoutNotAuthenticatedDummyRaw,
            callbackMock = mockk<MikaCallback<BasicResponse>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.logout(sessionTokenMock, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("auth", "logout"), req.url().pathSegments())
                throw expectedThrowable
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<Throwable>()
                verify(exactly = 1) { callbackMock.onError(capture(capturedResponse)) }
                assertEquals(expectedThrowable, capturedResponse.captured)
            }
        )
    }

    // getAcquirers
    @Test
    fun `When getAcquirers and userType is agent and Authenticated, Then callback_onSuccess called with correct data`() {
        val sessionTokenMock = "12345"
        every { utilityMock.retrieveObjectFromSharedPref(USER_TYPE_PREF, sharedPreferencesMock) } returns "agent"
        testRequest(
            responseCode = 200,
            responseMessage = "Entity(s) found",
            responseBody = getAcquirersAgentAuthenticatedDummyRaw,
            callbackMock = mockk<MikaCallback<ArrayList<Acquirer>>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.getAcquirers(sessionTokenMock, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("agent", "acquirers"), req.url().pathSegments())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<java.util.ArrayList<Acquirer>>()
                verify(exactly = 1) { callbackMock.onSuccess(capture(capturedResponse)) }
                val expectedCallbackData =
                    Gson().fromJson(getAcquirersAgentAuthenticatedDummyRaw, AcquirersResponse::class.java).data
                assertEquals(expectedCallbackData, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When getAcquirers and userType is agent and not Authenticated, Then callback_onFailure called with correct data`() {
        val sessionTokenMock = "12345"
        every { utilityMock.retrieveObjectFromSharedPref(USER_TYPE_PREF, sharedPreferencesMock) } returns "agent"
        testRequest(
            responseCode = 401,
            responseMessage = "Not authenticated",
            responseBody = getAcquirersAgentNotAuthenticatedDummyRaw,
            callbackMock = mockk<MikaCallback<ArrayList<Acquirer>>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.getAcquirers(sessionTokenMock, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("agent", "acquirers"), req.url().pathSegments())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<BasicResponse>()
                verify(exactly = 1) { callbackMock.onFailure(capture(capturedResponse)) }
                val expectedCallbackData =
                    Gson().fromJson(getAcquirersAgentNotAuthenticatedDummyRaw, BasicResponse::class.java)
                assertEquals(expectedCallbackData, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When getAcquirers and userType is not agent and Authenticated, Then callback_onSuccess called with correct data`() {
        val sessionTokenMock = "12345"
        every { utilityMock.retrieveObjectFromSharedPref(USER_TYPE_PREF, sharedPreferencesMock) } returns "not agent"
        testRequest(
            responseCode = 200,
            responseMessage = "Entity(s) found",
            responseBody = getAcquirersMerchantAuthenticatedDummyRaw,
            callbackMock = mockk<MikaCallback<ArrayList<Acquirer>>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.getAcquirers(sessionTokenMock, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("merchant_staff", "acquirers"), req.url().pathSegments())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<java.util.ArrayList<Acquirer>>()
                verify(exactly = 1) { callbackMock.onSuccess(capture(capturedResponse)) }
                val expectedCallbackData =
                    Gson().fromJson(getAcquirersMerchantAuthenticatedDummyRaw, AcquirersResponse::class.java).data
                assertEquals(expectedCallbackData, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When getAcquirers and userType is not agent and not Authenticated, Then callback_onFailure called with correct data`() {
        val sessionTokenMock = "12345"
        every { utilityMock.retrieveObjectFromSharedPref(USER_TYPE_PREF, sharedPreferencesMock) } returns "not agent"
        testRequest(
            responseCode = 401,
            responseMessage = "Not authenticated",
            responseBody = getAcquirersMerchantNotAuthenticatedDummyRaw,
            callbackMock = mockk<MikaCallback<ArrayList<Acquirer>>>(relaxed = true),
            whenBlock = { sut, cbMock -> sut.getAcquirers(sessionTokenMock, cbMock) },
            onRequestBlock = { req ->
                assertEquals(listOf("merchant_staff", "acquirers"), req.url().pathSegments())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<BasicResponse>()
                verify(exactly = 1) { callbackMock.onFailure(capture(capturedResponse)) }
                val expectedCallbackData =
                    Gson().fromJson(getAcquirersMerchantNotAuthenticatedDummyRaw, BasicResponse::class.java)
                assertEquals(expectedCallbackData, capturedResponse.captured)
            }
        )
    }

    // getTransactions
    @Test
    fun `When getTransactions called with empty page and authenticated, Then query is null and callback_onSuccess called with correct data`() {
        val sessionTokenMock = "12345"
        every { utilityMock.retrieveObjectFromSharedPref(USER_TYPE_PREF, sharedPreferencesMock) } returns "not agent"
        testRequest(
            responseCode = 200,
            responseMessage = "Entity(s) found",
            responseBody = getTransactionsDummyRaw,
            callbackMock = mockk<MikaCallback<ArrayList<Transaction>>>(relaxed = true),
            whenBlock = { sut, cbMock ->
                sut.getTransactions(
                    sessionToken = sessionTokenMock,
                    page = "",
                    get_count = "1",
                    order = "order",
                    perPage = "pp",
                    callback = cbMock
                )
            },
            onRequestBlock = { req ->
                assertEquals(listOf("agent", "transactions"), req.url().pathSegments())
                assertNull(req.url().query())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<java.util.ArrayList<Transaction>>()
                verify(exactly = 1) { callbackMock.onSuccess(capture(capturedResponse)) }
                val expectedCallbackData =
                    Gson().fromJson(getTransactionsDummyRaw, TransactionResponse::class.java).data
                assertEquals(expectedCallbackData, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When getTransactions called with not empty page and authenticated, Then request is called with correct param and callback_onSuccess called with correct data`() {
        val sessionTokenMock = "12345"
        every { utilityMock.retrieveObjectFromSharedPref(USER_TYPE_PREF, sharedPreferencesMock) } returns "not agent"
        testRequest(
            responseCode = 200,
            responseMessage = "Entity(s) found",
            responseBody = getTransactionsDummyRaw,
            callbackMock = mockk<MikaCallback<ArrayList<Transaction>>>(relaxed = true),
            whenBlock = { sut, cbMock ->
                sut.getTransactions(
                    sessionToken = sessionTokenMock,
                    page = "2",
                    get_count = "1",
                    order = "ASC",
                    perPage = "5",
                    callback = cbMock
                )
            },
            onRequestBlock = { req ->
                assertEquals(listOf("agent", "transactions"), req.url().pathSegments())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
                assertEquals("2", req.url().queryParameter("page"))
                assertEquals("1", req.url().queryParameter("get_count"))
                assertEquals("ASC", req.url().queryParameter("order"))
                assertEquals("5", req.url().queryParameter("per_page"))
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<java.util.ArrayList<Transaction>>()
                verify(exactly = 1) { callbackMock.onSuccess(capture(capturedResponse)) }
                val expectedCallbackData =
                    Gson().fromJson(getTransactionsDummyRaw, TransactionResponse::class.java).data
                assertEquals(expectedCallbackData, capturedResponse.captured)
            }
        )
    }

    @Test
    fun `When getTransactions called and Unauthenticated, callback_onFailed called with correct data`() {
        val sessionTokenMock = "12345"
        every { utilityMock.retrieveObjectFromSharedPref(USER_TYPE_PREF, sharedPreferencesMock) } returns "not agent"
        testRequest(
            responseCode = 401,
            responseMessage = "Not authenticated",
            responseBody = getTransactionsUnauthenticatedDummyRaw,
            callbackMock = mockk<MikaCallback<ArrayList<Transaction>>>(relaxed = true),
            whenBlock = { sut, cbMock ->
                sut.getTransactions(
                    sessionToken = sessionTokenMock,
                    page = "",
                    get_count = "1",
                    order = "order",
                    perPage = "pp",
                    callback = cbMock
                )
            },
            onRequestBlock = { req ->
                assertEquals(listOf("agent", "transactions"), req.url().pathSegments())
                assertEquals(sessionTokenMock, req.header("X-Access-Token"))
                assertNull(req.url().query())
            },
            thenBlock = { callbackMock ->
                val capturedResponse = slot<BasicResponse>()
                verify(exactly = 1) { callbackMock.onFailure(capture(capturedResponse)) }
                val expectedCallbackData =
                    Gson().fromJson(getTransactionsUnauthenticatedDummyRaw, BasicResponse::class.java)
                assertEquals(expectedCallbackData, capturedResponse.captured)
            }
        )
    }


    private fun createApiMock(interceptor: (Interceptor.Chain) -> Response): Api {
        return Retrofit.Builder()
            .baseUrl("https://test.com")
            .client(
                OkHttpClient.Builder()
                    .addInterceptor(interceptor)
                    .build()
            )
            .addConverterFactory(
                GsonConverterFactory.create(
                    GsonBuilder()
                        .setFieldNamingPolicy(FieldNamingPolicy.IDENTITY)
                        .registerTypeAdapter(BigDecimal::class.java, object : TypeAdapter<BigDecimal>() {
                            override fun write(out: JsonWriter?, value: BigDecimal?) {
                            }

                            override fun read(reader: JsonReader): BigDecimal? {
                                val token = reader.peek()
                                return if (token == JsonToken.STRING) {
                                    val stringNum = reader.nextString()
                                    if (stringNum == null || stringNum.isEmpty()) {
                                        null
                                    } else {
                                        BigDecimal(stringNum)
                                    }
                                } else if (token == JsonToken.NUMBER) {
                                    BigDecimal(reader.nextInt())
                                } else {
                                    reader.skipValue()
                                    null
                                }
                            }

                        })
                        .setLenient()
                        .create()
                )
            )
            .build()
            .create(Api::class.java)
    }


    private fun RequestBody.string(): String {
        val b = Buffer()
        this.writeTo(b)
        return b.readUtf8()
    }

    private fun <T> RequestBody.toModel(to: Class<T>): T {
        return Gson().fromJson(string(), to)
    }
}

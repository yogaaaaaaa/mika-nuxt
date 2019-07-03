package id.mikaapp.sdk

import android.content.Context
import com.securepreferences.SecurePreferences
import id.mikaapp.sdk.MikaSdk.Companion.appContext
import id.mikaapp.sdk.callbacks.*
import id.mikaapp.sdk.utils.Constant
import id.mikaapp.sdk.utils.IUtility
import io.mockk.*
import org.junit.Assert
import org.junit.Before
import org.junit.Test

class MikaSdkTest {

    private var mikaSdk = MikaSdk.instance
    private var loginCallback = mockk<LoginCallback>(relaxed = true)
    private var acquirerCallback = mockk<AcquirerCallback>(relaxed = true)
    private var transactionCallback = mockk<TransactionCallback>(relaxed = true)
    private var transactionDetailCallback = mockk<TransactionDetailCallback>(relaxed = true)
    private var createTransactionDetailCallback = mockk<CreateTransactionCallback>(relaxed = true)
    private var context: Context = mockk()
    private var sharedPreferences = mockk<SecurePreferences>()

    private val utility = mockk<IUtility>(relaxed = true)

    private val fakeUsername = "fake_username"
    private val fakePassword = "fake_password"
    private val page = "1"
    private val order = "asc"
    private val perPage = "10"
    private val getCount = "0"
    private val transactionId = "1"
    private val acquirerId = 1
    private val amount = 1
    private val latitude = "1"
    private val longitude = "1"

    @Before
    fun setUp() {
        clearAllMocks()
        appContext = context
        MikaSdk.sharedPreferences = sharedPreferences
    }

    @Test
    fun `verify login without initializing the SDK`() {
        every { utility.isNetworkAvailable() }.returns(true)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = false

        mikaSdk.login(fakeUsername, fakePassword, loginCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_SDK)
        val slot = slot<Throwable>()
        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }

    @Test
    fun `verify login with empty username`() {
        every { utility.isNetworkAvailable() }.returns(true)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = true

        mikaSdk.login("", fakePassword, loginCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_USER_PASSWORD_EMPTY)
        val slot = slot<Throwable>()
        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }

    @Test
    fun `verify login with empty password`() {
        every { utility.isNetworkAvailable() }.returns(true)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = true

        mikaSdk.login(fakeUsername, "", loginCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_USER_PASSWORD_EMPTY)
        val slot = slot<Throwable>()
        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }

    @Test
    fun `verify login with empty username and password`() {
        every { utility.isNetworkAvailable() }.returns(true)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = true

        mikaSdk.login("", "", loginCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_USER_PASSWORD_EMPTY)
        val slot = slot<Throwable>()
        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }

//    @Test
//    fun `verify login with username and password`() {
//        utility.networkAvailable = true
//        MikaSdk.utility = utility
//        MikaSdk.isSdkInitialized = true
//        mikaSdk.login(fakeUsername, fakePassword, loginCallback)
//
////        val error = Throwable(Constant.MESSAGE_ERROR_USER_PASSWORD_EMPTY)
////        Assert.assertTrue(loginCallback.verifyOnError(error))
//    }

    @Test
    fun `verify login with network is not available`() {
        every { utility.isNetworkAvailable() }.returns(false)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = true

        mikaSdk.login(fakeUsername, fakePassword, loginCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
        val slot = slot<Throwable>()
        verify(exactly = 1) { loginCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }

    @Test
    fun `verify retrieve transactions with network is not available`() {
        every { utility.isNetworkAvailable() }.returns(false)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = true

        mikaSdk.getTransactions(page, perPage, order, getCount, transactionCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
        val slot = slot<Throwable>()
        verify(exactly = 1) { transactionCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }

    @Test
    fun `verify retrieve acquirers with network is not available`() {
        every { utility.isNetworkAvailable() }.returns(false)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = true

        mikaSdk.getAcquirers(acquirerCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
        val slot = slot<Throwable>()
        verify(exactly = 1) { acquirerCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }

    @Test
    fun `verify retrieve transaction detail with network is not available`() {
        every { utility.isNetworkAvailable() }.returns(false)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = true

        mikaSdk.getTransactionById(transactionId, transactionDetailCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
        val slot = slot<Throwable>()
        verify(exactly = 1) { transactionDetailCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }

    @Test
    fun `verify create transaction detail with network is not available`() {
        every { utility.isNetworkAvailable() }.returns(false)
        MikaSdk.utility = utility
        MikaSdk.isSdkInitialized = true

        mikaSdk.createTransaction(acquirerId, amount, latitude, longitude, createTransactionDetailCallback)

        val error = Throwable(Constant.MESSAGE_ERROR_FAILED_TO_CONNECT)
        val slot = slot<Throwable>()
        verify(exactly = 1) { createTransactionDetailCallback.onError(capture(slot)) }
        Assert.assertEquals(error.message, slot.captured.message)
    }
}
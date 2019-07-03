package id.mikaapp.sdk.utils

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkInfo
import com.securepreferences.SecurePreferences
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class UtilityTest {
    private val contextMock = mockk<Context>(relaxed = true)
    private val conManagerMock = mockk<ConnectivityManager>()
    private val networkInfoMock = mockk<NetworkInfo>()
    private val sharedPreferencesMock = mockk<SecurePreferences>(relaxed = true)
    private val testKeyPreference = "test_key"

    @Before
    fun setUp() {
        every { contextMock.getSystemService(Context.CONNECTIVITY_SERVICE) }.returns(conManagerMock)
        every { contextMock.getSharedPreferences(any(), any()) }.returns(sharedPreferencesMock)
    }

    @Test
    fun `verify network is available`() {
        every { conManagerMock.activeNetworkInfo }.returns(networkInfoMock)
        every { networkInfoMock.isAvailable }.returns(true)
        every { networkInfoMock.isConnected }.returns(true)
        assertTrue(Utility(contextMock).isNetworkAvailable())
    }

    @Test
    fun `verify network availability with null scope`() {
        every { conManagerMock.activeNetworkInfo }.returns(null)
        every { networkInfoMock.isAvailable }.returns(true)
        every { networkInfoMock.isConnected }.returns(true)

        assertFalse(Utility(contextMock).isNetworkAvailable())
    }

    @Test
    fun `verify network is not available`() {
        every { conManagerMock.activeNetworkInfo }.returns(null)
        every { networkInfoMock.isAvailable }.returns(false)
        every { networkInfoMock.isConnected }.returns(true)

        assertFalse(Utility(contextMock).isNetworkAvailable())
    }

    @Test
    fun `verify network is not connected`() {
        every { conManagerMock.activeNetworkInfo }.returns(null)
        every { networkInfoMock.isAvailable }.returns(true)
        every { networkInfoMock.isConnected }.returns(false)

        assertFalse(Utility(contextMock).isNetworkAvailable())
    }

    @Test
    fun `verify retrieve shared preference with empty value`() {
        val keyName = testKeyPreference
        Utility(contextMock).retrieveObjectFromSharedPref(keyName, sharedPreferencesMock)
        verify { sharedPreferencesMock.getString(keyName, null) }
    }
}
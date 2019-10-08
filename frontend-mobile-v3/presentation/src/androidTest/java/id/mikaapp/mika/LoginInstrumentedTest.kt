package id.mikaapp.mika

import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.runner.RunWith


@RunWith(AndroidJUnit4::class)
class LoginInstrumentedTest {
//
//    @get:Rule
//    var activityRule = IntentsTestRule(LoginActivity::class.java)
//
//
//    @Test
//    fun loginWithCorrectAgentAccount() {
//        onView(withId(R.id.edittextUsername))
//            .perform(typeText("agent3"), closeSoftKeyboard())
//        onView(withId(R.id.edittextPassword))
//            .perform(typeText("agent3"), closeSoftKeyboard())
//        onView(withId(R.id.buttonLogin))
//            .perform(click())
//        waitLoginNetworkCall()
//        Intents.intended(IntentMatchers.hasComponent(AgentHomeActivity::class.java.name))
//    }
//
//    @Test
//    fun loginWithCorrectMerchantStaffAccount() {
//        onView(withId(R.id.edittextUsername))
//            .perform(typeText("merchantStaff3"), closeSoftKeyboard())
//        onView(withId(R.id.edittextPassword))
//            .perform(typeText("merchantStaff3"), closeSoftKeyboard())
//        onView(withId(R.id.buttonLogin))
//            .perform(click())
//        waitLoginNetworkCall()
//        Intents.intended(IntentMatchers.hasComponent(DashboardHomeActivity::class.java.name))
//    }
//
//    @Test
//    fun loginWithInvalidAccount() {
//        onView(withId(R.id.edittextUsername))
//            .perform(typeText("agent3"), closeSoftKeyboard())
//        onView(withId(R.id.edittextPassword))
//            .perform(typeText("agent31"), closeSoftKeyboard())
//        onView(withId(R.id.buttonLogin))
//            .perform(click())
//        waitLoginNetworkCall()
//        onView(withText("Invalid credential for authentication")).inRoot(withDecorView(not(`is`(activityRule.activity.window.decorView))))
//            .check(matches(isDisplayed()))
//    }
//
//    private fun waitLoginNetworkCall() {
//        var cb: IdlingResource.ResourceCallback? = null
//        var loading = true
//        IdlingRegistry.getInstance().register(object : IdlingResource {
//            override fun getName() = "Login Idling Resource"
//            override fun isIdleNow() = !loading
//            override fun registerIdleTransitionCallback(callback: IdlingResource.ResourceCallback?) {
//                cb = callback
//            }
//        })
//
//        activityRule.runOnUiThread {
//            activityRule.activity.viewModel.loadingState.observe(activityRule.activity, Observer {
//                if (!it) {
//                    loading = false
//                    cb?.onTransitionToIdle()
//                }
//            })
//        }
//    }
}

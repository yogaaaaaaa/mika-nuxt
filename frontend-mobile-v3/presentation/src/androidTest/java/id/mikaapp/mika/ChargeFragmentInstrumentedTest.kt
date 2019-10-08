package id.mikaapp.mika

import androidx.lifecycle.Observer
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.IdlingRegistry
import androidx.test.espresso.IdlingResource
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.*
import androidx.test.espresso.intent.Intents
import androidx.test.espresso.intent.matcher.IntentMatchers
import androidx.test.espresso.intent.rule.IntentsTestRule
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import id.mikaapp.mika.agent.agenthome.AgentHomeActivity
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.main.MainActivity
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class AgentChargeFragmentInstrumentedTest {

    @get:Rule
    var activityRule = IntentsTestRule(MainActivity::class.java)

    @Test
    fun agentDoLinkAjaTransaction() {
        onView(withId(R.id.loginUsernameEditText))
            .perform(typeText("agent3"), closeSoftKeyboard())
        onView(withId(R.id.loginPasswordEditText))
            .perform(typeText("agent3"), closeSoftKeyboard())
        onView(withId(R.id.loginLogin))
            .perform(click())
        Intents.intended(IntentMatchers.hasComponent(AgentHomeActivity::class.java.name))
        listOf(
            R.id.chargeButton1,
            R.id.chargeButton0,
            R.id.chargeButton0
        )
            .forEach {
                onView(withId(it)).perform(click())
            }
        onView(withId(R.id.chargeTextViewInput))
            .check(matches(withText("Rp 100")))
        onView(withId(R.id.chargeButtonPay))
            .perform(click())
        onView(withText("LinkAja"))
            .perform(click())
        onView(withText("Change Status Success"))
            .perform(click())
        Thread.sleep(10000)
        onView(withId(R.id.transactionDetailTextViewStatus))
            .check(matches(withText("Transaksi Sukses")))
    }

    private fun waitLoginNetworkCall(activity: LoginActivity) {
        var cb: IdlingResource.ResourceCallback? = null
        var loading = true
        IdlingRegistry.getInstance().register(object : IdlingResource {
            override fun getName() = "Login Idling Resource"
            override fun isIdleNow() = !loading
            override fun registerIdleTransitionCallback(callback: IdlingResource.ResourceCallback?) {
                cb = callback
            }
        })

        activityRule.runOnUiThread {
            activity.viewModel.loadingState.observe(activityRule.activity, Observer {
                if (!it) {
                    loading = false
                    cb?.onTransitionToIdle()
                }
            })
        }
    }

//    inline fun <reified T : Activity> isVisible() : Boolean {
//        val am = activityRule.activity.applicationContext.getSystemService(ACTIVITY_SERVICE) as ActivityManager
//        val visibleActivityName = am.appTasks[0].taskInfo.baseActivity.className
//        return visibleActivityName == T::class.java.name
//    }
//
//    inline fun <reified T : Activity> waitUntilActivityVisible() {
//        val startTime = System.currentTimeMillis()
//        while (!isVisible<T>()) {
//            Thread.sleep(100)
//            if (System.currentTimeMillis() - startTime >= 10000) {
//                throw AssertionError("Activity ${T::class.java.simpleName} not visible after $10000 milliseconds")
//            }
//        }
//    }

}
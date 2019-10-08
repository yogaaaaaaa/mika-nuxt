package id.mikaapp.mika

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.intent.Intents.intended
import androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent
import androidx.test.espresso.intent.rule.IntentsTestRule
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import id.mikaapp.mika.agent.agenthome.AgentHomeActivity
import id.mikaapp.mika.main.MainActivity
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MikaAppInstrumentedTest {

    @get:Rule
    var activityRule = IntentsTestRule(MainActivity::class.java)

    @Test
    fun agentDoLinkAjaTransactionSuccess() {
        login()
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
//        onView(withId(R.id.text_status_detail))
//            .check(matches(withText("Transaksi Sukses")))
    }

    @Test
    fun agentDoLinkAjaTransactionFailed() {
        login()
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
        onView(withText("Change Status Failed"))
            .perform(click())
        Thread.sleep(10000)
//        onView(withId(R.id.text_status_detail))
//            .check(matches(withText("Transaksi Gagal")))
    }

    @Test
    fun agentCheckTransaksi() {
        login()
        onView(withId(R.id.navigation_transaction)).perform(click())

        onView(withId(R.id.text_title)).perform(click())
        onView(withId(R.id.agentTransactionFilterDateMonth)).perform(click())
        onView(withText("OKE")).perform(click())
        Thread.sleep(1000)

        onView(withId(R.id.text_title)).perform(click())
        onView(withId(R.id.agentTransactionFilterDateDay)).perform(click())
        onView(withText("OKE")).perform(click())
        Thread.sleep(1000)

    }

    private fun login() {
//        onView(withId(R.id.edittextUsername))
//            .perform(typeText("agent3"), closeSoftKeyboard())
//        onView(withId(R.id.edittextPassword))
//            .perform(typeText("agent3"), closeSoftKeyboard())
//        onView(withId(R.id.buttonLogin))
//            .perform(click())
        intended(hasComponent(AgentHomeActivity::class.java.name))
    }
}
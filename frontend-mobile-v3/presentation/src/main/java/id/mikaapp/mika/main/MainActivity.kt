package id.mikaapp.mika.main

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.home.HomeActivity
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.merchant.home.DashboardHomeActivity
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.CheckLoginSessionCallback
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.CheckResponse
import org.koin.android.ext.android.inject

class MainActivity : AppCompatActivity() {

    val mikaSdk: MikaSdk by inject()

    private val checkLoginSession = object : CheckLoginSessionCallback {
        override fun onSuccess(response: CheckResponse) {
            if(response.data.userType == "agent") {
                navigateToHomeActivity()
            }else if(response.data.userType == "merchantStaff"){
                navigateToDashboardActivity()
            }
        }

        override fun onFailure(errorResponse: BasicResponse) {
            navigateToLoginActivity()
        }

        override fun onError(error: Throwable) {
            navigateToLoginActivity()
        }

    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        mikaSdk.checkLoginSession(checkLoginSession)
    }

    private fun navigateToHomeActivity() {
        val intent = Intent(this, HomeActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun navigateToDashboardActivity(){
        val intent = Intent(this, DashboardHomeActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun navigateToLoginActivity() {
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        finish()
    }
}

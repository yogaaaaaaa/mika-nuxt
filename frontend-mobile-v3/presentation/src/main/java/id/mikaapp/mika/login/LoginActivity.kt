package id.mikaapp.mika.login

import android.app.Dialog
import androidx.lifecycle.Observer
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import com.google.gson.Gson
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.home.HomeActivity
import id.mikaapp.mika.agent.transactiondetail.TransactionDetailActivity
import id.mikaapp.mika.merchant.home.DashboardHomeActivity
import id.mikaapp.mika.utils.CustomDialog
import id.mikaapp.sdk.MikaSdk
import kotlinx.android.synthetic.main.activity_login.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel

class LoginActivity : AppCompatActivity(), View.OnClickListener {

    val sharedPrefsLocalStorage: SharedPrefsLocalStorage by inject()
    val mikaSdk: MikaSdk by inject()
    val viewModel: LoginViewModel by viewModel()
    private lateinit var editTextUsername: EditText
    private lateinit var editTextPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var dialog: Dialog

    companion object {
        const val USER_TYPE_PREF = "user_type_pref"
        const val ACQUIRER_CACHE = "acquirer_cache"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        editTextUsername = username_edit_text
        editTextPassword = password_edit_text
        btnLogin = login_button
        dialog = CustomDialog.progressDialog(this, getString(R.string.loading))
        btnLogin.setOnClickListener(this)

        observeViewState()
    }

    override fun onClick(v: View?) {
        if (v == btnLogin) {
            val username = editTextUsername.text.toString()
            val password = editTextPassword.text.toString()
            viewModel.login(username, password)
        }
    }

    private fun observeViewState() {
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                Toast.makeText(this, throwable.message, Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun handleViewState(state: LoginViewState) {
        if (state.showLoading) {
            showDialog(dialog)
        } else {
            hideDialog(dialog)
        }

        if (state.isUsernameOrPasswordEmpty) {
            Toast.makeText(this, getString(R.string.message_username_password_empty), Toast.LENGTH_SHORT).show()
        }

        state.agentInfo?.let { agentResponse ->
            sharedPrefsLocalStorage.save(USER_TYPE_PREF, "agent")
            sharedPrefsLocalStorage.save(
                TransactionDetailActivity.MERCHANT_KEY,
                agentResponse.data.outlet.merchant.name
            )
            sharedPrefsLocalStorage.save(TransactionDetailActivity.OUTLET_KEY, agentResponse.data.outlet.name)
            agentResponse.data.outlet.streetAddress?.let { address ->
                sharedPrefsLocalStorage.save(TransactionDetailActivity.OUTLET_ADDRESS, address)
            }
            val intent = Intent(this, HomeActivity::class.java)
            startActivity(intent)
            finish()
        }

        state.merchantStaffInfo?.let { merchantStaff ->
            sharedPrefsLocalStorage.save(USER_TYPE_PREF, "merchantStaff")
            sharedPrefsLocalStorage.save(TransactionDetailActivity.MERCHANT_KEY, merchantStaff.data.merchant.name)
            merchantStaff.data.merchant.streetAddress?.let { address ->
                sharedPrefsLocalStorage.save(TransactionDetailActivity.OUTLET_ADDRESS, address)
            }
            val intent = Intent(this, DashboardHomeActivity::class.java)
            startActivity(intent)
            finish()
        }

        state.acquirers?.let { acquirers ->
            val gson = Gson()
            val acquirersJson = gson.toJson(acquirers)

            sharedPrefsLocalStorage.save(ACQUIRER_CACHE, acquirersJson)

            when (sharedPrefsLocalStorage.getStringPref(USER_TYPE_PREF)) {
                "agent" -> {
                    val intent = Intent(this, HomeActivity::class.java)
                    startActivity(intent)
                    finish()
                }
                "merchantStaff" -> {
                    val intent = Intent(this, DashboardHomeActivity::class.java)
                    startActivity(intent)
                    finish()
                }
            }
        }
    }

    private fun showDialog(dialog: Dialog) {
        if (!dialog.isShowing) {
            dialog.show()
        }
    }

    private fun hideDialog(dialog: Dialog) {
        if (dialog.isShowing) {
            dialog.dismiss()
        }
    }

}

package id.mikaapp.mika.agent.account

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.lifecycle.Observer
import id.mikaapp.mika.R
import id.mikaapp.mika.customview.CustomDialog
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.login.LoginActivity
import kotlinx.android.synthetic.main.activity_account.*
import org.koin.android.ext.android.inject
import org.koin.android.viewmodel.ext.android.viewModel

class AccountActivity : AppCompatActivity() {

    private val localPersistentDataSource: LocalPersistentDataSource by inject()
    private val viewModel: AccountViewModel by viewModel()
    private lateinit var textViewUsername: TextView
    private lateinit var textViewOutlet: TextView
    private lateinit var textViewAddress: TextView
    private lateinit var textViewEmail: TextView
    private lateinit var textViewMerchantName: TextView
    private lateinit var dialog: Dialog
    private lateinit var toolbar: Toolbar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_account)

        bindView()

        toolbar.title = ""
        setSupportActionBar(toolbar)
        supportActionBar!!.setDisplayHomeAsUpEnabled(true)
        supportActionBar!!.setDisplayShowHomeEnabled(true)

        if (savedInstanceState == null) {
            when (localPersistentDataSource.userType) {
                "agent" -> {
                    viewModel.getAgentAccount()
                }

                "merchantStaff" -> {
                    viewModel.getStaffAccount()
                }
            }
        }

        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                if (throwable.message == getString(R.string.error_not_authenticated)) {
                    val homeIntent = Intent(this, LoginActivity::class.java)
                    homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(homeIntent)
                    finish()
                }
                Toast.makeText(this, throwable.message, Toast.LENGTH_LONG).show()
            }
        })
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return super.onSupportNavigateUp()
    }

    private fun bindView() {
        toolbar = toolbar_account
        textViewAddress = text_address
        textViewEmail = text_email
        textViewUsername = text_username
        textViewOutlet = text_outlet
        textViewMerchantName = text_merchant_name
        dialog = CustomDialog.progressDialog(this, getString(R.string.loading))
    }

    private fun handleViewState(state: AccountViewState) {
        if (state.showLoading) {
            showDialog(dialog)
        } else {
            Handler().postDelayed({
                hideDialog(dialog)
            }, 500)
        }
        state.agentAccount?.let { agent ->
            textViewMerchantName.text = agent.data.outlet.merchant.name
            textViewAddress.text = agent.data.outlet.streetAddress
            textViewOutlet.text = agent.data.outlet.name
            textViewUsername.text = agent.data.name
            textViewEmail.text = agent.data.outlet.merchant.email
        }
        state.staffAccount?.let { staff ->
            textViewOutlet.visibility = View.GONE
            label_outlet.visibility = View.GONE
            separator_1.visibility = View.GONE
            textViewMerchantName.text = staff.data.merchant.name
            textViewAddress.text = staff.data.streetAddress
            textViewUsername.text = staff.data.name
            textViewEmail.text = staff.data.merchant.email
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

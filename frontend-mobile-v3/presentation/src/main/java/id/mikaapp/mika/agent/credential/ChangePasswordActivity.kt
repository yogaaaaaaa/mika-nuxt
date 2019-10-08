package id.mikaapp.mika.agent.credential

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import id.mikaapp.mika.R
import id.mikaapp.mika.customview.CustomDialog
import id.mikaapp.mika.ext.observe
import id.mikaapp.mika.ext.showToast
import id.mikaapp.mika.login.LoginActivity
import kotlinx.android.synthetic.main.activity_change_password.*
import org.koin.android.viewmodel.ext.android.viewModel

class ChangePasswordActivity : AppCompatActivity() {

    private val viewModel: ChangePasswordViewModel by viewModel()
    private val loadingDialog by lazy {
        CustomDialog.progressDialog(this, "Processing", false)
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_change_password)

        setSupportActionBar(changePasswordToolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)

        observe(viewModel.warningState) { it?.let { showToast(it) } }
        observe(viewModel.changePasswordSuccessState) {
            if (it == true) {
                showToast("Change Password Success, Please login again")
                val homeIntent = Intent(this, LoginActivity::class.java)
                homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                startActivity(homeIntent)
                finish()
            }
        }
        observe(viewModel.loadingState) {
            if (it) loadingDialog.show() else loadingDialog.dismiss()
        }
        changePasswordSubmit.setOnClickListener {
            viewModel.changePassword(
                changePasswordOldPassword.text.toString(),
                changePasswordNewPassword.text.toString(),
                changePasswordConfirmNewPassword.text.toString()
            )
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed();return true
    }
}

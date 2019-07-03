package id.mikaapp.mika.agent.credential

import android.app.Dialog
import androidx.lifecycle.Observer
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import id.mikaapp.mika.R
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.mika.utils.CustomDialog
import kotlinx.android.synthetic.main.activity_change_password.*
import org.koin.android.viewmodel.ext.android.viewModel

class ChangePasswordActivity : AppCompatActivity(), View.OnClickListener {

    private val viewModel: ChangePasswordViewModel by viewModel()
    private lateinit var toolbar: Toolbar
    private lateinit var dialog: Dialog
    private lateinit var editTextOldPassword: EditText
    private lateinit var editTextNewPassword: EditText
    private lateinit var editTextRepeatNewPassword: EditText
    private lateinit var btnChangePassword: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_change_password)
//        viewModel = ViewModelProviders.of(this, factory).get(ChangePasswordViewModel::class.java)

        bindView()

        toolbar.title = ""
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)
        btnChangePassword.setOnClickListener(this)

        observeViewState()
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }

    override fun onClick(v: View?) {
        when (v) {
            btnChangePassword -> {
                val oldPassword = editTextOldPassword.text.toString()
                val newPassword = editTextNewPassword.text.toString()
                val repeatPassword = editTextRepeatNewPassword.text.toString()

                validateInput(oldPassword, newPassword, repeatPassword)
            }
        }
    }

    private fun bindView() {
        toolbar = toolbar_change_password
        dialog = CustomDialog.progressDialog(this, getString(R.string.loading))
        editTextNewPassword = input_new_password
        editTextOldPassword = input_old_password
        editTextRepeatNewPassword = input_repeat_new_password
        btnChangePassword = btn_change_password
    }

    private fun observeViewState() {
        viewModel.viewState.observe(this, Observer {
            if (it != null) handleViewState(it)
        })
        viewModel.errorState.observe(this, Observer { throwable ->
            throwable?.let {
                if(throwable.message == getString(R.string.error_not_authenticated)){
                    val homeIntent = Intent(this, LoginActivity::class.java)
                    homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(homeIntent)
                    finish()
                }
                Toast.makeText(this, throwable.message, Toast.LENGTH_LONG).show()
            }
        })
    }

    private fun handleViewState(state: ChangePasswordViewState) {
        if (state.isLoading) {
            showDialog(dialog)
        } else {
            hideDialog(dialog)
        }

        if (state.changePasswordSuccess) {
            Toast.makeText(this, getString(R.string.message_success_change_password), Toast.LENGTH_LONG).show()
            resetInput()
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

    private fun validateInput(oldPassword: String, newPassword: String, repeatPassword: String) {
        if (oldPassword.isEmpty() || newPassword.isEmpty() || repeatPassword.isEmpty()) {
            Toast.makeText(this, getString(R.string.message_warning_change_password), Toast.LENGTH_SHORT).show()
        } else {
            if (repeatPassword == newPassword) {
                viewModel.changePassword(oldPassword, newPassword)
            } else {
                Toast.makeText(this, R.string.error_password_not_match, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun resetInput() {
        editTextOldPassword.text.clear()
        editTextNewPassword.text.clear()
        editTextRepeatNewPassword.text.clear()
        editTextOldPassword.clearFocus()
        editTextNewPassword.clearFocus()
        editTextRepeatNewPassword.clearFocus()
    }
}

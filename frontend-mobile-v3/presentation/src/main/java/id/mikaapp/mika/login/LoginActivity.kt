package id.mikaapp.mika.login

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import androidx.appcompat.app.AppCompatActivity
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.R
import id.mikaapp.mika.customview.CustomDialog
import id.mikaapp.mika.ext.getDrawableCompat
import id.mikaapp.mika.ext.observe
import id.mikaapp.mika.ext.showToast
import kotlinx.android.synthetic.main.activity_login.*
import org.koin.android.viewmodel.ext.android.viewModel

class LoginActivity : AppCompatActivity() {
    val viewModel: LoginViewModel by viewModel()
    private val waitDialog: Dialog by lazy { CustomDialog.progressDialog(this, getString(R.string.loading)) }

    private val iconNama by lazy { getDrawableCompat(R.drawable.icon_nama) }
    private val iconNamaError by lazy { getDrawableCompat(R.drawable.icon_nama_error) }
    private val iconKunci by lazy { getDrawableCompat(R.drawable.icon_kunci) }
    private val iconKunciError by lazy { getDrawableCompat(R.drawable.icon_kunci_error) }

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        var appVersionText = "version ${BuildConfig.VERSION_NAME}"
        if (BuildConfig.DEBUG) {
            @Suppress("ConstantConditionIf")
            appVersionText += "(" + if (BuildConfig.SANDBOX_MODE) "SBOX" else "STG31" + ")"
        }
        loginAppInfoVersion.text = appVersionText
        loginUsernameEditText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(p0: Editable?) {}
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {}
            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                viewModel.processUsernameInput(p0.toString())
            }
        })
        loginPasswordEditText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(p0: Editable?) {}
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {}
            override fun onTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                viewModel.processPasswordInput(p0.toString())
            }
        })
        loginLogin.setOnClickListener { viewModel.login() }

        observe(viewModel.loadingState) { if (it) waitDialog.show() else waitDialog.dismiss() }
        observe(viewModel.warningState) { showToast(it) }
        observe(viewModel.usernameFieldErrorState) {
            loginUsernameLayout.error = it
            if (it == null) {
                loginUsernameLayout.isErrorEnabled = false
                loginUsernameIcon.setImageDrawable(iconNama)
            } else {
                loginUsernameIcon.setImageDrawable(iconNamaError)
            }
        }
        observe(viewModel.passwordFieldErrorState) {
            loginPasswordLayout.error = it
            if (it == null) {
                loginPasswordLayout.isErrorEnabled = false
                loginPasswordIcon.setImageDrawable(iconKunci)
            } else {
                loginPasswordIcon.setImageDrawable(iconKunciError)
            }
        }
        observe(viewModel.navigateState) { startActivity(Intent(this, it));finish() }
    }
}

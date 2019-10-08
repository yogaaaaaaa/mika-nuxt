package id.mikaapp.mika.agent.agenthome.profile


import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.account.AccountActivity
import id.mikaapp.mika.agent.contact.ContactUsActivity
import id.mikaapp.mika.agent.credential.ChangePasswordActivity
import id.mikaapp.mika.customview.CustomDialog
import id.mikaapp.mika.ext.observe
import id.mikaapp.mika.ext.showToast
import id.mikaapp.mika.login.LoginActivity
import kotlinx.android.synthetic.main.fragment_profile.*
import org.koin.android.viewmodel.ext.android.viewModel

class ProfileFragment : Fragment() {

    val viewModel: ProfileViewModel by viewModel()

    private var loadingDialog: Dialog? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_profile, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        profileAccount.setOnClickListener { startActivity(Intent(requireContext(), AccountActivity::class.java)) }
        profileChangePassword.setOnClickListener {
            startActivity(Intent(requireContext(), ChangePasswordActivity::class.java))
        }
        profileContactUs.setOnClickListener { startActivity(Intent(requireContext(), ContactUsActivity::class.java)) }
        profileLogout.setOnClickListener { viewModel.logout() }
        observe(viewModel.loadingState) {
            if (context == null) return@observe
            if (it) {
                loadingDialog = CustomDialog.progressDialog(context!!, "Mohon Tunggu", false).apply { show() }
            } else {
                loadingDialog?.dismiss()
            }
        }
        observe(viewModel.logoutSuccessState) {
            if (it == null) return@observe
            if (it) {
                val appContext = requireContext().applicationContext
                val homeIntent = Intent(appContext.applicationContext, LoginActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
                appContext.startActivity(homeIntent)
            }
        }
        observe(viewModel.warningState) {
            if (it == null) return@observe
            context?.showToast(it)
        }
    }
}

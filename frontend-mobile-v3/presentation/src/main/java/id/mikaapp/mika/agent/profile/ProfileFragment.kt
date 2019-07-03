package id.mikaapp.mika.agent.profile


import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.fragment.app.Fragment
import androidx.cardview.widget.CardView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.account.AccountActivity
import id.mikaapp.mika.agent.contact.ContactUsActivity
import id.mikaapp.mika.agent.credential.ChangePasswordActivity
import id.mikaapp.mika.agent.key.ScanKeyActivity
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.LogoutCallback
import id.mikaapp.sdk.models.BasicResponse
import kotlinx.android.synthetic.main.fragment_profile.*
import org.koin.android.ext.android.inject
import id.mikaapp.mika.BuildConfig

/**
 * A simple [Fragment] subclass.
 *
 */
class ProfileFragment : Fragment(), View.OnClickListener {

    val mikaSdk : MikaSdk by inject()

    private lateinit var appVersion: TextView
    private lateinit var keySettingCard: CardView
    private lateinit var accountCard: CardView
    private lateinit var passwordCard: CardView
    private lateinit var contactCard: CardView
    private lateinit var logoutCard: CardView

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        @Suppress("ConstantConditionIf")
        if (BuildConfig.DEBUG) {
            textViewEnvironment.visibility = View.VISIBLE
            @Suppress("ConstantConditionIf")
            textViewEnvironment.text = if (BuildConfig.SANDBOX_MODE) "SANDBOX" else "DEVELOPMENT"
        }
        appVersion = text_app_version
        try {
            val pInfo = context!!.packageManager.getPackageInfo(context!!.packageName, PackageManager.GET_ACTIVITIES)
//            val serialNumber = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) Build.getSerial() else Build.SERIAL
            val version = "Versi " + pInfo.versionName
            appVersion.text = version
        } catch (e: PackageManager.NameNotFoundException) {
            e.printStackTrace()
        }

        accountCard = layout_menu_account
        keySettingCard = layout_menu_key
        passwordCard = layout_menu_password
        contactCard = layout_menu_contact_us
        logoutCard = layout_menu_log_out
        accountCard.setOnClickListener(this)
        passwordCard.setOnClickListener(this)
        contactCard.setOnClickListener(this)
        passwordCard.setOnClickListener(this)
        logoutCard.setOnClickListener(this)
        keySettingCard.setOnClickListener(this)
    }

    override fun onClick(v: View?) {
        when (v) {
            logoutCard -> showConfirmation()
            contactCard -> {
                val intent = Intent(activity, ContactUsActivity::class.java)
                activity!!.startActivity(intent)
            }
            accountCard -> {
                val intent = Intent(activity, AccountActivity::class.java)
                activity!!.startActivity(intent)
            }
            passwordCard -> {
                val intent = Intent(activity, ChangePasswordActivity::class.java)
                activity!!.startActivity(intent)
            }
            keySettingCard -> {
                val intent = Intent(activity, ScanKeyActivity::class.java)
                activity!!.startActivity(intent)
            }
        }
    }

    private fun showConfirmation() {
        val builder = androidx.appcompat.app.AlertDialog.Builder(activity!!)
        builder.setTitle("")
        builder.setMessage(getString(R.string.dialog_text))

        val positiveText = getString(R.string.ok)
        builder.setPositiveButton(
            positiveText
        ) { dialog, which ->
            val homeIntent = Intent(activity, LoginActivity::class.java)
            homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            mikaSdk.logout(object : LogoutCallback {
                override fun onSuccess(response: BasicResponse) {

                }

                override fun onFailure(errorResponse: BasicResponse) {

                }

                override fun onError(error: Throwable) {

                }

            })
            activity!!.startActivity(homeIntent)
            activity!!.finish()
        }

        val negativeText = getString(R.string.cancel)
        builder.setNegativeButton(
            negativeText
        ) { dialog, which ->
            // negative button logic
        }

        val dialog = builder.create()
        // display dialog
        dialog.show()
    }
}

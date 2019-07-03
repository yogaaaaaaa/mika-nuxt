package id.mikaapp.mika.merchant.home

import android.content.SharedPreferences
import android.os.Bundle
import android.preference.PreferenceManager
import com.google.android.material.bottomnavigation.BottomNavigationView
import androidx.appcompat.app.AppCompatActivity
import android.view.MenuItem
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.profile.ProfileFragment
import id.mikaapp.mika.merchant.dashboard.DashboardFragment
import id.mikaapp.mika.merchant.outlet.OutletActivity
import id.mikaapp.mika.merchant.transaction.MerchantTransactionFragment
import kotlinx.android.synthetic.main.activity_home_merchant.*

class DashboardHomeActivity : AppCompatActivity(), BottomNavigationView.OnNavigationItemSelectedListener {

    private lateinit var navigationBar: BottomNavigationView
    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var dashboardFragment: DashboardFragment
    private lateinit var profileFragment: ProfileFragment
    private lateinit var merchantTransactionFragment: MerchantTransactionFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_merchant)

        initFragment()

        if (savedInstanceState == null) {
            val fragmentTransaction = supportFragmentManager.beginTransaction()
            fragmentTransaction.replace(R.id.fragment_container, dashboardFragment, "dashboard")
            fragmentTransaction.commit()
        }

        navigationBar = navigation
        navigationBar.setOnNavigationItemSelectedListener(this)

        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this)
        initSelectedOutlet()
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        if (item.itemId == navigationBar.selectedItemId) {
            return false
        }
        val fragmentTransaction = supportFragmentManager.beginTransaction()
        when (item.itemId) {

            R.id.navigation_charge -> {
                fragmentTransaction.replace(R.id.fragment_container, DashboardFragment(), "dashboard")
                fragmentTransaction.commit()
            }

            R.id.navigation_profile -> {
                fragmentTransaction.replace(R.id.fragment_container, ProfileFragment(), "profile")
                fragmentTransaction.commit()
            }

            R.id.navigation_transaction -> {
                fragmentTransaction.replace(R.id.fragment_container, merchantTransactionFragment, "transaction")
                fragmentTransaction.commit()
            }
        }

        return true
    }

    fun showTransactions(year: String, month: String, day: String, acquirerId: String, timeGroup: String) {
        val bundle = Bundle()
        bundle.putString("year", year)
        bundle.putString("month", month)
        bundle.putString("day", day)
        bundle.putString("acquirerId", acquirerId)
        bundle.putString("timeGroup", timeGroup)
        merchantTransactionFragment.arguments = bundle

        if (navigationBar != null) {
            navigationBar.selectedItemId = R.id.navigation_transaction
        }
    }

    private fun initFragment() {
        dashboardFragment = DashboardFragment()
        profileFragment = ProfileFragment()
        merchantTransactionFragment = MerchantTransactionFragment()
    }

    private fun initSelectedOutlet() {
        with(sharedPreferences.edit()) {
            putString(OutletActivity.OUTLET_ID_PREF, "")
            putString(OutletActivity.OUTLET_NAME_PREF, getString(R.string.all_outlet))
            apply()
        }
    }
}

package id.mikaapp.mika.agent.agenthome

import android.os.Bundle
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.google.android.material.bottomnavigation.BottomNavigationView
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenthome.charge.ChargeFragment
import id.mikaapp.mika.agent.agenthome.profile.ProfileFragment
import id.mikaapp.mika.agent.agenthome.transaction.AgentTransactionFragment
import kotlinx.android.synthetic.main.activity_home_agent.*
import org.koin.android.viewmodel.ext.android.viewModel

class AgentHomeActivity : AppCompatActivity(), BottomNavigationView.OnNavigationItemSelectedListener {

    val viewModel: AgentHomeViewModel by viewModel()
    private val chargeFragment = ChargeFragment()
    private val agentTransactionFragment = AgentTransactionFragment()
    private val profileFragment = ProfileFragment()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home_agent)
        viewModel
        agentHomeBottomNavigationView.itemIconTintList = null
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.container, chargeFragment, "charge")
                .commitNow()
        }
        agentHomeBottomNavigationView.setOnNavigationItemSelectedListener(this)
    }

    override fun onNavigationItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            agentHomeBottomNavigationView.selectedItemId -> false
            R.id.navigation_charge -> showFragment(chargeFragment, "charge")
            R.id.navigation_transaction -> showFragment(agentTransactionFragment, "transaction")
            R.id.navigation_profile -> showFragment(profileFragment, "profile")
            else -> false
        }
    }

    private fun showFragment(fragment: Fragment, tag: String): Boolean {
        supportFragmentManager.beginTransaction()
            .replace(R.id.container, fragment, tag)
            .commitNow()
        return true
    }
}
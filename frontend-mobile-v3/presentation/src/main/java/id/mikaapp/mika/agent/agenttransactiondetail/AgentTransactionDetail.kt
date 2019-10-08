package id.mikaapp.mika.agent.agenttransactiondetail

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenttransactiondetail.list.AgentTransactionDetailListAdapter
import id.mikaapp.mika.ext.observe
import id.mikaapp.mika.ext.showToast
import kotlinx.android.synthetic.main.activity_agent_transaction_detail.*
import org.koin.android.viewmodel.ext.android.viewModel
import org.koin.core.parameter.parametersOf

class AgentTransactionDetail : AppCompatActivity() {

    private val viewModel: AgentTransactionDetailViewModel by viewModel {
        parametersOf(intent.getStringExtra(transactionIDKey))
    }
    private val listAdapter = AgentTransactionDetailListAdapter()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_agent_transaction_detail)
        setSupportActionBar(agentTransactionDetailToolbar)
        supportActionBar?.apply { setDisplayHomeAsUpEnabled(true);setDisplayHomeAsUpEnabled(true) }
        agentTransactionDetailRecyclerView.apply {
            adapter = listAdapter;layoutManager = LinearLayoutManager(context, RecyclerView.VERTICAL, false)
        }
        agentTransactionDetailPrint.setOnClickListener { viewModel.printReceipt() }
        agentTransactionDetailSwipeRefresh.setOnRefreshListener { viewModel.loadData() }
        observe(viewModel.warningState) { it?.let { showToast(it) } }
        observe(viewModel.loadingState) { agentTransactionDetailSwipeRefresh.isRefreshing = it }
        observe(viewModel.uiModelState) { listAdapter.update(it) }
    }


    override fun onSupportNavigateUp(): Boolean {
        onBackPressed(); return true
    }

    companion object {
        private const val transactionIDKey = "transaction id"
        fun newIntent(context: Context, transactionID: String): Intent {
            return Intent(context, AgentTransactionDetail::class.java).apply {
                putExtra(transactionIDKey, transactionID)
            }
        }
    }
}

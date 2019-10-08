package id.mikaapp.mika.agent.agenthome.transaction.transactionlist

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenthome.transaction.FilterTimeRange
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerListItemUiModel
import id.mikaapp.mika.agent.agenttransactiondetail.AgentTransactionDetail
import id.mikaapp.mika.ext.observe
import id.mikaapp.mika.ext.showToast
import kotlinx.android.synthetic.main.fragment_agent_transaction_list.*
import org.koin.android.viewmodel.ext.android.viewModel

class AgentTransactionListFragment : Fragment() {
    private var onFilterChangeListener: ((dateString: String?) -> Unit)? = null
    private val viewModel: AgentTransactionListViewModel by viewModel()
    private val listAdapter = AgentTransactionListAdapter()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? = inflater.inflate(R.layout.fragment_agent_transaction_list, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupView()
        observeViewModel()
    }

    private fun setupView() {
        listAdapter.setOnTransactionClick {
            //            val intent = TransactionDetailActivity
//                .newIntent(
//                    context = requireContext(),
//                    print = false,
//                    isCardTransaction = false,
//                    playRingtone = false,
//                    transactionId = it.ID
//                )
//            startActivity(intent)
            startActivity(AgentTransactionDetail.newIntent(requireContext(), it.ID))
        }
        listAdapter.setOnEndReach { viewModel.loadMore() }
        listAdapter.setOnListItemErrorClick { viewModel.loadMore() }
        agentTransactionListRecyclerView.apply {
            adapter = listAdapter;layoutManager =
            LinearLayoutManager(context, RecyclerView.VERTICAL, false)
        }
        agentTransactionListSwipeRefresh.setOnRefreshListener { viewModel.refresh() }
    }

    private fun observeViewModel() {
        observe(viewModel.warningState) { it?.let { requireContext().showToast(it) } }
        observe(viewModel.refreshingState) { agentTransactionListSwipeRefresh.isRefreshing = it }
        observe(viewModel.uiModelState) {
            if (it != null) {
                val data = it.first
                val refresh = it.second
                listAdapter.update(data)
                if (refresh) agentTransactionListRecyclerView.scrollToPosition(0)
                if (it.first.isEmpty()) {
                    agentTransactionListDataNotFoundRoot.visibility = View.VISIBLE
                } else {
                    agentTransactionListDataNotFoundRoot.visibility = View.GONE
                }
            }
        }
        observe(viewModel.filterState) { onFilterChangeListener?.invoke(it?.uiModel()) }
    }

    fun setAcquirerFilter(acquirer: AgentTransactionAcquirerListItemUiModel) =
        viewModel.setAcquirerFilter(acquirer)

    fun setDateFilter(day: Int, month: Int, year: Int, filterTimeRange: FilterTimeRange) =
        viewModel.setDateFilter(day, month, year, filterTimeRange)

    fun clearDateFilter() = viewModel.clearDateFilter()

    fun setOnFilterChange(listener: ((filterString: String?) -> Unit)?) {
        onFilterChangeListener = listener
    }
}

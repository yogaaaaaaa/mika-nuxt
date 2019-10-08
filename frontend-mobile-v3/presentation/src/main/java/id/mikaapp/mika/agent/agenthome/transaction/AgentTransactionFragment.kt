package id.mikaapp.mika.agent.agenthome.transaction


import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerFilter
import id.mikaapp.mika.agent.agenthome.transaction.datefilter.AgentTransactionDateFilter
import id.mikaapp.mika.agent.agenthome.transaction.datefilter.AgentTransactionDateFilterListener
import id.mikaapp.mika.agent.agenthome.transaction.datepicker.AgentTransactionDatePicker
import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.AgentTransactionListFragment
import kotlinx.android.synthetic.main.fragment_transaction_agent.*

class AgentTransactionFragment : Fragment(), AgentTransactionDateFilterListener {
    private val transactionListFragment = AgentTransactionListFragment()
    private val acquirerFilterFragment = AgentTransactionAcquirerFilter()
    private val dateFilterFragment = AgentTransactionDateFilter()
    private val datePicker = AgentTransactionDatePicker()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? =
        layoutInflater.inflate(R.layout.fragment_transaction_agent, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        childFragmentManager.beginTransaction()
            .replace(R.id.agentTransactionListContainer, transactionListFragment)
            .commit()
        transactionListFragment.setOnFilterChange {
            it?.let { agentTransactionFilterInformation.apply { text = it } }
                ?: run { agentTransactionFilterInformation.text = "Semua Jenis Transaksi" }
        }
        dateFilterFragment.setListener(this)
        acquirerFilterFragment.setOnAcquirerSelected { transactionListFragment.setAcquirerFilter(it) }
        agentTransactionFilterAcquirer.setOnClickListener { showAcquirerPicker() }
        agentTransactionFilterDate.setOnClickListener { dateFilterFragment.show(childFragmentManager, "dateFilter") }
    }

    override fun onDayFilterSelected() {
        showDatePicker(FilterTimeRange.Day) { day, month, year ->
            transactionListFragment.setDateFilter(day, month, year, FilterTimeRange.Day)
        }
    }

    override fun onMonthFilterSelected() {
        showDatePicker(FilterTimeRange.Month) { day, month, year ->
            transactionListFragment.setDateFilter(day, month, year, FilterTimeRange.Month)
        }
    }

    override fun onNoFilterSelected() {
        transactionListFragment.clearDateFilter()
    }

    private fun showAcquirerPicker() {
        if (!acquirerFilterFragment.isAdded)
            acquirerFilterFragment.show(childFragmentManager, "AcquirerPicker")
    }

    private fun showDatePicker(filterTimeRange: FilterTimeRange, onPicked: (day: Int, month: Int, year: Int) -> Unit) {
        if (!datePicker.isAdded) {
            datePicker.apply {
                showDay(filterTimeRange == FilterTimeRange.Day)
                setOnDateSelected { day, month, year -> onPicked(day, month, year) }
            }.show(childFragmentManager, "DatePicker")
        }
    }
}

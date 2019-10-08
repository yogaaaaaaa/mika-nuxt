package id.mikaapp.mika.agent.agenthome.transaction.datefilter

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import id.mikaapp.mika.R
import kotlinx.android.synthetic.main.fragment_agent_transaction_date_filter.*

class AgentTransactionDateFilter : BottomSheetDialogFragment() {

    private var listener: AgentTransactionDateFilterListener? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? =
        inflater.inflate(R.layout.fragment_agent_transaction_date_filter, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        agentTransactionDateFilterNoFilter.setOnClickListener { dismiss();listener?.onNoFilterSelected() }
        agentTransactionDateFilterMonth.setOnClickListener { dismiss();listener?.onMonthFilterSelected() }
        agentTransactionDateFilterDay.setOnClickListener { dismiss();listener?.onDayFilterSelected() }
    }

    fun setListener(listener: AgentTransactionDateFilterListener?) {
        this.listener = listener
    }
}

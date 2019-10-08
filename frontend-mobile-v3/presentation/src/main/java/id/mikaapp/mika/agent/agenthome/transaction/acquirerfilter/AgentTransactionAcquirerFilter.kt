package id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter


import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.GridLayoutManager
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import id.mikaapp.mika.R
import id.mikaapp.mika.ext.observe
import kotlinx.android.synthetic.main.fragment_agent_transaction_acquirer_filter.*
import org.koin.android.viewmodel.ext.android.viewModel

class AgentTransactionAcquirerFilter : BottomSheetDialogFragment() {

    private val viewModel: AgentTransactionAcquirerFilterViewModel by viewModel()
    private val listAdapter = AgentTransactionAcquirerListAdapter()
    private var onAcquirerSelectedListener: ((data: AgentTransactionAcquirerListItemUiModel) -> Unit)? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? =
        inflater.inflate(R.layout.fragment_agent_transaction_acquirer_filter, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        agentTransactionAcquirerFilterRecyclerView.apply {
            adapter = listAdapter
            layoutManager = GridLayoutManager(context, 3)
        }
        listAdapter.setOnAcquirerSelected { onAcquirerSelectedListener?.invoke(it);dismiss() }
        agentTransactionAcquirerFilterNoFilter.setOnClickListener {
            onAcquirerSelectedListener?.invoke(AgentTransactionAcquirerListItemUiModel.SemuaMetode); dismiss()
        }
        observe(viewModel.uiModelState) { listAdapter.update(it) }
    }

    fun setOnAcquirerSelected(listener: ((acquirer: AgentTransactionAcquirerListItemUiModel) -> Unit)?) {
        onAcquirerSelectedListener = listener
    }


}

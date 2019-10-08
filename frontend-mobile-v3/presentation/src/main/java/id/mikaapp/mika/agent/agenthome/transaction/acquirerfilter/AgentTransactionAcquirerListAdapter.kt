package id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerListItemUiModel.ViewType
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerListItemUiModel.ViewType.Acquirer
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerListItemUiModel.ViewType.SemuaMetode
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.item.AgentTransactionAcquirerListItem
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.item.AgentTransactionAcquirerListItemAcquirer
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.item.AgentTransactionAcquirerListItemSemuaMetode
import id.mikaapp.mika.ext.replace

/**
 * Created by grahamdesmon on 13/04/19.
 */

class AgentTransactionAcquirerListAdapter : RecyclerView.Adapter<AgentTransactionAcquirerListItem<*, *>>() {
    private var onAcquirerSelectedListener: ((acquirer: AgentTransactionAcquirerListItemUiModel) -> Unit)? =
        null
    private val data = mutableListOf<AgentTransactionAcquirerListItemUiModel>()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AgentTransactionAcquirerListItem<*, *> {
        val inflater = LayoutInflater.from(parent.context)
        return when (ViewType.fromID(viewType)) {
            SemuaMetode ->
                AgentTransactionAcquirerListItemSemuaMetode(
                    inflater.inflate(R.layout.agent_transaction_acquirer_list_item_semua_metode, parent, false)
                )
            Acquirer ->
                AgentTransactionAcquirerListItemAcquirer(
                    inflater.inflate(R.layout.agent_transaction_acquirer_list_item_acquirer, parent, false)
                )
        }
    }

    override fun getItemCount() = data.size
    override fun getItemViewType(position: Int) = data[position].viewTypeID

    override fun onBindViewHolder(holder: AgentTransactionAcquirerListItem<*, *>, position: Int) {
        when (holder) {
            is AgentTransactionAcquirerListItemAcquirer ->
                holder.onBind(data[position] as AgentTransactionAcquirerListItemUiModel.Acquirer) {
                    onAcquirerSelectedListener?.invoke(it)
                }
        }
    }

    fun setOnAcquirerSelected(listener: ((acquirer: AgentTransactionAcquirerListItemUiModel) -> Unit)?) {
        onAcquirerSelectedListener = listener
    }


    fun update(newData: List<AgentTransactionAcquirerListItemUiModel>) {
        data.replace(newData)
        notifyDataSetChanged()
    }
}
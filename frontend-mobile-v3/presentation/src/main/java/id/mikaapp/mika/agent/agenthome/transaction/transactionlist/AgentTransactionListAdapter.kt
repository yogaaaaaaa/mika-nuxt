package id.mikaapp.mika.agent.agenthome.transaction.transactionlist

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.AgentTransactionListItemUiModel.*
import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.item.*
import id.mikaapp.mika.ext.replace

/**
 * Created by grahamdesmon on 13/04/19.
 */

class AgentTransactionListAdapter : RecyclerView.Adapter<AgentTransactionListItem<*, *>>() {

    private val diffCallback = AgentTransactionListDiffCallback()
    private var data = mutableListOf<AgentTransactionListItemUiModel>()
    private var onTransactionClickListener: ((Transaction) -> Unit)? = null
    private var onListItemErrorClickListener: (() -> Unit)? = null
    private var onEndReachListener: (() -> Unit)? = null

    override fun getItemCount() = data.size
    override fun getItemViewType(position: Int) = data[position].viewType

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AgentTransactionListItem<*, *> {
        val layoutInflater = LayoutInflater.from(parent.context)
        return when (ViewType.fromID(viewType)) {
            ViewType.Header -> AgentTransactionListItemHeader(
                layoutInflater
                    .inflate(R.layout.agent_transaction_list_item_header, parent, false)
            )
            ViewType.Transaction -> AgentTransactionListItemTransaction(
                layoutInflater
                    .inflate(R.layout.agent_transaction_list_item_transaction, parent, false)
            )
            ViewType.TransactionCard -> AgentTransactionListItemTransactionCard(
                layoutInflater
                    .inflate(R.layout.agent_transaction_list_item_transaction_card, parent, false)
            )
            ViewType.Loading -> AgentTransactionListItemLoading(
                layoutInflater
                    .inflate(R.layout.agent_transaction_list_item_loading, parent, false)
            )
            ViewType.Error -> AgentTransactionListItemError(
                layoutInflater
                    .inflate(R.layout.agent_transaction_list_item_error, parent, false)
            )
        }
    }

    override fun onViewAttachedToWindow(holder: AgentTransactionListItem<*, *>) {
        if (holder is AgentTransactionListItemLoading) onEndReachListener?.invoke()
    }

    override fun onBindViewHolder(holder: AgentTransactionListItem<*, *>, position: Int) {
        when (holder) {
            is AgentTransactionListItemHeader -> holder.onBind(data[position] as Header) {}
            is AgentTransactionListItemTransaction -> holder.onBind(
                data[position] as Transaction,
                onTransactionClickListener
            )
            is AgentTransactionListItemTransactionCard -> holder.onBind(
                data[position] as TransactionCard,
                onTransactionClickListener
            )
            is AgentTransactionListItemError -> holder.onBind(Unit) { onListItemErrorClickListener?.invoke() }
        }
    }

    fun update(newData: List<AgentTransactionListItemUiModel>) {
        val oldData = data.toList()
        this.data.replace(newData)
        diffCallback.updateAdapter(oldData, newData, this)
    }

    fun setOnTransactionClick(listener: ((Transaction) -> Unit)?) {
        this.onTransactionClickListener = listener
    }

    fun setOnEndReach(listener: (() -> Unit)?) {
        onEndReachListener = listener
    }

    fun setOnListItemErrorClick(listener: (() -> Unit)?) {
        onListItemErrorClickListener = listener
    }
}
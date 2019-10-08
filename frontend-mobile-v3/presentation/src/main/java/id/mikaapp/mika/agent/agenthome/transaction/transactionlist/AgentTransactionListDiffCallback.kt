package id.mikaapp.mika.agent.agenthome.transaction.transactionlist

import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView

class AgentTransactionListDiffCallback : DiffUtil.Callback() {
    private var oldItems: List<AgentTransactionListItemUiModel>? = null
    private var newItems: List<AgentTransactionListItemUiModel>? = null

    override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        if (oldItems == null || newItems == null) return true
        val oldItem = oldItems!![oldItemPosition]
        val newItem = newItems!![newItemPosition]
        if (oldItem.viewType != newItem.viewType) return false
        return when (oldItem) {
            is AgentTransactionListItemUiModel.Header -> {
                val newItemCasted = newItem as AgentTransactionListItemUiModel.Header
                oldItem.date == newItemCasted.date
            }
            is AgentTransactionListItemUiModel.Transaction -> {
                val newItemCasted = newItem as AgentTransactionListItemUiModel.Transaction
                oldItem.ID == newItemCasted.ID
            }
            is AgentTransactionListItemUiModel.TransactionCard -> {
                val newItemCasted = newItem as AgentTransactionListItemUiModel.TransactionCard
                oldItem.header.date == newItemCasted.header.date
            }
            AgentTransactionListItemUiModel.Loading -> true
            AgentTransactionListItemUiModel.Error -> true
        }
    }

    override fun getOldListSize(): Int {
        return oldItems?.size ?: 0
    }

    override fun getNewListSize(): Int {
        return newItems?.size ?: 0
    }

    override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        if (oldItems == null || newItems == null) return true
        val oldItem = oldItems!![oldItemPosition]
        val newItem = newItems!![newItemPosition]
        if (oldItem.viewType != newItem.viewType) return false
        return when (oldItem) {
            is AgentTransactionListItemUiModel.Header -> {
                val newItemCasted = newItem as AgentTransactionListItemUiModel.Header
                oldItem == newItemCasted
            }
            is AgentTransactionListItemUiModel.Transaction -> {
                val newItemCasted = newItem as AgentTransactionListItemUiModel.Transaction
                oldItem == newItemCasted
            }
            is AgentTransactionListItemUiModel.TransactionCard -> {
                val newItemCasted = newItem as AgentTransactionListItemUiModel.TransactionCard
                if (oldItem.header != newItemCasted.header) return false
                if (oldItem.transactions.size != newItemCasted.transactions.size) return false
                for (i in oldItem.transactions.indices) {
                    if (oldItem.transactions[i] != newItem.transactions[i]) return false
                }
                return true
            }
            AgentTransactionListItemUiModel.Loading -> true
            AgentTransactionListItemUiModel.Error -> true
        }
    }

    fun updateAdapter(
        oldData: List<AgentTransactionListItemUiModel>,
        newData: List<AgentTransactionListItemUiModel>,
        adapter: RecyclerView.Adapter<*>
    ) {
        this.oldItems = oldData; this.newItems = newData
        DiffUtil.calculateDiff(this).dispatchUpdatesTo(adapter)
    }
}
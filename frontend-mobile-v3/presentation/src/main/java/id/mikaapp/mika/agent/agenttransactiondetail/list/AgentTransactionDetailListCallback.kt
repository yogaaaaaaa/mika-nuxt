package id.mikaapp.mika.agent.agenttransactiondetail.list

import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel.AgentTransactionDetailListItemUiModel

class AgentTransactionDetailListCallback : DiffUtil.Callback() {
    private var oldItems: List<AgentTransactionDetailListItemUiModel>? = null
    private var newItems: List<AgentTransactionDetailListItemUiModel>? = null

    override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        if (oldItems == null || newItems == null) return true
        val oldItem = oldItems!![oldItemPosition]
        val newItem = newItems!![newItemPosition]
        if (oldItem.viewTypeID != newItem.viewTypeID) return false
        return when (oldItem) {
            is AgentTransactionDetailListItemUiModel.Header -> {
                val newItemCasted = newItem as AgentTransactionDetailListItemUiModel.Header
                oldItem.status == newItemCasted.status
            }
            is AgentTransactionDetailListItemUiModel.Info -> {
                val newItemCasted = newItem as AgentTransactionDetailListItemUiModel.Info
                oldItem.label == newItemCasted.label
            }
            is AgentTransactionDetailListItemUiModel.InfoWithBarcode -> {
                val newItemCasted = newItem as AgentTransactionDetailListItemUiModel.InfoWithBarcode
                oldItem.label == newItemCasted.label
            }
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
        if (oldItem.viewTypeID != newItem.viewTypeID) return false
        return when (oldItem) {
            is AgentTransactionDetailListItemUiModel.Header -> {
                val newItemCasted = newItem as AgentTransactionDetailListItemUiModel.Header
                oldItem == newItemCasted
            }
            is AgentTransactionDetailListItemUiModel.Info -> {
                val newItemCasted = newItem as AgentTransactionDetailListItemUiModel.Info
                oldItem == newItemCasted
            }
            is AgentTransactionDetailListItemUiModel.InfoWithBarcode -> {
                val newItemCasted = newItem as AgentTransactionDetailListItemUiModel.InfoWithBarcode
                oldItem == newItemCasted
            }
        }
    }

    fun updateAdapter(
        oldData: List<AgentTransactionDetailListItemUiModel>,
        newData: List<AgentTransactionDetailListItemUiModel>,
        adapter: RecyclerView.Adapter<*>
    ) {
        this.oldItems = oldData; this.newItems = newData
        DiffUtil.calculateDiff(this).dispatchUpdatesTo(adapter)
    }
}
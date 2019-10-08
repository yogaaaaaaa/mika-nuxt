package id.mikaapp.mika.agent.agenttransactiondetail.list

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel.AgentTransactionDetailListItemUiModel
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel.AgentTransactionDetailListItemUiModel.ViewType.*
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemView.AgentTransactionDetailListItem
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemView.AgentTransactionDetailListItemHeader
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemView.AgentTransactionDetailListItemInfo
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemView.AgentTransactionDetailListItemInfoWithBarcode
import id.mikaapp.mika.ext.replace

class AgentTransactionDetailListAdapter : RecyclerView.Adapter<AgentTransactionDetailListItem<*>>() {

    private val diffCallback = AgentTransactionDetailListCallback()
    private val data = mutableListOf<AgentTransactionDetailListItemUiModel>()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AgentTransactionDetailListItem<*> {
        val layoutInflater = LayoutInflater.from(parent.context)
        return when (AgentTransactionDetailListItemUiModel.ViewType.fromID(viewType)) {
            Header -> AgentTransactionDetailListItemHeader(
                layoutInflater
                    .inflate(R.layout.agent_transaction_detail_list_item_header, parent, false)
            )
            Info -> AgentTransactionDetailListItemInfo(
                layoutInflater
                    .inflate(R.layout.agent_transaction_detail_list_item_info, parent, false)
            )
            InfoWithBarcode -> AgentTransactionDetailListItemInfoWithBarcode(
                layoutInflater
                    .inflate(R.layout.agent_transaction_detail_list_item_info_with_barcode, parent, false)
            )
        }
    }

    override fun getItemViewType(position: Int) = data[position].viewTypeID
    override fun getItemCount() = data.size

    override fun onBindViewHolder(holder: AgentTransactionDetailListItem<*>, position: Int) {
        when (holder) {
            is AgentTransactionDetailListItemHeader -> {
                holder.onBind(data[position] as AgentTransactionDetailListItemUiModel.Header)
            }
            is AgentTransactionDetailListItemInfo -> {
                holder.onBind(data[position] as AgentTransactionDetailListItemUiModel.Info)
            }
            is AgentTransactionDetailListItemInfoWithBarcode -> {
                holder.onBind(data[position] as AgentTransactionDetailListItemUiModel.InfoWithBarcode)
            }
        }
    }

    fun update(newData: List<AgentTransactionDetailListItemUiModel>) {
        val oldData = data.toList()
        this.data.replace(newData)
        diffCallback.updateAdapter(oldData, newData, this)
    }
}
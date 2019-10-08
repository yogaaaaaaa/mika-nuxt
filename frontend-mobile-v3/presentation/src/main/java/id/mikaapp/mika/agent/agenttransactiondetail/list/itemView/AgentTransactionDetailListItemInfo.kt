package id.mikaapp.mika.agent.agenttransactiondetail.list.itemView

import android.view.View
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel.AgentTransactionDetailListItemUiModel
import kotlinx.android.synthetic.main.agent_transaction_detail_list_item_info.view.*

class AgentTransactionDetailListItemInfo(view: View) :
    AgentTransactionDetailListItem<AgentTransactionDetailListItemUiModel.Info>(view) {
    override fun onBind(data: AgentTransactionDetailListItemUiModel.Info) = with(itemView) {
        agentTransactionDetailListItemInfoLabel.text = data.label
        agentTransactionDetailListItemInfoValue.text = data.value
    }
}
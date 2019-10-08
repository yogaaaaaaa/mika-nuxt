package id.mikaapp.mika.agent.agenthome.transaction.transactionlist.item

import android.view.View
import kotlinx.android.synthetic.main.agent_transaction_list_item_error.view.*

class AgentTransactionListItemError(view: View) : AgentTransactionListItem<Unit, Unit>(view) {
    override fun onBind(data: Unit, onClick: ((Unit) -> Unit)?) {
        itemView.agentTransactionListItemErrorButton.setOnClickListener { onClick?.invoke(Unit) }
    }
}
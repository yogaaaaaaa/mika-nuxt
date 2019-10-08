package id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.item

import android.view.View
import kotlinx.android.synthetic.main.agent_transaction_acquirer_list_item_semua_metode.view.*

class AgentTransactionAcquirerListItemSemuaMetode(view: View) : AgentTransactionAcquirerListItem<Unit, Unit>(view) {
    override val root: View get() = itemView.agentTransactionAcquirerListSemuaMetodeRoot
}
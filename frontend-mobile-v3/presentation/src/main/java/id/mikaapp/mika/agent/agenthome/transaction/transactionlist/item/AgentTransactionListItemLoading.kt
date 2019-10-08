package id.mikaapp.mika.agent.agenthome.transaction.transactionlist.item

import android.view.View

class AgentTransactionListItemLoading(view: View) : AgentTransactionListItem<Unit, Unit>(view) {
    override fun onBind(data: Unit, onClick: ((Unit) -> Unit)?) {
        onClick?.invoke(Unit)
    }
}
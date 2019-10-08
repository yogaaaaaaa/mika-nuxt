package id.mikaapp.mika.agent.agenthome.transaction.transactionlist.item

import android.view.View
import androidx.recyclerview.widget.RecyclerView


abstract class AgentTransactionListItem<Receive, Give>(view: View) : RecyclerView.ViewHolder(view) {
    abstract fun onBind(
        data: Receive,
        onClick: ((Give) -> Unit)? = null
    )

    open fun onRecycled() {}
}
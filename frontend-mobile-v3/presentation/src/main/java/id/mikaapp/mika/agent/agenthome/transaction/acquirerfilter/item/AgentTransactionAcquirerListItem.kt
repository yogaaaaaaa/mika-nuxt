package id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.item

import android.view.View
import androidx.recyclerview.widget.RecyclerView

abstract class AgentTransactionAcquirerListItem<Receive, Give>(view: View) : RecyclerView.ViewHolder(view) {
    abstract val root: View
    open fun onBind(data: Receive, onSelected: (Give) -> Unit) {}
}
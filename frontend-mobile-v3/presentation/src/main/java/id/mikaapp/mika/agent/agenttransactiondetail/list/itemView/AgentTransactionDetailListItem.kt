package id.mikaapp.mika.agent.agenttransactiondetail.list.itemView

import android.view.View
import androidx.recyclerview.widget.RecyclerView

abstract class AgentTransactionDetailListItem<Receive>(itemView: View) : RecyclerView.ViewHolder(itemView) {
    abstract fun onBind(data: Receive)
}

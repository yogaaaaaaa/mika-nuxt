package id.mikaapp.mika.agent.agenttransactiondetail.list.itemView

import android.view.View
import androidx.core.content.ContextCompat
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel.AgentTransactionDetailListItemUiModel
import kotlinx.android.synthetic.main.agent_transaction_detail_list_item_header.view.*

class AgentTransactionDetailListItemHeader(view: View) :
    AgentTransactionDetailListItem<AgentTransactionDetailListItemUiModel.Header>(view) {
    companion object {
        private val failedWords = listOf("failed", "expired", "canceled")
    }

    override fun onBind(data: AgentTransactionDetailListItemUiModel.Header) = with(itemView) {
        agentTransactionDetailListItemHeaderIcon.setImageDrawable(
            ContextCompat.getDrawable(
                context,
                if (!failedWords.contains(data.status)) R.drawable.berhasil_notif else R.drawable.gagal_notif
            )
        )
        agentTransactionDetailListItemHeaderStatus.text = data.status
    }
}
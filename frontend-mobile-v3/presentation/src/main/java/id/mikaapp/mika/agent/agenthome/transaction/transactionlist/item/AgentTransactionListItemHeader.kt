package id.mikaapp.mika.agent.agenthome.transaction.transactionlist.item

import android.annotation.SuppressLint
import android.view.View
import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.AgentTransactionListItemUiModel.Header
import id.mikaapp.mika.ext.currencyFormatted
import kotlinx.android.synthetic.main.agent_transaction_list_item_header.view.*

class AgentTransactionListItemHeader(view: View) : AgentTransactionListItem<Header, Unit>(view) {

    @SuppressLint("SetTextI18n")
    override fun onBind(
        data: Header, onClick: ((Unit) -> Unit)?
    ) = with(itemView) {

        agentTransactionItemHeaderDate.text = data.date //DateUtil.getDateWithDay(transaction.createdAt)
        agentTransactionItemHeaderAmount.text = data.amount.currencyFormatted
        agentTransactionItemHeaderEntry.text = "(${data.totalEntry} transaksi)"
    }

}
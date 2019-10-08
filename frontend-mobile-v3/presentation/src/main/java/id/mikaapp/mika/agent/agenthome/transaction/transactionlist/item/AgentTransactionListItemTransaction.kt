package id.mikaapp.mika.agent.agenthome.transaction.transactionlist.item

import android.graphics.Paint
import android.view.View
import androidx.core.content.ContextCompat
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.AgentTransactionListItemUiModel.Transaction
import id.mikaapp.mika.ext.loadImage
import id.mikaapp.sdk.MikaSdk
import kotlinx.android.synthetic.main.agent_transaction_list_item_transaction.view.*

class AgentTransactionListItemTransaction(itemView: View) :
    AgentTransactionListItem<Transaction, Transaction>(itemView) {

    private val prefixUrl = MikaSdk.instance.baseThumbnailURL + "/"

    override fun onBind(
        data: Transaction,
        onClick: ((Transaction) -> Unit)?
    ) = with(itemView) {
        agentTransactionListItemTransactionStatus.text = data.status
        agentTransactionListItemTransactionAmount.text = data.amount
        agentTransactionListItemTransactionHour.text = data.hour

        if (!listOf("failed", "expired", "canceled").contains(data.status)) {
            agentTransactionListItemTransactionStatus.setTextColor(
                ContextCompat.getColor(context, R.color.transactionStatusSuccess)
            )
            agentTransactionListItemTransactionAmount.apply {
                paintFlags = paintFlags and Paint.STRIKE_THRU_TEXT_FLAG.inv()
            }
            context.loadImage("$prefixUrl${data.acquirerImageURL}", agentTransactionListItemTransactionIcon)
        } else {
            agentTransactionListItemTransactionStatus.setTextColor(
                ContextCompat.getColor(context, R.color.transactionStatusFailed)
            )
            agentTransactionListItemTransactionAmount.apply {
                paintFlags = paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
            }
            context.loadImage("$prefixUrl${data.acquirerImageGrayURL}", agentTransactionListItemTransactionIcon)

        }
        setOnClickListener { onClick?.invoke(data) }
    }
}
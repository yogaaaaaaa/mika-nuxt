package id.mikaapp.mika.agent.agenthome.transaction.transactionlist.item

import android.annotation.SuppressLint
import android.graphics.Paint
import android.view.LayoutInflater
import android.view.View
import androidx.core.content.ContextCompat
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.AgentTransactionListItemUiModel.*
import id.mikaapp.mika.ext.currencyFormatted
import id.mikaapp.mika.ext.loadImage
import id.mikaapp.sdk.MikaSdk
import kotlinx.android.synthetic.main.agent_transaction_list_item_header.view.*
import kotlinx.android.synthetic.main.agent_transaction_list_item_transaction.view.*
import kotlinx.android.synthetic.main.agent_transaction_list_item_transaction_card.view.*

class AgentTransactionListItemTransactionCard(itemView: View) :
    AgentTransactionListItem<TransactionCard, Transaction>(itemView) {

    private val prefixUrl = MikaSdk.instance.baseThumbnailURL + "/"

    override fun onBind(data: TransactionCard, onClick: ((Transaction) -> Unit)?) = with(itemView) {
        val root = agentTransactionListItemTransactionCardLinearRoot
        val itemInRoot = root.childCount
        if (itemInRoot >= 1) bindHeader(root.getChildAt(0), data.header)
        else {
            val headerView = LayoutInflater.from(itemView.context).inflate(
                R.layout.agent_transaction_list_item_header,
                itemView.agentTransactionListItemTransactionCardLinearRoot,
                false
            )
            bindHeader(headerView, data.header)
            root.addView(headerView)
        }
        var rootIndex = 0
        data.transactions.forEachIndexed { index, transaction ->
            rootIndex++
            if (rootIndex < itemInRoot) bindTransaction(
                root.getChildAt(rootIndex).apply { visibility = View.VISIBLE },
                transaction,
                onClick
            )
            else {
                val transactionView = LayoutInflater.from(itemView.context).inflate(
                    R.layout.agent_transaction_list_item_transaction,
                    agentTransactionListItemTransactionCardLinearRoot,
                    false
                )
                bindTransaction(transactionView, data.transactions[index], onClick)
                root.addView(transactionView)
            }
        }
        rootIndex++
        if (rootIndex < itemInRoot) {
            for (i in rootIndex until itemInRoot) root.getChildAt(i).visibility = View.GONE
        }
    }

    @SuppressLint("SetTextI18n")
    private fun bindHeader(root: View, data: Header) = with(root) {
        agentTransactionItemHeaderDate.text = data.date //DateUtil.getDateWithDay(transaction.createdAt)
        agentTransactionItemHeaderAmount.text = data.amount.currencyFormatted
        agentTransactionItemHeaderEntry.text = "(${data.totalEntry} transaksi)"
    }

    private fun bindTransaction(root: View, data: Transaction, onClick: ((Transaction) -> Unit)?) = with(root) {
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
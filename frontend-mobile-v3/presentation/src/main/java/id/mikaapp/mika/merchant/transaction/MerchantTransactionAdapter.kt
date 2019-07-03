package id.mikaapp.mika.merchant.transaction

import android.annotation.SuppressLint
import android.graphics.Paint
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.timehop.stickyheadersrecyclerview.StickyRecyclerHeadersAdapter
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.R
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.mika.entities.HeaderTransaction
import id.mikaapp.mika.utils.DateUtil
import id.mikaapp.mika.utils.NumberUtil
import id.mikaapp.sdk.models.MerchantTransaction
import kotlinx.android.synthetic.main.item_transaction.view.*
import kotlinx.android.synthetic.main.item_transaction_header.view.*

class MerchantTransactionAdapter(
    private val imageLoader: ImageLoader,
    private val onTransactionSelected: (MerchantTransaction, View) -> Unit
) : RecyclerView.Adapter<MerchantTransactionAdapter.TransactionViewHolder>(),
    StickyRecyclerHeadersAdapter<MerchantTransactionAdapter.HeaderViewHolder> {

    private var transactionList: MutableList<MerchantTransaction> = mutableListOf()
    private var headerTransactions: MutableList<HeaderTransaction> = mutableListOf()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TransactionViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_transaction, parent, false)
        return TransactionViewHolder(v)
    }

    override fun onBindHeaderViewHolder(holder: HeaderViewHolder?, position: Int) {
        val acquirer = transactionList[position]
        holder?.bind(acquirer)
    }

    override fun onBindViewHolder(holder: TransactionViewHolder, position: Int) {
        val acquirer = transactionList[position]
        holder.bind(acquirer, imageLoader, onTransactionSelected)
    }

    override fun getHeaderId(position: Int): Long {
        val transaction = transactionList[position]
        return DateUtil.getMillisDate(transaction.createdAt)
    }

    override fun onCreateHeaderViewHolder(parent: ViewGroup): HeaderViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_transaction_header, parent, false)
        return HeaderViewHolder(v)
    }

    override fun getItemCount(): Int {
        return transactionList.size
    }

    fun checkPositionHeader(date: String): Int {
        for (i in headerTransactions.indices) {
            if (headerTransactions[i].date == date) {
                return i
            }
        }
        return 0
    }

    fun getTransactionList(): List<MerchantTransaction> {
        return transactionList
    }

    fun addData(transactions: List<MerchantTransaction>, headers: List<HeaderTransaction>) {
        transactionList = transactions.toMutableList()
        headerTransactions = headers.toMutableList()
        notifyDataSetChanged()
    }

    fun clearData() {
        transactionList.clear()
        headerTransactions.clear()
        notifyDataSetChanged()
    }

    inner class TransactionViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

        private val previxUrl = BuildConfig.BASE_URL + "/thumbnails/"
        fun bind(
            transaction: MerchantTransaction,
            imageLoader: ImageLoader,
            listener: (MerchantTransaction, View) -> Unit
        ) = with(itemView) {
            val txtStatus = text_transaction_status
            val txtHour = text_transaction_hour
            val txtAmount = text_transaction_amount

            txtStatus.text = transaction.status
            txtHour.text = DateUtil.getHour(transaction.createdAt)
            txtAmount.text = NumberUtil.formatCurrency(transaction.amount.toDouble())

            if (transaction.status == "success") {
                txtStatus.setTextColor(ContextCompat.getColor(context, R.color.statusSuccess))
                txtAmount.setTextColor(ContextCompat.getColor(context, R.color.statusSuccess))
                txtAmount.paintFlags = txtAmount.paintFlags and Paint.STRIKE_THRU_TEXT_FLAG.inv()
                txtHour.setTextColor(ContextCompat.getColor(context, R.color.statusSuccess))
                transaction.acquirer.acquirerType.thumbnail?.let {
                    imageLoader.load(
                        previxUrl + it,
                        img_transaction
                    )
                }
            } else {
                txtStatus.setTextColor(ContextCompat.getColor(context, R.color.statusFailed))
                txtAmount.setTextColor(ContextCompat.getColor(context, R.color.statusCanceled))
                txtAmount.paintFlags = txtAmount.paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
                txtHour.setTextColor(ContextCompat.getColor(context, R.color.statusCanceled))
                transaction.acquirer.acquirerType.thumbnailGray?.let {
                    imageLoader.load(
                        previxUrl + it,
                        img_transaction
                    )
                }
            }
            setOnClickListener { listener(transaction, itemView) }
        }
    }

    inner class HeaderViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

        @SuppressLint("SetTextI18n")
        fun bind(
            transaction: MerchantTransaction
        ) = with(itemView) {
            val txtHeader = text_transaction_header
            val txtAmount = text_transaction_amount_total
            val txtEntry = text_entry

            txtHeader.text = DateUtil.getDateWithDay(transaction.createdAt)
            txtEntry.text =
                headerTransactions[checkPositionHeader(DateUtil.getDate(transaction.createdAt))].totalEntry.toString()
            val tempEntry = headerTransactions[checkPositionHeader(DateUtil.getDate(transaction.createdAt))].totalEntry
            if (tempEntry >= 1) {
                txtEntry.text = "($tempEntry entri)"
                txtAmount.text = NumberUtil.formatCurrency(
                    java.lang.Double.valueOf(
                        headerTransactions[checkPositionHeader(DateUtil.getDate(transaction.createdAt))].totalAmount
                    )
                )
            } else {
                txtEntry.text = ""
                txtAmount.text = ""
            }
        }

    }

}
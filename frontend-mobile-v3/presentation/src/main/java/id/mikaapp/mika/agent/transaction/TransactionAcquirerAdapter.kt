package id.mikaapp.mika.agent.transaction

import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.R
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.sdk.models.Acquirer
import id.mikaapp.sdk.models.AcquirerType
import kotlinx.android.synthetic.main.item_payment_type.view.*

/**
 * Created by grahamdesmon on 13/04/19.
 */

class TransactionAcquirerAdapter(
    private val imageLoader: ImageLoader,
    private val onPaymentSelected: (Acquirer, View) -> Unit
) : RecyclerView.Adapter<TransactionAcquirerAdapter.TransactionProviderViewHolder>() {
    private val acquirers: MutableList<Acquirer> = mutableListOf()
    var selectedId = ""

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): TransactionProviderViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(
            R.layout.item_payment_type,
            parent,
            false
        )
        return TransactionProviderViewHolder(view)
    }

    override fun getItemCount(): Int {
        return acquirers.size
    }

    override fun onBindViewHolder(holder: TransactionProviderViewHolder, position: Int) {
        val acquirer = acquirers[position]
        holder.bind(acquirer, imageLoader, onPaymentSelected)
    }

    fun setData(data: ArrayList<Acquirer>) {
        if (itemCount == 0) {
            val acquirerType = AcquirerType(
                chartColor = "",
                classX = "",
                description = "",
                id = "",
                name = "Semua Metode",
                thumbnail = "",
                thumbnailGray = ""
            )
            val acquirer = Acquirer(
                description = "",
                gateway = false,
                handler = null,
                hidden = false,
                id = "",
                maximumAmount = 0,
                merchantId = "",
                minimumAmount = 0,
                name = "Semua Metode",
                acquirerConfig = data[0].acquirerConfig,
                acquirerConfigId = "",
                acquirerType = acquirerType,
                acquirerTypeId = ""
            )

            acquirers.add(acquirer)
            for (payProv in data) {
                acquirers.add(payProv)
            }
        }
        notifyDataSetChanged()
    }

    fun clearData() {
        acquirers.clear()
    }

    inner class TransactionProviderViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val previxUrl = BuildConfig.BASE_URL + "/thumbnails/"
        fun bind(
            acquirer: Acquirer,
            imageLoader: ImageLoader,
            listener: (Acquirer, View) -> Unit
        ) = with(itemView) {
            if (selectedId == acquirer.id) {
                container.setBackgroundColor(ContextCompat.getColor(context, R.color.chooserDialogHighlight))
            } else {
                container.setBackgroundColor(ContextCompat.getColor(context, R.color.chooserDialogBg))
            }
            lblPayment.text = acquirer.acquirerType.name
            if (acquirer.acquirerType.id == "") {
                imageLoader.load(R.color.transparent, imgPayment)
            } else {
                acquirer.acquirerType.thumbnail?.let { imageLoader.load(previxUrl + it, imgPayment) }
            }
            setOnClickListener {
                listener(acquirer, itemView)
                selectedId = acquirer.id
                notifyDataSetChanged()
            }
        }

    }
}
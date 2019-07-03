package id.mikaapp.mika.agent.acquirer

import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.R
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.sdk.models.Acquirer
import kotlinx.android.synthetic.main.item_acquirer.view.*

/**
 * Created by grahamdesmon on 11/04/19.
 */

class AcquirerAdapter(
    private val imageLoader: ImageLoader,
    private val onPaymentSelected: (Acquirer, View) -> Unit
) : RecyclerView.Adapter<AcquirerAdapter.AcquirerViewHolder>() {
    private val acquirers: MutableList<Acquirer> = mutableListOf()

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): AcquirerViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(
            R.layout.item_acquirer,
            parent,
            false
        )
        return AcquirerViewHolder(view)
    }

    override fun getItemCount(): Int {
        return acquirers.size
    }

    override fun onBindViewHolder(holder: AcquirerViewHolder, position: Int) {
        val acquirer = acquirers[position]
        holder.bind(acquirer, imageLoader, onPaymentSelected)
    }

    fun setData(data: ArrayList<Acquirer>) {
        acquirers.addAll(data)
        notifyDataSetChanged()
    }

    fun clearData() {
        acquirers.clear()
    }

    class AcquirerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val previxUrl = BuildConfig.BASE_URL + "/thumbnails/"
        fun bind(
            acquirer: Acquirer,
            imageLoader: ImageLoader,
            listener: (Acquirer, View) -> Unit
        ) = with(itemView) {
            text_provider.text = acquirer.acquirerType.name
            acquirer.acquirerType.thumbnail?.let { imageLoader.load(previxUrl + it, image_provider) }
            setOnClickListener { listener(acquirer, itemView) }
        }

    }
}
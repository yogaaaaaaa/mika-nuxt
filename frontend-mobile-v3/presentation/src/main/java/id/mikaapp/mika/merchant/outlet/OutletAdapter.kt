package id.mikaapp.mika.merchant.outlet

import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import id.mikaapp.mika.R
import id.mikaapp.sdk.models.MerchantOutlet
import kotlinx.android.synthetic.main.item_outlet.view.*

class OutletAdapter(var selectedId: String, private val onOutletSelected: (MerchantOutlet, View) -> Unit) :
    RecyclerView.Adapter<OutletAdapter.OutletViewHolder>() {

    private var outlets: MutableList<MerchantOutlet> = mutableListOf()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OutletViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_outlet, parent, false)

        return OutletViewHolder(view)
    }

    override fun getItemCount(): Int {
        return outlets.size
    }

    override fun onBindViewHolder(holder: OutletViewHolder, position: Int) {
        val outlet = outlets[position]
        holder.bind(selectedId, outlet, onOutletSelected)
    }

    fun setData(data: ArrayList<MerchantOutlet>) {
        outlets = data
        notifyDataSetChanged()
    }

    fun clearData() {
        outlets.clear()
    }

    class OutletViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        fun bind(selectedId: String, outlet: MerchantOutlet, listener: (MerchantOutlet, View) -> Unit) = with(itemView) {
            lblOutnetName.text = outlet.name
            rbOutlet.isChecked = outlet.id == selectedId
            setOnClickListener { listener(outlet, itemView) }
        }
    }
}
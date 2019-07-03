package id.mikaapp.mika.agent.contact

import androidx.recyclerview.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import id.mikaapp.mika.R

/**
 * Created by grahamdesmon on 13/04/19.
 */

class ContactUsAdapter : RecyclerView.Adapter<ContactUsAdapter.ContactUsViewHolder>() {

    private val label = arrayOf("Email: mail@foodgasm.id", "Phone: 087883826765")

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ContactUsViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(
            R.layout.item_contact_us,
            parent,
            false
        )
        return ContactUsViewHolder(v)
    }

    override fun onBindViewHolder(holder: ContactUsViewHolder, position: Int) {
        holder.txtTitle.text = label[position]
    }

    override fun getItemCount(): Int {
        return label.size
    }

    inner class ContactUsViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

        internal var txtTitle: TextView = itemView.findViewById(R.id.text_menu_title)

    }
}
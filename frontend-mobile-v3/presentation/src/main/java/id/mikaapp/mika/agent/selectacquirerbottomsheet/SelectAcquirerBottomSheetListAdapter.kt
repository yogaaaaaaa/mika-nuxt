package id.mikaapp.mika.agent.selectacquirerbottomsheet

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetListItemUiModel.ViewType
import id.mikaapp.mika.agent.selectacquirerbottomsheet.item.SelectAcquirerBottomSheetListItem
import id.mikaapp.mika.agent.selectacquirerbottomsheet.item.SelectAcquirerBottomSheetListItemAcquirer
import id.mikaapp.mika.ext.replace
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetListItemUiModel as SelectAcquirerBottomSheetListItemUiModel1

/**
 * Created by grahamdesmon on 11/04/19.
 */

class SelectAcquirerBottomSheetListAdapter :
    RecyclerView.Adapter<SelectAcquirerBottomSheetListItem<*, *>>() {
    private val data = mutableListOf<SelectAcquirerBottomSheetListItemUiModel1>()
    private var onAcquirerSelectedListener: ((acquirer: SelectAcquirerBottomSheetListItemUiModel1.Acquirer) -> Unit)? =
        null

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SelectAcquirerBottomSheetListItem<*, *> {
        val inflater = LayoutInflater.from(parent.context)
        return when (ViewType.fromID(viewType)) {
            ViewType.Acquirer ->
                SelectAcquirerBottomSheetListItemAcquirer(
                    inflater.inflate(R.layout.select_acquirer_bottomsheet_list_item_acquirer, parent, false)
                )
        }
    }


    override fun getItemCount() = data.size
    override fun getItemViewType(position: Int) = data[position].viewTypeID

    override fun onBindViewHolder(holder: SelectAcquirerBottomSheetListItem<*, *>, position: Int) {
        when (holder) {
            is SelectAcquirerBottomSheetListItemAcquirer ->
                holder.onBind(data[position] as SelectAcquirerBottomSheetListItemUiModel1.Acquirer) {
                    onAcquirerSelectedListener?.invoke(it)
                }
        }
    }

    fun setOnAcquirerSelected(listener: ((acquirer: SelectAcquirerBottomSheetListItemUiModel1.Acquirer) -> Unit)?) {
        onAcquirerSelectedListener = listener
    }

    fun update(newData: List<SelectAcquirerBottomSheetListItemUiModel1>) {
        data.replace(newData)
        notifyDataSetChanged()
    }


}
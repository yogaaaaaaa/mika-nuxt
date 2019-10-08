package id.mikaapp.mika.agent.selectacquirerbottomsheet.item

import android.view.View
import androidx.recyclerview.widget.RecyclerView
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetListItemUiModel

abstract class SelectAcquirerBottomSheetListItem<Receive, Give>(view: View) :
    RecyclerView.ViewHolder(view) where Receive : SelectAcquirerBottomSheetListItemUiModel {
    open fun onBind(data: Receive, onSelected: (data: Give) -> Unit) {}
}
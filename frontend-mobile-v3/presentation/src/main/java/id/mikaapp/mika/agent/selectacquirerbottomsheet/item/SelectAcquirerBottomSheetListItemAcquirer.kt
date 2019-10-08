package id.mikaapp.mika.agent.selectacquirerbottomsheet.item

import android.view.View
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetListItemUiModel.Acquirer
import id.mikaapp.mika.ext.loadImage
import id.mikaapp.sdk.MikaSdk
import kotlinx.android.synthetic.main.select_acquirer_bottomsheet_list_item_acquirer.view.*

class SelectAcquirerBottomSheetListItemAcquirer(view: View) :
    SelectAcquirerBottomSheetListItem<Acquirer, Acquirer>(view) {
    private val baseThumbnailURL = MikaSdk.instance.baseThumbnailURL + "/"

    override fun onBind(data: Acquirer, onSelected: (Acquirer) -> Unit) =
        with(itemView) {
            super.onBind(data, onSelected)
            context.loadImage(baseThumbnailURL + data.imageURL, selectAcquirerBottomSheetListItemAcquirerImage)
            selectAcquirerBottomSheetListItemAcquirerName.text = data.name
            setOnClickListener { onSelected(data) }
        }
}
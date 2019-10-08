package id.mikaapp.mika.agent.agenttransactiondetail.list.itemView

import android.view.View
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.journeyapps.barcodescanner.BarcodeEncoder
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel.AgentTransactionDetailListItemUiModel
import id.mikaapp.mika.ext.tryOptional
import kotlinx.android.synthetic.main.agent_transaction_detail_list_item_info_with_barcode.view.*

class AgentTransactionDetailListItemInfoWithBarcode(view: View) :
    AgentTransactionDetailListItem<AgentTransactionDetailListItemUiModel.InfoWithBarcode>(view) {
    override fun onBind(data: AgentTransactionDetailListItemUiModel.InfoWithBarcode) = with(itemView) {
        agentTransactionDetailListItemInfoWithBarcodeLabel.text = data.label
        agentTransactionDetailListItemInfoWithBarcodeValue.text = data.value
        agentTransactionDetailListItemInfoWithBarcodeImage.setImageBitmap(tryOptional {
            BarcodeEncoder().createBitmap(
                MultiFormatWriter().encode(
                    data.barcodeContent,
                    BarcodeFormat.QR_CODE,
                    70,
                    70
                )
            )
        })
    }
}
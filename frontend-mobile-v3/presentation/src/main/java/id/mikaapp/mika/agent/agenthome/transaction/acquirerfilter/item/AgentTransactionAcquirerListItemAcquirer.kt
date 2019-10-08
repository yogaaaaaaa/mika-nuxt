package id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.item

import android.view.View
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerListItemUiModel.Acquirer
import id.mikaapp.mika.ext.loadImage
import id.mikaapp.sdk.MikaSdk
import kotlinx.android.synthetic.main.agent_transaction_acquirer_list_item_acquirer.view.*

class AgentTransactionAcquirerListItemAcquirer(view: View) :
    AgentTransactionAcquirerListItem<Acquirer, Acquirer>(view) {

    private val prefixUrl = MikaSdk.instance.baseThumbnailURL + "/"

    override val root: View get() = itemView.agentTransactionAcquirerListAcquirerRoot

    override fun onBind(data: Acquirer, onSelected: (Acquirer) -> Unit) {
        super.onBind(data, onSelected)
        root.setOnClickListener { onSelected(data) }
        (data as? Acquirer)?.let {
            itemView.context.loadImage(prefixUrl + it.imageURL, itemView.agentTransactionAcquirerListAcquirerImage)
            itemView.agentTransactionAcquirerListAcquirerName.text = it.name
        }
    }
}
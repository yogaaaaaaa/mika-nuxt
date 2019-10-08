package id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel

sealed class AgentTransactionDetailListItemUiModel(val viewTypeID: Int) {
    enum class ViewType {
        Header,
        Info,
        InfoWithBarcode;

        companion object {
            private val values = values()
            fun fromID(id: Int) = values[id]
        }

        val id get() = values.indexOf(this)
    }

    data class Header(val status: String) : AgentTransactionDetailListItemUiModel(ViewType.Header.id)
    data class Info(val label: String, val value: String) : AgentTransactionDetailListItemUiModel(ViewType.Info.id)
    data class InfoWithBarcode(val label: String, val value: String, val barcodeContent: String) :
        AgentTransactionDetailListItemUiModel(ViewType.InfoWithBarcode.id)
}
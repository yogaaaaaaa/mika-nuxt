package id.mikaapp.mika.agent.agenthome.transaction.transactionlist

sealed class AgentTransactionListItemUiModel(val viewType: Int) {
    enum class ViewType {
        Header,
        Transaction,
        TransactionCard,
        Loading,
        Error;

        companion object {
            private val values = values()
            fun fromID(id: Int) = values[id]
        }

        val id get() = values.indexOf(this)
    }

    data class Transaction(
        val ID: String,
        val acquirerImageURL: String,
        val acquirerImageGrayURL: String,
        val status: String,
        val hour: String,
        val amount: String
    ) : AgentTransactionListItemUiModel(ViewType.Transaction.id)

    data class Header(
        val date: String,
        val amount: Int,
        val totalEntry: Int
    ) : AgentTransactionListItemUiModel(ViewType.Header.id)

    data class TransactionCard(val header: Header, val transactions: List<Transaction>) :
        AgentTransactionListItemUiModel(ViewType.TransactionCard.id)

    object Loading : AgentTransactionListItemUiModel(ViewType.Loading.id)
    object Error : AgentTransactionListItemUiModel(ViewType.Error.id)
}
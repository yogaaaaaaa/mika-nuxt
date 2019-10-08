package id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter

sealed class AgentTransactionAcquirerListItemUiModel(
    open val id: String? = null,
    val viewTypeID: Int
) {
    enum class ViewType {
        SemuaMetode,
        Acquirer;

        companion object {
            private val values = values()
            fun fromID(id: Int) = values[id]
        }

        val id get() = values.indexOf(this)
    }

    object SemuaMetode :
        AgentTransactionAcquirerListItemUiModel(viewTypeID = ViewType.SemuaMetode.id)

    data class Acquirer(
        override val id: String,
        val name: String,
        val imageURL: String
    ) : AgentTransactionAcquirerListItemUiModel(id, ViewType.Acquirer.id) {
        override fun equals(other: Any?): Boolean {
            return when (other) {
                is Acquirer -> {
                    this.id == other.id && this.name == other.name && this.imageURL == other.imageURL
                }
                else -> false
            }
        }

        override fun hashCode(): Int {
            return id.hashCode()
        }
    }
}
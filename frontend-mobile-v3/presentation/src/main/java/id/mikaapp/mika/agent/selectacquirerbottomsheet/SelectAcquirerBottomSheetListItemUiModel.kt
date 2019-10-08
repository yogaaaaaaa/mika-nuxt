package id.mikaapp.mika.agent.selectacquirerbottomsheet

import id.mikaapp.sdk.enums.PaymentMethod

sealed class SelectAcquirerBottomSheetListItemUiModel(
    open val id: String,
    val viewTypeID: Int
) {
    enum class ViewType {
        Acquirer;

        companion object {
            private val values = values()
            fun fromID(id: Int) = values[id]
        }

        val id by lazy { values.indexOf(this) }
    }

    data class Acquirer(
        override val id: String,
        val name: String,
        val imageURL: String,
        val minimumAmount: Int,
        val paymentMethod: PaymentMethod
    ) : SelectAcquirerBottomSheetListItemUiModel(id, ViewType.Acquirer.id)
}

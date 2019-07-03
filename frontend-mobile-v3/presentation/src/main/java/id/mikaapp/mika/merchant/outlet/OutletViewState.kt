package id.mikaapp.mika.merchant.outlet

import id.mikaapp.sdk.models.MerchantOutlet

data class OutletViewState(
    val showLoading: Boolean = true,
    val isLoading: Boolean = false,
    val isOutletRetrevied: Boolean = false,
    val outlets: ArrayList<MerchantOutlet>? = null
)
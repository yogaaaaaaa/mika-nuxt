package id.mikaapp.mika.merchant.outlet

import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.common.BaseViewModel
import id.mikaapp.mika.common.SingleLiveEvent
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.MerchantOutletCallback
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.MerchantOutlet

class OutletViewModel(private val mikaSdk: MikaSdk) : BaseViewModel() {

    var viewState: MutableLiveData<OutletViewState> = MutableLiveData()
    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()

    init {
        viewState.value = OutletViewState()
    }

    fun getOutlets(page: String, perPage: String, outletName: String) {
        errorState.value = null
        viewState.value = viewState.value?.copy(
            showLoading = true,
            outlets = null
        )

        performGetOutlets(page, perPage, outletName)
    }

    private fun performGetOutlets(page: String, perPage: String, outletName: String) {
        mikaSdk.getMerchantOutlets(page, perPage, outletName, object : MerchantOutletCallback {
            override fun onSuccess(response: ArrayList<MerchantOutlet>) {
                viewState.value?.let {
                    if (page == "1") {
                        viewState.value?.let {
                            if (response.isNotEmpty() && outletName.isEmpty()) {
                                val merchantOutlet =
                                    MerchantOutlet(id = "", name = "Semua Outlet", merchantId = response[0].merchantId)
                                response.add(0, merchantOutlet)
                            }
                            val newState = viewState.value?.copy(
                                isLoading = false,
                                showLoading = false,
                                outlets = response
                            )
                            viewState.value = newState
                            errorState.value = null
                        }
                    } else {
                        viewState.value?.let {
                            val outlets = viewState.value?.outlets
                            for (transaction in response) {
                                outlets?.add(transaction)
                            }
                            val newState = viewState.value?.copy(
                                isLoading = false,
                                showLoading = false,
                                outlets = outlets
                            )
                            viewState.value = newState
                            errorState.value = null
                        }
                    }
                }
            }

            override fun onFailure(errorResponse: BasicResponse) {
                viewState.value = viewState.value?.copy(showLoading = false)
                errorState.value = Throwable(errorResponse.message)
            }

            override fun onError(error: Throwable) {
                viewState.value = viewState.value?.copy(showLoading = false)
                errorState.value = error
            }

        })
    }
}
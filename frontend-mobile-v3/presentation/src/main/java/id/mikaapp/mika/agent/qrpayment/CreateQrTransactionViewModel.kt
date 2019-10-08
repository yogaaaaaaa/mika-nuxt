package id.mikaapp.mika.agent.qrpayment

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.ext.liveData
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.models.TokenTransaction

class CreateQrTransactionViewModel(
    private val mikaSdk: MikaSdk,
    private val localPersistentDataSource: LocalPersistentDataSource
) : ViewModel() {


    private var currentAcquirerID: String? = null
    private var currentAmount: Int? = null

    private val loading = MutableLiveData<String?>()
    val loadingState = loading.liveData

    private val transactionCreated = MutableLiveData<TokenTransaction>()
    val transactionCreatedState = transactionCreated.liveData

    private val warning = MutableLiveData<String>()
    val warningState = warning.liveData

    fun loadData(acquirerID: String, amount: Int) {
        currentAcquirerID = acquirerID
        currentAmount = amount
        loading.value = "Creating Transaction"
        mikaSdk.createTransaction(
            acquirerID = acquirerID,
            amount = amount,
            locationLat = localPersistentDataSource.latitude,
            locationLong = localPersistentDataSource.longitude,
            callback = BaseMikaCallback(
                complete = { loading.value = null },
                success = { transactionCreated.value = it },
                failure = { warning.value = it.message },
                error = { warning.value = it.localizedMessage }
            )
        )
    }

    private fun refresh() {
        if (currentAcquirerID == null && currentAmount == null) return
        loadData(currentAcquirerID!!, currentAmount!!)
    }

}

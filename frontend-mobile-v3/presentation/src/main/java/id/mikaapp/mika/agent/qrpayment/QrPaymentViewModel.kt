package id.mikaapp.mika.agent.qrpayment

import android.app.Application
import android.app.NotificationManager
import android.content.Context
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MutableLiveData
import id.mikaapp.mika.App
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetListItemUiModel
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.ext.currencyFormatted
import id.mikaapp.mika.ext.liveData
import id.mikaapp.mika.ext.mikaDate
import id.mikaapp.mika.liveevent.LiveEvent
import id.mikaapp.mika.service.PrinterService
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.enums.CardPaymentMethod
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.ChangeTransactionStatusRequest
import id.mikaapp.sdk.models.Transaction
import id.mikaapp.sdk.models.TransactionDetail

/**
 * Created by grahamdesmon on 15/04/19.
 */

class QrPaymentViewModel(
    application: Application,
    private val mikaSdk: MikaSdk,
    private val localPersistentDataSource: LocalPersistentDataSource,
    private val printerService: PrinterService
) : AndroidViewModel(application) {

    private val loading = MutableLiveData<String?>()
    val loadingState = loading.liveData

    private val warning = LiveEvent<String>()
    val warningState = warning.liveData

    private val transaction = MutableLiveData<TransactionDetail>()
    val transactionState = transaction.liveData

    private val merchantName = MutableLiveData<String?>()
    val merchantNameState = merchantName.liveData

    private val transactionSuccess = MutableLiveData<String>()
    val transactionSuccessState = transactionSuccess.liveData

    private val transactionCancelled = MutableLiveData<Boolean>()
    val transactionCancelledState = transactionCancelled.liveData

    private val acquirerChangedQR = LiveEvent<String>()
    val acquirerChangedQRState = acquirerChangedQR.liveData


    private val acquirerChangedCard = LiveEvent<Pair<String, CardPaymentMethod>>()
    val acquirerChangedCardState = acquirerChangedCard.liveData

    private var currentTransactionID: String? = null

    fun receiveTransactionBroadcast(transaction: Transaction) {
        Log.d("TESTTESTTEST", "Status: ${transaction.status}")
        if (currentTransactionID == transaction.id) {
            val notificationManager =
                getApplication<App>().getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.cancel(transaction.id.hashCode())
            if (transaction.status == "success") {
                printerService.printTransactionReceipt(
                    PrinterService.ReceiptData(
                        localPersistentDataSource.outletName ?: "",
                        localPersistentDataSource.outletAddress ?: "",
                        transaction.idAlias,
                        transaction.createdAt.mikaDate,
                        transaction.acquirer.acquirerType.name,
                        transaction.referenceNumber ?: "N/A",
                        transaction.amount.toString()
                    )
                )
                transactionSuccess.apply { value = transaction.id }
            }
        }
    }

    fun loadData(transactionID: String) {
        currentTransactionID = transactionID
        merchantName.value = localPersistentDataSource.merchantName
        loading.value = "Loading Data"
        mikaSdk.getTransactionById(
            transactionID, BaseMikaCallback(
                complete = { loading.value = null },
                success = { transaction.value = it },
                failure = this::handleOnFailure,
                error = this::handleOnError
            )
        )
    }

    fun cancelTransaction() {
        if (currentTransactionID == null) {
            transactionCancelled.value = true; return
        }
        loading.value = "Canceling Transaction"
        mikaSdk.cancelTransaction(
            currentTransactionID!!, BaseMikaCallback(
                complete = { loading.value = null; transactionCancelled.value = true },
                success = { warning.value = "Transaction Cancelled" },
                failure = this::handleOnFailure,
                error = this::handleOnError
            )
        )
    }

    fun changeAcquirer(acquirer: SelectAcquirerBottomSheetListItemUiModel.Acquirer, amount: Int) {
        if (currentTransactionID == null || transaction.value?.acquirerId == acquirer.id) return
        if (amount < acquirer.minimumAmount) {
            handleOnError(Exception("Minimum pembayaran ${acquirer.name} ${acquirer.minimumAmount.currencyFormatted}"))
            return
        }
        Log.d("TESTTESTTEST", "acquirer: $acquirer")
        loading.value = "Canceling transaction"
        mikaSdk.cancelTransaction(
            currentTransactionID!!, BaseMikaCallback(
                complete = {
                    loading.value = null
                    when (acquirer.name.toLowerCase()) {
                        "kartu kredit" -> acquirerChangedCard.value =
                            acquirer.id to CardPaymentMethod.Credit
                        "kartu debit" -> acquirerChangedCard.value =
                            acquirer.id to CardPaymentMethod.Debit
                        else -> acquirerChangedQR.value = acquirer.id
                    }
                },
                success = {},
                failure = this::handleOnFailure,
                error = this::handleOnError
            )
        )
    }

    fun changeTransactionStatus(status: String) {
        if (currentTransactionID == null) return
        loading.value = "Changing transaction status"
        mikaSdk.changeTransactionStatus(
            ChangeTransactionStatusRequest(currentTransactionID!!, status),
            BaseMikaCallback(
                complete = { loading.value = null },
                success = { Log.d("TESTTESTTEST", "Change status: ${it.message}") },
                failure = this::handleOnFailure,
                error = this::handleOnError
            )
        )
    }

    fun updateStatus() {
        if (currentTransactionID == null) return
        loading.value = "Updating Transaction"
        mikaSdk.getTransactionById(
            currentTransactionID!!, BaseMikaCallback(
                complete = { loading.value = null },
                success = { if (it.status == "success") transactionSuccess.value = it.id },
                failure = this::handleOnFailure,
                error = this::handleOnError
            )
        )
    }

    private fun handleOnError(throwable: Throwable) {
        warning.value = throwable.localizedMessage
    }

    private fun handleOnFailure(basicResponse: BasicResponse) {
        warning.value = basicResponse.message
    }
}
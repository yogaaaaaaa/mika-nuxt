package id.mikaapp.mika.agent.agenttransactiondetail

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel.AgentTransactionDetailListItemUiModel
import id.mikaapp.mika.agent.agenttransactiondetail.list.itemModel.AgentTransactionDetailListItemUiModel.*
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.ext.DateFormat.DayNameDayMonthYear
import id.mikaapp.mika.ext.DateFormat.HourMinuteSecond
import id.mikaapp.mika.ext.currencyFormatted
import id.mikaapp.mika.ext.liveData
import id.mikaapp.mika.ext.mikaDate
import id.mikaapp.mika.ext.toString
import id.mikaapp.mika.service.PrinterService
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.models.BasicResponse
import id.mikaapp.sdk.models.TransactionDetail

class AgentTransactionDetailViewModel(
    private val transactionID: String,
    private val mikaSdk: MikaSdk,
    private val localPersistentDataSource: LocalPersistentDataSource,
    private val printerService: PrinterService
) : ViewModel() {

    private val loading = MutableLiveData<Boolean>()
    val loadingState = loading.liveData

    private val warning = MutableLiveData<String?>()
    val warningState = warning.liveData

    private val uiModel = MutableLiveData<List<AgentTransactionDetailListItemUiModel>>()
    val uiModelState = uiModel.liveData

    private var data: TransactionDetail? = null

    init {
        loadData()
    }

    fun loadData() {
        if (warning.value == null) warning.value = null
        if (loading.value == true) return
        loading.value = true

        mikaSdk.getTransactionById(
            transactionID, BaseMikaCallback(
                complete = { loading.value = false },
                success = this::handleSuccess,
                failure = this::handleFailure,
                error = this::handleError
            )
        )
    }

    private fun handleError(throwable: Throwable) {
        warning.value = throwable.message
    }

    private fun handleSuccess(data: TransactionDetail) {
        this.data = data
        val newUiModel = listOf(
            Header(data.status),
            Info("Tanggal: ", data.createdAt.mikaDate.toString(DayNameDayMonthYear)),
            Info("Waktu: ", data.createdAt.mikaDate.toString(HourMinuteSecond)),
            Info("Nama Merchant: ", localPersistentDataSource.merchantName ?: "N/A"),
            Info("Nama Outlet: ", localPersistentDataSource.outletName ?: "N/A"),
            Info("Jumlah: ", data.amount.currencyFormatted),
            Info("Metode Pembayaran: ", data.acquirer.acquirerType.name),
            InfoWithBarcode("Transaksi: ", data.idAlias ?: "N/A", data.idAlias ?: ""),
            Info("Kode Pembayaran: ", data.referenceNumber ?: "N/A")
        )
        uiModel.postValue(newUiModel)
    }

    private fun handleFailure(basicResponse: BasicResponse) {
        warning.value = basicResponse.message
    }

    fun printReceipt() {
        data?.let { data ->
            if (printerService.isAvailable()) {
                printerService.printTransactionReceipt(
                    PrinterService.ReceiptData(
                        localPersistentDataSource.outletName ?: "N/A",
                        localPersistentDataSource.outletAddress ?: "N/A",
                        data.idAlias ?: "",
                        data.createdAt.mikaDate,
                        data.acquirer.acquirerType.name,
                        data.referenceNumber ?: "N/A",
                        data.amount.currencyFormatted
                    )
                )
            } else {
                warning.value = "Printer Service is not Available"
            }
        }
    }
}
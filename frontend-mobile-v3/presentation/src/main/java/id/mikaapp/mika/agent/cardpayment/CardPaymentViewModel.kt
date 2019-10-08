package id.mikaapp.mika.agent.cardpayment

import android.graphics.Bitmap
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Transformations
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.ext.DateFormat
import id.mikaapp.mika.ext.liveData
import id.mikaapp.mika.ext.mikaDate
import id.mikaapp.mika.ext.toString
import id.mikaapp.mika.liveevent.LiveEvent
import id.mikaapp.mika.service.PrinterService
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.enums.CardPaymentMethod
import java.util.*

class CardPaymentViewModel(
    paymentAmount: Int,
    private val acquirerID: String,
    private val cardPaymentMethod: CardPaymentMethod,
    private val mikaSdk: MikaSdk,
    private val localPersistentDataSource: LocalPersistentDataSource,
    private val printerService: PrinterService
) : ViewModel() {

    private val loading = MutableLiveData<String?>()
    val loadingState = loading.liveData

    private val warning = LiveEvent<String>()
    val warningState = warning.liveData

    private val date = MutableLiveData<Date>()
    val dateState: LiveData<String> = Transformations.map(date) { it.toString(DateFormat.DayMonthYear) }

    private val amount = MutableLiveData<Int>().apply { value = paymentAmount }
    val amountState = amount.liveData

    private val merchantName = MutableLiveData<String?>()
    val merchantNameState = merchantName.liveData

    private val cardType = MutableLiveData<String>()
    val cardTypeState = cardType.liveData

    private var signatureBitmap: Bitmap? = null

    fun start() {
        if (date.value == null) {
            date.value = Calendar.getInstance().time
        }
        amount.value = amount.value
        merchantName.value = localPersistentDataSource.merchantName
        val cardTypeString = when (cardPaymentMethod) {
            CardPaymentMethod.Credit -> "Kartu Kredit"
            CardPaymentMethod.Debit -> "Kartu Debit"
        }
        cardType.value = cardTypeString
    }

    fun cardPaymentSuccess(transactionID: String) {
        mikaSdk.getTransactionById(
            transactionID, BaseMikaCallback(
            success = {
                printerService.printTransactionReceipt(
                    PrinterService.ReceiptData(
                        outletName = localPersistentDataSource.outletName ?: "N/A",
                        outletAddress = localPersistentDataSource.outletAddress ?: "N/A",
                        referenceNumber = it.referenceNumber ?: "N/A",
                        idAlias = it.idAlias ?: "N/A",
                        acquirerTypeName = when (cardPaymentMethod) {
                            CardPaymentMethod.Credit -> "Kredit"
                            CardPaymentMethod.Debit -> "Debit"
                        },
                        date = it.createdAt.mikaDate,
                        amount = it.amount.toString(),
                        signatureBitmap = signatureBitmap
                    )
                )
//                startTransactionDetail.value = response.transactionId
            }
        ))
    }

    fun signatureSubmit(signatureBitmap: Bitmap) {
        this.signatureBitmap = signatureBitmap
    }
}
//        cardBottomText.value = "Silakan masukan\n$cardTypeString anda"
//    }

//    private val panMasked = MutableLiveData<String?>()
//    val panMaskedAvailableState: LiveData<Boolean> = Transformations.map(panMasked) { it != null }
//    val cardLogoDrawableState: LiveData<Int?> = Transformations.map(panMasked) { it?.cardLogoDrawableRes }
//
//    private val date = MutableLiveData<Date>()
//    val dateState: LiveData<String> = Transformations.map(date) { it.toString(DateFormat.DayMonthYear) }
//
//    private val merchantName = MutableLiveData<String?>()
//    val merchantNameState = merchantName.liveData
//
//    private val cardType = MutableLiveData<String>()
//    val cardTypeState = cardType.liveData
//
//    private val amount = MutableLiveData<Int>().apply { value = paymentAmount }
//    val amountState = amount.liveData
//
//    private val cardBottomText = MutableLiveData<String>()
//    val cardBottomTextState = cardBottomText.liveData
//
//    private var currentTransactionID: String? = null
//
//    fun start() {
//        panMasked.value = null
//        if (date.value == null) {
//            date.value = Calendar.getInstance().time
//        }
//        amount.value = amount.value
//        merchantName.value = localPersistentDataSource.merchantName
//        val cardTypeString = when (cardPaymentMethod) {
//            CardPaymentMethod.Credit -> "Kartu Kredit"
//            CardPaymentMethod.Debit -> "Kartu Debit"
//        }
//        cardType.value = cardTypeString
//        cardBottomText.value = "Silakan masukan\n$cardTypeString anda"
//    }
//
//    fun cardPanMaskedRetrieved(panMasked: String) {
//        cardBottomText.value = panMasked
//        this.panMasked.value = panMasked
//    }
//
//    fun cardDetached(cardType: CardType) {
//        if (cardType == CardType.IC) {
//            cardBottomText.value = "Silakan masukan\n${cardTypeState.value} anda"
//        }
//        panMasked.value = null
//    }
//
//    fun submitSignature(signature: String) {
//        if (amount.value == null) return
////        mikaSdk.start(
////            toCardType = toCardType.value,
////            amount = amount.value!!,
////            acquirerId = acquirerID,
////            pinBlockData = "",
////            signatureData = signature,
////            locationLat = localPersistentDataSource.latitude,
////            locationLong = localPersistentDataSource.longitude,
////            callback = BaseMikaCallback()
////        )
//    }
//
////    fun loadData(transactionID: String) {
////        currentTransactionID = transactionID
////        merchantName.value = localPersistentDataSource.merchantName
////        loading.value = "Loading Data"
////        mikaSdk.getTransactionById(
////            transactionID, BaseMikaCallback(
////                complete = { loading.value = null },
////                success = { transaction.value = it },
////                failure = this::handleOnFailure,
////                error = this::handleOnError
////            )
////        )
////    }
//
//    private fun handleOnError(throwable: Throwable) {
//        warning.value = throwable.localizedMessage
//    }
//
//    private fun handleOnFailure(basicResponse: BasicResponse) {
//        warning.value = basicResponse.message
//    }
//
//    fun cardPaymentSuccess(response: CardTransaction) {
//        printerService.printTransactionReceipt(
//            PrinterService.ReceiptData(
//                outletName = localPersistentDataSource.outletName ?: "N/A",
//                outletAddress = localPersistentDataSource.outletAddress ?: "N/A",
//                referenceNumber = response.transactionId,
//                idAlias = response.transactionId,
//                acquirerTypeName = when (cardPaymentMethod) {
//                    CardPaymentMethod.Credit -> "Kredit"
//                    CardPaymentMethod.Debit -> "Debit"
//                },
//                date = response.createdAt.mikaDate,
//                amount = response.amount.toString()
//            )
//        )
//    }

//    var viewState: MutableLiveData<CardPaymentViewState> = MutableLiveData()
//    var errorState: SingleLiveEvent<Throwable?> = SingleLiveEvent()
//
//    init {
//        viewState.value = CardPaymentViewState()
//    }
//
//    fun createTransactionCard(
//        acquirerId: String,
//        amount: Int,
//        locationLat: String,
//        locationLong: String,
//        toCardType: String,
//        pinBlockData: String,
//        signatureData: String
//    ) {
//        errorState.value = null
//        viewState.value = viewState.value?.copy(
//            showLoading = true
//        )
//
//        performCreateTransactionCard(
//            acquirerId,
//            amount,
//            locationLat,
//            locationLong,
//            toCardType,
//            pinBlockData,
//            signatureData
//        )
//
//    }
//
//    private fun performCreateTransactionCard(
//        acquirerId: String,
//        amount: Int,
//        locationLat: String,
//        locationLong: String,
//        toCardType: String,
//        pinBlockData: String,
//        signatureData: String
//    ) {
//        mikaSdk.startReadCard(
//            acquirerId,
//            amount,
//            locationLat,
//            locationLong,
//            toCardType,
//            pinBlockData,
//            signatureData,
//            object : MikaCallback<CardTransaction> {
//                override fun onSuccess(response: CardTransaction) {
//                    viewState.value?.let {
//                        val newState = viewState.value?.copy(
//                            showLoading = false,
//                            tokenTransaction = null,
//                            cardTransaction = response
//                        )
//                        viewState.value = newState
//                        errorState.value = null
//                    }
//                }
//
//                override fun onFailure(errorResponse: BasicResponse) {
//                    viewState.value = viewState.value?.copy(showLoading = false)
//                    errorState.value = Throwable(errorResponse.message)
//                }
//
//                override fun onError(error: Throwable) {
//                    viewState.value = viewState.value?.copy(showLoading = false)
//                    errorState.value = error
//                }
//
//            })
//    }
//
//    fun createTransactionWallet(
//        acquirerId: String,
//        amount: Int,
//        locationLat: String,
//        locationLong: String
//    ) {
//        errorState.value = null
//        viewState.value = viewState.value?.copy(
//            showLoading = true
//        )
//        performCreateTransactionWallet(acquirerId, amount, locationLat, locationLong)
//    }
//
//    private fun performCreateTransactionWallet(
//        acquirerId: String,
//        amount: Int,
//        locationLat: String,
//        locationLong: String
//    ) {
//        mikaSdk.startReadCard(
//            acquirerId,
//            amount,
//            locationLat,
//            locationLong,
//            object : MikaCallback<TokenTransaction> {
//                override fun onSuccess(response: TokenTransaction) {
//                    viewState.value?.let {
//                        val newState = viewState.value?.copy(
//                            showLoading = false,
//                            tokenTransaction = response,
//                            cardTransaction = null
//                        )
//                        viewState.value = newState
//                        errorState.value = null
//                    }
//                }
//
//                override fun onFailure(errorResponse: BasicResponse) {
//                    viewState.value = viewState.value?.copy(showLoading = false)
//                    errorState.value = Throwable(errorResponse.message)
//                }
//
//                override fun onError(error: Throwable) {
//                    viewState.value = viewState.value?.copy(showLoading = false)
//                    errorState.value = error
//                }
//
//            })
//    }
//    }
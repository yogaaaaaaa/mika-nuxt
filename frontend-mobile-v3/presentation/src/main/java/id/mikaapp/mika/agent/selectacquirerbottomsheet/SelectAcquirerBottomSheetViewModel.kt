package id.mikaapp.mika.agent.selectacquirerbottomsheet

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.ext.liveData
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.enums.PaymentMethod

/**
 * Created by grahamdesmon on 13/04/19.
 */

class SelectAcquirerBottomSheetViewModel(
    private val mikaSdk: MikaSdk,
    private val localPersistentDataSource: LocalPersistentDataSource
) : ViewModel() {


    private val uiModel = MutableLiveData<List<SelectAcquirerBottomSheetListItemUiModel>>()
    val uiModelState = uiModel.liveData

    init {
        loadData()
    }

    private fun loadData() {
        val localAcquirers = localPersistentDataSource.acquirers
        if (localAcquirers != null)
            uiModel.value = localAcquirers.map { acquirer ->
                SelectAcquirerBottomSheetListItemUiModel.Acquirer(
                    id = acquirer.id, name = acquirer.acquirerType.name,
                    imageURL = acquirer.acquirerType.thumbnail, minimumAmount = acquirer.minimumAmount,
                    paymentMethod = when (acquirer.acquirerType.classX.toLowerCase()) {
                        "emvcredit" -> PaymentMethod.Credit
                        "emvdebit" -> PaymentMethod.Debit
                        else -> PaymentMethod.EWallet
                    }
                )
            }
        else
            mikaSdk.getAcquirers(BaseMikaCallback(
                success = {
                    uiModel.value = it.map { acquirer ->
                        SelectAcquirerBottomSheetListItemUiModel.Acquirer(
                            id = acquirer.id, name = acquirer.acquirerType.name,
                            imageURL = acquirer.acquirerType.thumbnail, minimumAmount = acquirer.minimumAmount,
                            paymentMethod = when (acquirer.acquirerType.classX.toLowerCase()) {
                                "emvcredit" -> PaymentMethod.Credit
                                "emvdebit" -> PaymentMethod.Debit
                                else -> PaymentMethod.EWallet
                            }
                        )
                    }.toMutableList()
                }
            ))
    }
}
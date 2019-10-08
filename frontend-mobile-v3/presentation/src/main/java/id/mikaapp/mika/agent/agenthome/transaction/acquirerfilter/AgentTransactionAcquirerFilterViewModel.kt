package id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerListItemUiModel.Acquirer
import id.mikaapp.mika.ext.liveData
import id.mikaapp.sdk.MikaSdk

class AgentTransactionAcquirerFilterViewModel(private val mikaSdk: MikaSdk) : ViewModel() {

    private val uiModel = MutableLiveData<List<AgentTransactionAcquirerListItemUiModel>>()
    val uiModelState = uiModel.liveData

    init {
        loadData()
    }

    private fun loadData() {
        mikaSdk.getAcquirers(BaseMikaCallback(
            complete = {},
            success = {
                uiModel.value = it.map { acquirer ->
                    Acquirer(
                        id = acquirer.id,
                        name = acquirer.acquirerType.name,
                        imageURL = acquirer.acquirerType.thumbnail
                    )
                }.toMutableList()
            },
            failure = {},
            error = {}
        ))
    }
}
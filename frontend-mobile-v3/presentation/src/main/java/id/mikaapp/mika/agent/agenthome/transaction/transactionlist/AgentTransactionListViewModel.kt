package id.mikaapp.mika.agent.agenthome.transaction.transactionlist

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import id.mikaapp.mika.BaseMikaCallback
import id.mikaapp.mika.agent.agenthome.transaction.AgentTransactionListFilter
import id.mikaapp.mika.agent.agenthome.transaction.FilterTimeRange
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerListItemUiModel
import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.AgentTransactionListItemUiModel.*
import id.mikaapp.mika.ext.*
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.models.Transaction
import java.util.*

class AgentTransactionListViewModel(private val mikaSdk: MikaSdk) : ViewModel() {

    private val loadingMore = MutableLiveData<Boolean>()
    val loadingMoreState = loadingMore.liveData
    private val refreshing = MutableLiveData<Boolean>()
    val refreshingState = refreshing.liveData

    private val warning = MutableLiveData<String?>()
    val warningState = warning.liveData
    private val uiModel = MutableLiveData<Pair<List<AgentTransactionListItemUiModel>, Boolean>?>()
    val uiModelState = uiModel.liveData
    private val filter = MutableLiveData<AgentTransactionListFilter?>()
    val filterState = filter.liveData

    private val pageSize = 30
    private val order = "desc"

    private var page = 1
    private var endReached = false

    init {
        refresh()
    }

    fun refresh() = loadTransactions(false)
    fun loadMore() = loadTransactions(true)

    private fun loadTransactions(loadMore: Boolean) {
        if (loadingMore.value == true || refreshing.value == true) return
        if (endReached && loadMore) return
        if (!loadMore) {
            page = 1; endReached = false
        }
        if (warning.value != null) {
            replaceLastItemOf<Error>(with = Loading)
            warning.postValue(null)
        }
        if (loadMore) loadingMore.value = true else refreshing.value = true
        val callback = BaseMikaCallback<ArrayList<Transaction>>(
            complete = { if (loadMore) loadingMore.value = false else refreshing.value = false },
            success = { page++; processNewTransactions(if (loadMore) uiModel.value?.first else null, it) },
            failure = { handleError(it.message) },
            error = { handleError(it.localizedMessage) }
        )

        if (filter.value?.hasFilter == true)
            mikaSdk.getTransactionsByFilters(
                page.toString(), pageSize.toString(), filter.value?.startDate ?: "",
                filter.value?.endDate ?: "", filter.value?.acquirer?.id ?: "", order, "0", callback
            )
        else mikaSdk.getTransactions(page.toString(), pageSize.toString(), order, "0", callback)
    }

    private fun handleError(message: String) {
        replaceLastItemOf<Loading>(with = Error)
        warning.postValue(message)
    }

    private inline fun <reified T> replaceLastItemOf(with: AgentTransactionListItemUiModel) where T : AgentTransactionListItemUiModel {
        uiModel.value?.let { oldUiModel ->
            oldUiModel.first.lastOrNull()?.let { lastItem ->
                if (lastItem is T) {
                    uiModel.postValue(
                        Pair(
                            oldUiModel.first.toMutableList().apply { remove(lastItem);add(with) },
                            oldUiModel.second
                        )
                    )
                }
            }
        }
    }

    private fun processNewTransactions(
        savedTransactions: List<AgentTransactionListItemUiModel>?,
        newTransactions: List<Transaction>
    ) {
        if (newTransactions.size < pageSize) endReached = true
        val savedTransactionsWithLoadingOrError = savedTransactions ?: listOf()
        val processedTransactions =
            savedTransactionsWithLoadingOrError.filterNot { it is Loading || it is Error }.toMutableList()
        val transactionsGroupedByDate =
            newTransactions.groupBy { it.createdAt.mikaDate.toString(DateFormat.DayNameDayMonthYear) }
        transactionsGroupedByDate.keys.forEachIndexed { index, transactionDate ->
            val transactionsByDate = transactionsGroupedByDate.getValue(transactionDate)
            val totalAmountInDate = transactionsByDate
                .fold(0) { a, b -> a + if (b.status == "success") b.amount else 0 }
            val totalEntryInDate = transactionsByDate.size
            val addNewHeader =
                { processedTransactions.add(Header(transactionDate, totalAmountInDate, totalEntryInDate)) }
            /* Check if new transaction first date is the same date as saved transaction last date
            * #Saved Transactions last date
            * Header        -> 01-Januari-2000-\                          #Merged Transaction
            * Transaction   -> LinkAja blabla  |                          Header        -> 01-Januari-2000
            * Transaction   -> Go-Pay blabla   |                          Transaction   -> LinkAja blabla
            *                                  |-> Same Date! (Merge!) -> Transaction   -> Go-Pay blabla
            * #New Transactions first date     |                          Transaction   -> Wechat Pay blabla
            * Header        -> 01-Januari-2000-/                          Transaction   -> Alipay blabla
            * Transaction   -> Wechat Pay blabla
            * Transaction   -> Alipay blabla
            */
            if (index == 0) {
                val headerReplaced = processedTransactions.replaceLastInstanceOfIf<Header>({ date == transactionDate },
                    { copy(amount = amount + totalAmountInDate, totalEntry = totalEntry + totalEntryInDate) })
                if (!headerReplaced) addNewHeader()
            } else addNewHeader()
            processedTransactions.addAll(transactionsByDate.map { it.toAgentTransactionListItemTransactionUiModel() })
        }
        if (!endReached) processedTransactions.add(Loading)
        uiModel.postValue(Pair(processedTransactions, savedTransactions == null))
    }

    @Suppress("unused")
    private fun processNewTransactionsToCard(
        savedTransactions: List<AgentTransactionListItemUiModel>?,
        newTransactions: List<Transaction>
    ) {

        if (newTransactions.size < pageSize) endReached = true
        val savedTransactionsWithLoadingOrError = savedTransactions ?: listOf()
        val processedTransactions =
            savedTransactionsWithLoadingOrError.filterNot { it is Loading || it is Error }.toMutableList()
        val transactionsGroupedByDate =
            newTransactions.groupBy { it.createdAt.mikaDate.toString(DateFormat.DayNameDayMonthYear) }
        transactionsGroupedByDate.keys.forEachIndexed { index, transactionDate ->
            val transactionsByDate = transactionsGroupedByDate.getValue(transactionDate)
            val totalAmountInDate = transactionsByDate
                .fold(0) { a, b -> a + if (b.status == "success") b.amount else 0 }
            val totalEntryInDate = transactionsByDate.size
            val header = Header(transactionDate, totalAmountInDate, totalEntryInDate)
            // Check if new transaction first date is the same date as saved transaction last date
            if (index == 0) {
                (processedTransactions.lastOrNull() as? TransactionCard)?.let {
                    if (it.header.date == transactionDate) {
                        processedTransactions[processedTransactions.lastIndex] = it.copy(
                            header = it.header.copy(
                                date = it.header.date,
                                amount = it.header.amount + totalAmountInDate,
                                totalEntry = it.header.totalEntry + totalEntryInDate
                            ),
                            transactions = it.transactions.toMutableList()
                                .apply {
                                    addAll(transactionsByDate.map { transaction ->
                                        transaction.toAgentTransactionListItemTransactionUiModel()
                                    })
                                }
                        )
                    }
                } ?: run {
                    processedTransactions.add(
                        TransactionCard(
                            header,
                            transactionsByDate.map { it.toAgentTransactionListItemTransactionUiModel() })
                    )
                }
            } else processedTransactions.add(
                TransactionCard(
                    header,
                    transactionsByDate.map { it.toAgentTransactionListItemTransactionUiModel() })
            )
        }
        if (!endReached) processedTransactions.add(Loading)
        uiModel.postValue(Pair(processedTransactions, savedTransactions == null))
    }

    fun setAcquirerFilter(acquirerFilterItem: AgentTransactionAcquirerListItemUiModel) {
        val newAcquirerFilter = when (acquirerFilterItem) {
            is AgentTransactionAcquirerListItemUiModel.SemuaMetode -> null
            is AgentTransactionAcquirerListItemUiModel.Acquirer -> acquirerFilterItem
        }
        if (filter.value?.acquirer != newAcquirerFilter) {
            filter.value = filter.value?.copy(acquirer = newAcquirerFilter)
                ?: AgentTransactionListFilter(acquirer = newAcquirerFilter)
            refresh()
        }
    }

    fun setDateFilter(day: Int, month: Int, year: Int, filterTimeRange: FilterTimeRange) {
        val date = getDate(day, month, year)
        if (filter.value?.date != date || filter.value?.filterTimeRange != filterTimeRange) {
            filter.value = filter.value?.copy(date = date, filterTimeRange = filterTimeRange)
                ?: AgentTransactionListFilter(date = date, filterTimeRange = filterTimeRange)
            refresh()
        }
    }

    fun clearDateFilter() {
        if (filter.value?.date == null || filter.value?.filterTimeRange == null) return
        filter.value = filter.value?.copy(date = null, filterTimeRange = null)
            ?: AgentTransactionListFilter()
        refresh()
    }
}
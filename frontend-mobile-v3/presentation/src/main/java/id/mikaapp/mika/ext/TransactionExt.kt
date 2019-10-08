package id.mikaapp.mika.ext

import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.AgentTransactionListItemUiModel
import id.mikaapp.mika.ext.DateFormat.HourMinuteSecond
import id.mikaapp.sdk.models.Transaction

fun Transaction.toAgentTransactionListItemTransactionUiModel() =
    AgentTransactionListItemUiModel.Transaction(
        ID = id, acquirerImageURL = acquirer.acquirerType.thumbnail,
        acquirerImageGrayURL = acquirer.acquirerType.thumbnailGray, status = status,
        hour = createdAt.mikaDate.toString(HourMinuteSecond),
        amount = amount.currencyFormatted
    )
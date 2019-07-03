package id.mikaapp.mika.mappers

import id.mikaapp.domain.common.Mapper
import id.mikaapp.sdk.models.MerchantTransactionDetail
import id.mikaapp.sdk.models.TransactionDetail

class DetailTransactionMapper : Mapper<MerchantTransactionDetail, TransactionDetail>() {

    override fun mapFrom(from: MerchantTransactionDetail): TransactionDetail {

        return TransactionDetail(
            agentId = from.agentId,
            aliasThumbnail = from.aliasThumbnail,
            amount = from.amount,
            aliasThumbnailGray = from.aliasThumbnailGray,
            cardAcquirer = from.cardAcquirer,
            cardApprovalCode = from.cardApprovalCode,
            cardIssuer = from.cardIssuer,
            cardNetwork = from.cardNetwork,
            cardPan = from.cardPanMasked,
            cardType = from.cardType,
            createdAt = from.createdAt,
            customerReference = from.customerReference,
            customerReferenceType = from.customerReference,
            extra = from.extra,
            id = from.id,
            idAlias = from.idAlias,
            ipAddress = from.ipAddress,
            locationLat = from.locationLat,
            locationLong = from.locationLong,
            acquirer = from.acquirer,
            acquirerId = from.acquirerId,
            referenceNumber = from.referenceNumber,
            referenceNumberType = from.referenceNumber,
            terminalId = from.terminalId,
            token = from.token,
            tokenType = from.tokenType,
            transactionSettlementStatus = from.settlementStatus,
            updatedAt = from.updatedAt,
            status = from.status,
            userToken = from.userToken,
            userTokenType = from.userTokenType,
            voidReason = from.voidReason,
            partnerId = from.agentId
        )
    }

}
package id.mikaapp.sdk.api

import com.google.gson.Gson
import id.mikaapp.sdk.callbacks.MikaCallback
import id.mikaapp.sdk.datasource.LocalPersistentDataSource
import id.mikaapp.sdk.di.MikaSdkKoinContext
import id.mikaapp.sdk.di.ModuleName
import id.mikaapp.sdk.models.*
import id.mikaapp.sdk.utils.IUtility
import io.sentry.Sentry
import org.koin.core.KoinComponent
import org.koin.core.inject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

internal class MikaApiService(private var api: Api) : KoinComponent {
    override fun getKoin() = MikaSdkKoinContext.koinApp.koin
    private val utility: IUtility by inject(ModuleName.iUtility)
    private val localPersistentDataSource: LocalPersistentDataSource by inject(ModuleName.localPersistentDataSource)

    fun login(loginRequest: LoginRequest, callback: MikaCallback<LoginResponse>) {
        val call = api.login(loginRequest)
        call.enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { loginResponse ->
                        localPersistentDataSource.save {
                            brokerDetail(loginResponse.data.brokerDetailData)
                            sessionToken(loginResponse.data.sessionToken)
                            userType(loginResponse.data.userType)
                            thumbnailBaseURL(loginResponse.data.publicDetails.thumbnailBaseURL)
                        }
                        return@handleOnResponseSuccessful loginResponse
                    }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun checkLoginSession(request: CheckRequest, callback: MikaCallback<CheckResponse>) {
        val call = api.checkLoginSession(request)
        call.enqueue(object : Callback<CheckResponse> {
            override fun onResponse(call: Call<CheckResponse>, response: Response<CheckResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<CheckResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun logout(sessionToken: String, callback: MikaCallback<BasicResponse>) {
        val call = api.logout(sessionToken)
        call.enqueue(object : Callback<BasicResponse> {
            override fun onResponse(call: Call<BasicResponse>, response: Response<BasicResponse>) {
                if (response.isSuccessful)
                    handleOnResponseSuccessful(call, response, callback) { it }
                else
                    handleOnResponseUnsuccessful(call, response, callback)
            }

            override fun onFailure(call: Call<BasicResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getAcquirers(sessionToken: String, callback: MikaCallback<ArrayList<Acquirer>>) {

        val call = if (localPersistentDataSource.userType == "agent")
            api.getAcquirers(sessionToken) else api.getMerchantAcquirers(sessionToken)

        call.enqueue(object : Callback<AcquirersResponse> {
            override fun onResponse(call: Call<AcquirersResponse>, response: Response<AcquirersResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<AcquirersResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getAcquirerByID(sessionToken: String, acquirerID: String, callback: MikaCallback<Acquirer>) {

        val call = if (localPersistentDataSource.userType == "agent")
            api.getAcquirerByID(sessionToken, acquirerID) else api.getMerchantAcquirerByID(sessionToken, acquirerID)

        call.enqueue(object : Callback<AcquirerResponse> {
            override fun onResponse(call: Call<AcquirerResponse>, response: Response<AcquirerResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<AcquirerResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getTransactions(
        sessionToken: String,
        page: String,
        perPage: String,
        order: String,
        get_count: String,
        callback: MikaCallback<ArrayList<Transaction>>
    ) {
        val filterMap = mutableMapOf<String, String>()
        filterMap["page"] = page
        filterMap["per_page"] = perPage
        filterMap["order"] = order
        if (get_count == "1") {
            filterMap["get_count"] = get_count
        }
        filterMap["order_by"] = "createdAt"

        val call: Call<TransactionResponse> = if (page.isEmpty())
            api.getTransactions(sessionToken)
        else
            api.getTransactions(sessionToken, filterMap)

        call.enqueue(object : Callback<TransactionResponse> {
            override fun onResponse(call: Call<TransactionResponse>, response: Response<TransactionResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<TransactionResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getTransactionsByFilters(
        sessionToken: String,
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        get_count: String,
        callback: MikaCallback<ArrayList<Transaction>>
    ) {
        val filterMap = mutableMapOf<String, String>()
        filterMap["page"] = page
        filterMap["per_page"] = perPage
        filterMap["order"] = order
        val createdAt = mutableListOf<String>()
        if (get_count == "1") {
            filterMap["get_count"] = get_count
        }
        filterMap["order_by"] = "createdAt"
        if (startDate.isNotEmpty()) {
            createdAt.add("gte,$startDate")
        }
        if (endDate.isNotEmpty()) {
            createdAt.add("lte,$endDate")
        }
        if (acquirerId.isNotEmpty()) {
            filterMap["f[acquirerId]"] = "eq,$acquirerId"
        }

        val call: Call<TransactionResponse> = api.getTransactionsByFilters(sessionToken, filterMap, createdAt)

        call.enqueue(object : Callback<TransactionResponse> {
            override fun onResponse(call: Call<TransactionResponse>, response: Response<TransactionResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<TransactionResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getTransactionById(
        id: String,
        sessionToken: String,
        callback: MikaCallback<TransactionDetail>
    ) {
        val call = api.getTransactionById(sessionToken, id)
        call.enqueue(object : Callback<TransactionDetailResponse> {
            override fun onResponse(
                call: Call<TransactionDetailResponse>,
                response: Response<TransactionDetailResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<TransactionDetailResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getTransactionByIdAlias(
        idAlias: String,
        sessionToken: String,
        callback: MikaCallback<TransactionDetail>
    ) {
        val call = api.getTransactionByIdAlias(sessionToken, idAlias)
        call.enqueue(object : Callback<TransactionDetailResponse> {
            override fun onResponse(
                call: Call<TransactionDetailResponse>,
                response: Response<TransactionDetailResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<TransactionDetailResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun createTransactionWallet(
        sessionToken: String,
        request: WalletTransactionRequest,
        callback: MikaCallback<TokenTransaction>
    ) {
        val call = api.createTransactionWallet(sessionToken, request)
        call.enqueue(object : Callback<CreateTransactionResponse> {
            override fun onResponse(
                call: Call<CreateTransactionResponse>,
                response: Response<CreateTransactionResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) {
                        val data = it.tokenTransaction
                        if (data.tokenType == "tokenQrCodeContent") {
                            val qrImage = utility.generateQrTransaction(data.token)
                            data.qrImage = qrImage
                        } else if (data.tokenType == "tokenQrCodeUrlImage") {
                            data.isUrl = true
                        }
                        data
                    }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<CreateTransactionResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun createTransactionWallet(
        sessionToken: String,
        request: WalletTransactionRequestWithoutLocation,
        callback: MikaCallback<TokenTransaction>
    ) {
        val call = api.createTransactionWallet(sessionToken, request)
        call.enqueue(object : Callback<CreateTransactionResponse> {
            override fun onResponse(
                call: Call<CreateTransactionResponse>,
                response: Response<CreateTransactionResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) {
                        val data = it.tokenTransaction
                        if (data.tokenType == "tokenQrCodeContent") {
                            val qrImage = utility.generateQrTransaction(data.token)
                            data.qrImage = qrImage
                        } else if (data.tokenType == "tokenQrCodeUrlImage") {
                            data.isUrl = true
                        }
                        data
                    }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<CreateTransactionResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun createTransactionCard(
        sessionToken: String,
        request: CardTransactionRequest,
        callback: MikaCallback<CardTransaction>
    ) {
        val call = api.createTransactionCard(sessionToken, request)
        call.enqueue(object : Callback<CardTransactionResponse> {
            override fun onResponse(
                call: Call<CardTransactionResponse>,
                response: Response<CardTransactionResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<CardTransactionResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun createTransactionCardWithoutLocation(
        sessionToken: String,
        request: CardTransactionRequestWithoutLocation,
        callback: MikaCallback<CardTransaction>
    ) {
        val call = api.createTransactionCardWithoutLocation(sessionToken, request)
        call.enqueue(object : Callback<CardTransactionResponse> {
            override fun onResponse(
                call: Call<CardTransactionResponse>,
                response: Response<CardTransactionResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<CardTransactionResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getAgentInfo(sessionToken: String, callback: MikaCallback<AgentResponse>) {
        val call = api.getAgentInfo(sessionToken)
        call.enqueue(object : Callback<AgentResponse> {
            override fun onResponse(call: Call<AgentResponse>, response: Response<AgentResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<AgentResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun changePassword(
        sessionToken: String,
        request: ChangePasswordRequest,
        callback: MikaCallback<BasicResponse>
    ) {
        val call = api.changePassword(sessionToken, request)
        call.enqueue(object : Callback<BasicResponse> {
            override fun onResponse(call: Call<BasicResponse>, response: Response<BasicResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<BasicResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getMerchantTransactions(
        sessionToken: String,
        page: String,
        perPage: String,
        startDate: String,
        endDate: String,
        acquirerId: String,
        order: String,
        get_count: String,
        outletId: String,
        callback: MikaCallback<ArrayList<MerchantTransaction>>
    ) {
        val filterMap = mutableMapOf<String, String>()
        val createdAt = mutableListOf<String>()
        filterMap["page"] = page
        filterMap["per_page"] = perPage
        filterMap["order"] = order
        if (get_count == "1") {
            filterMap["get_count"] = get_count
        }
        filterMap["order_by"] = "createdAt"
        if (startDate.isNotEmpty()) {
            createdAt.add("gte,$startDate")
        }
        if (endDate.isNotEmpty()) {
            createdAt.add("lte,$endDate")
        }
        if (acquirerId.isNotEmpty()) {
            filterMap["f[acquirerId]"] = "eq,$acquirerId"
        }
        if (outletId.isNotEmpty()) {
            filterMap["f[agent.outletId]"] = "eq,$outletId"
        }

        val call: Call<MerchantTransactionResponse> =
            api.getMerchantTransactions(sessionToken, filterMap, createdAt)

        call.enqueue(object : Callback<MerchantTransactionResponse> {
            override fun onResponse(
                call: Call<MerchantTransactionResponse>,
                response: Response<MerchantTransactionResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<MerchantTransactionResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getMerchantTransactionById(
        id: String,
        sessionToken: String,
        callback: MikaCallback<MerchantTransactionDetail>
    ) {
        val call = api.getMerchantTransactionById(sessionToken, id)
        call.enqueue(object : Callback<MerchantTransactionDetailRespone> {
            override fun onResponse(
                call: Call<MerchantTransactionDetailRespone>,
                response: Response<MerchantTransactionDetailRespone>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<MerchantTransactionDetailRespone>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getMerchantStaffInfo(sessionToken: String, callback: MikaCallback<MerchantStaffResponse>) {
        val call = api.getMerchantStaffInfo(sessionToken)
        call.enqueue(object : Callback<MerchantStaffResponse> {
            override fun onResponse(call: Call<MerchantStaffResponse>, response: Response<MerchantStaffResponse>) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<MerchantStaffResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getMerchantStatisticByAcquirer(
        sessionToken: String,
        startDate: String,
        endDate: String,
        outletId: String,
        callback: MikaCallback<ArrayList<MerchantTransactionStatistic>>
    ) {
        val filterMap = mutableMapOf<String, String>()
        val createdAt = mutableListOf<String>()
        if (startDate.isNotEmpty()) {
            createdAt.add("gte,$startDate")
        }
        if (endDate.isNotEmpty()) {
            createdAt.add("lte,$endDate")
        }
        if (outletId.isNotEmpty()) {
            filterMap["f[agent.outletId]"] = "eq,$outletId"
        }

        val call: Call<MerchantStatAcquirerResponse> =
            api.getTransactionStatisticByAcquirer(sessionToken, filterMap, createdAt)

        call.enqueue(object : Callback<MerchantStatAcquirerResponse> {
            override fun onResponse(
                call: Call<MerchantStatAcquirerResponse>,
                response: Response<MerchantStatAcquirerResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<MerchantStatAcquirerResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getMerchantStatisticByTimeCount(
        sessionToken: String,
        startDate: String,
        endDate: String,
        group: String,
        groupTime: String,
        utcOffset: String,
        outletId: String,
        callback: MikaCallback<ArrayList<MerchantStatisticCount>>
    ) {

        val filterMap = mutableMapOf<String, String>()
        val createdAt = mutableListOf<String>()

        if (startDate.isNotEmpty()) {
            createdAt.add("gte,$startDate")
        }
        if (endDate.isNotEmpty()) {
            createdAt.add("lte,$endDate")
        }
        filterMap["group"] = group
        filterMap["group_time"] = groupTime
        filterMap["utc_offset"] = utcOffset
        if (outletId.isNotEmpty()) {
            filterMap["f[agent.outletId]"] = "eq,$outletId"
        }

        val call: Call<MerchantStatisticResponse> =
            api.getTransactionStatisticByTimeGroup(sessionToken, filterMap, createdAt)

        call.enqueue(object : Callback<MerchantStatisticResponse> {
            override fun onResponse(
                call: Call<MerchantStatisticResponse>,
                response: Response<MerchantStatisticResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<MerchantStatisticResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun getMerchantOutlets(
        sessionToken: String,
        page: String,
        perPage: String,
        outletName: String,
        callback: MikaCallback<ArrayList<MerchantOutlet>>
    ) {
        val filterMap = mutableMapOf<String, String>()
        filterMap["page"] = page
        filterMap["per_page"] = perPage
        if (outletName.isNotEmpty()) {
            filterMap["f[name]"] = "like,%$outletName%"
        }

        val call: Call<MerchantOutletResponse> = api.getMerchantOutlets(sessionToken, filterMap)

        call.enqueue(object : Callback<MerchantOutletResponse> {
            override fun onResponse(
                call: Call<MerchantOutletResponse>,
                response: Response<MerchantOutletResponse>
            ) {
                if (response.isSuccessful) {
                    handleOnResponseSuccessful(call, response, callback) { it.data }
                } else {
                    handleOnResponseUnsuccessful(call, response, callback)
                }
            }

            override fun onFailure(call: Call<MerchantOutletResponse>, t: Throwable) {
                handleOnFailure(call, t, callback)
            }
        })
    }

    fun changeTransactionStatus(
        sessionToken: String,
        request: ChangeTransactionStatusRequest,
        callback: MikaCallback<BasicResponse>
    ) {
        api.changeTransactionStatus(sessionToken, request)
            .enqueue(object : Callback<BasicResponse> {
                override fun onResponse(call: Call<BasicResponse>, response: Response<BasicResponse>) {
                    if (response.isSuccessful) {
                        handleOnResponseSuccessful(call, response, callback) { it }
                    } else {
                        handleOnResponseUnsuccessful(call, response, callback)
                    }
                }

                override fun onFailure(call: Call<BasicResponse>, t: Throwable) {
                    handleOnFailure(call, t, callback)
                }

            })
    }

    fun refundTransaction(
        sessionToken: String,
        transactionID: String,
        request: RefundTransactionRequest,
        callback: MikaCallback<BasicResponse>
    ) {
        api.refundTransaction(sessionToken, transactionID, request)
            .enqueue(object : Callback<BasicResponse> {
                override fun onResponse(call: Call<BasicResponse>, response: Response<BasicResponse>) {
                    if (response.isSuccessful) {
                        handleOnResponseSuccessful(call, response, callback) { it }
                    } else {
                        handleOnResponseUnsuccessful(call, response, callback)
                    }
                }

                override fun onFailure(call: Call<BasicResponse>, t: Throwable) {
                    handleOnFailure(call, t, callback)
                }

            })
    }

    fun cancelTransaction(sessionToken: String, transactionID: String, callback: MikaCallback<BasicResponse>) {
        api.cancelTransaction(sessionToken, transactionID)
            .enqueue(object : Callback<BasicResponse> {
                override fun onResponse(call: Call<BasicResponse>, response: Response<BasicResponse>) {
                    if (response.isSuccessful) {
                        handleOnResponseSuccessful(call, response, callback) { it }
                    } else {
                        handleOnResponseUnsuccessful(call, response, callback)
                    }
                }

                override fun onFailure(call: Call<BasicResponse>, t: Throwable) {
                    handleOnFailure(call, t, callback)
                }

            })
    }

    fun <Receive, Give> handleOnResponseSuccessful(
        call: Call<Receive>,
        response: Response<Receive>,
        callback: MikaCallback<Give>,
        onResponseAvailable: ((Receive) -> Give?)
    ) {
        response.body()?.let { body ->
            onResponseAvailable(body)?.let {
                callback.onSuccess(it)
            }

        } ?: run {
            val ex = KotlinNullPointerException("Null Response Body")
            callback.onError(ex)
            val e = Throwable(
                message = "${call.request().method()} request to ${call.request().url()} got null response body",
                cause = ex
            )
            Sentry.capture(e)
        }
    }

    fun <Receive, Give> handleOnResponseUnsuccessful(
        call: Call<Receive>,
        response: Response<Receive>,
        callback: MikaCallback<Give>
    ) {
        response.errorBody()?.let { errorBody ->
            try {
                Gson().fromJson(errorBody.string(), BasicResponse::class.java)?.let {
                    callback.onFailure(it)
                } ?: run {
                    callback.onError(KotlinNullPointerException("[${response.code()}] Null Response Body"))
                }
            } catch (t: Throwable) {
                callback.onError(t)
                val e = Throwable(
                    message = "${call.request().method()} request to ${call.request().url()} got Malformed Json response",
                    cause = t
                )
                Sentry.capture(e)
            }
        } ?: run {
            val e = KotlinNullPointerException(
                message = "${call.request().method()} request to ${call.request().url()} got null errorBody response"
            )
            callback.onError(KotlinNullPointerException("[${response.code()}] Null Response Body"))
            Sentry.capture(e)
        }
    }

    fun <Receive, Give> handleOnFailure(
        call: Call<Receive>,
        throwable: Throwable,
        callback: MikaCallback<Give>
    ) {
        callback.onError(throwable)
        val e = Throwable(
            message = "${call.request().method()} request to ${call.request().url()} failed",
            cause = throwable
        )
        Sentry.capture(e)
    }
}
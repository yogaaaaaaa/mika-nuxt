package id.mikaapp.sdk.api

import com.google.gson.Gson
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.callbacks.*
import id.mikaapp.sdk.models.*
import id.mikaapp.sdk.utils.Constant.Companion.MQTT_BROKER_PREF
import id.mikaapp.sdk.utils.Constant.Companion.SESSION_TOKEN_PREF
import id.mikaapp.sdk.utils.Constant.Companion.USER_TYPE_PREF
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

internal class MikaApiService(private var api: Api) : BaseService() {

    fun login(loginRequest: LoginRequest, callback: LoginCallback) {
        val call = api.login(loginRequest)
        call.enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        val brokerDetail = responseBody.data.brokerDetailData
                        val broker = Gson().toJson(brokerDetail)
                        MikaSdk.utility.saveObjectsToSharedPref(
                            SESSION_TOKEN_PREF, responseBody.data.sessionToken!!,
                            MikaSdk.sharedPreferences
                        )
                        MikaSdk.utility.saveObjectsToSharedPref(
                            USER_TYPE_PREF, responseBody.data.userType!!,
                            MikaSdk.sharedPreferences
                        )
                        MikaSdk.utility.saveObjectsToSharedPref(MQTT_BROKER_PREF, broker, MikaSdk.sharedPreferences)

                        callback.onSuccess(responseBody)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun checkLoginSession(request: CheckRequest, callback: CheckLoginSessionCallback) {
        val call = api.checkLoginSession(request)
        call.enqueue(object : Callback<CheckResponse> {
            override fun onResponse(call: Call<CheckResponse>, response: Response<CheckResponse>) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<CheckResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun logout(sessionToken: String, callback: LogoutCallback) {
        val call = api.logout(sessionToken)
        call.enqueue(object : Callback<BasicResponse> {
            override fun onResponse(call: Call<BasicResponse>, response: Response<BasicResponse>) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<BasicResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getAcquirers(sessionToken: String, callback: AcquirerCallback) {

        val call =
            if (MikaSdk.utility.retrieveObjectFromSharedPref(USER_TYPE_PREF, MikaSdk.sharedPreferences) == "agent") {
                api.getAcquirers(sessionToken)
            } else {
                api.getMerchantAcquirers(sessionToken)
            }

        call.enqueue(object : Callback<AcquirerResponse> {
            override fun onResponse(call: Call<AcquirerResponse>, response: Response<AcquirerResponse>) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<AcquirerResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getTransactions(
        sessionToken: String,
        page: String,
        perPage: String,
        order: String,
        get_count: String,
        callback: TransactionCallback
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
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<TransactionResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
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
        callback: TransactionCallback
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
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<TransactionResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getTransactionById(id: String, sessionToken: String, callback: TransactionDetailCallback) {
        val call = api.getTransactionById(sessionToken, id)
        call.enqueue(object : Callback<TransactionDetailResponse> {
            override fun onResponse(
                call: Call<TransactionDetailResponse>,
                response: Response<TransactionDetailResponse>
            ) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<TransactionDetailResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getTransactionByIdAlias(idAlias: String, sessionToken: String, callback: TransactionDetailCallback) {
        val call = api.getTransactionByIdAlias(sessionToken, idAlias)
        call.enqueue(object : Callback<TransactionDetailResponse> {
            override fun onResponse(
                call: Call<TransactionDetailResponse>,
                response: Response<TransactionDetailResponse>
            ) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<TransactionDetailResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun createTransactionWallet(
        sessionToken: String,
        request: WalletTransactionRequest,
        callback: CreateTransactionCallback
    ) {
        val call = api.createTransactionWallet(sessionToken, request)
        call.enqueue(object : Callback<CreateTransactionResponse> {
            override fun onResponse(
                call: Call<CreateTransactionResponse>,
                response: Response<CreateTransactionResponse>
            ) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        val data = responseBody.tokenTransaction
                        if (data.tokenType == "tokenQrCodeContent") {
                            data.token?.let {
                                val qrImage = MikaSdk.utility.generateQrTransaction(it)
                                data.qrImage = qrImage
                            }
                            callback.onSuccess(data)
                        } else if (data.tokenType == "tokenQrCodeUrlImage") {
                            data.isUrl = true
                            callback.onSuccess(data)
                        }
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<CreateTransactionResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun createTransactionCard(
        sessionToken: String,
        request: CardTransactionRequest,
        callback: CardTransactionCallback
    ) {
        val call = api.createTransactionCard(sessionToken, request)
        call.enqueue(object : Callback<CardTransactionResponse> {
            override fun onResponse(
                call: Call<CardTransactionResponse>,
                response: Response<CardTransactionResponse>
            ) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        val data = responseBody.data
                        callback.onSuccess(data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<CardTransactionResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getAgentInfo(sessionToken: String, callback: AgentInfoCallback) {
        val call = api.getAgentInfo(sessionToken)
        call.enqueue(object : Callback<AgentResponse> {
            override fun onResponse(call: Call<AgentResponse>, response: Response<AgentResponse>) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<AgentResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun changePassword(sessionToken: String, request: ChangePasswordRequest, callback: ChangePasswordCallback) {
        val call = api.changePassword(sessionToken, request)
        call.enqueue(object : Callback<BasicResponse> {
            override fun onResponse(call: Call<BasicResponse>, response: Response<BasicResponse>) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<BasicResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
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
        callback: MerchantTransactionCallback
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

        val call: Call<MerchantTransactionResponse> = api.getMerchantTransactions(sessionToken, filterMap, createdAt)

        call.enqueue(object : Callback<MerchantTransactionResponse> {
            override fun onResponse(
                call: Call<MerchantTransactionResponse>,
                response: Response<MerchantTransactionResponse>
            ) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<MerchantTransactionResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getMerchantTransactionById(id: String, sessionToken: String, callback: MerchantTransactionDetailCallback) {
        val call = api.getMerchantTransactionById(sessionToken, id)
        call.enqueue(object : Callback<MerchantTransactionDetailRespone> {
            override fun onResponse(
                call: Call<MerchantTransactionDetailRespone>,
                response: Response<MerchantTransactionDetailRespone>
            ) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<MerchantTransactionDetailRespone>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getMerchantStaffInfo(sessionToken: String, callback: MerchantStaffCallback) {
        val call = api.getMerchantStaffInfo(sessionToken)
        call.enqueue(object : Callback<MerchantStaffResponse> {
            override fun onResponse(call: Call<MerchantStaffResponse>, response: Response<MerchantStaffResponse>) {
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<MerchantStaffResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getMerchantStatisticByAcquirer(
        sessionToken: String,
        startDate: String,
        endDate: String,
        outletId: String,
        callback: MerchantAcquirerStatisticCallback
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
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<MerchantStatAcquirerResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
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
        callback: MerchantStatisticCallback
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
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<MerchantStatisticResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun getMerchantOutlets(
        sessionToken: String,
        page: String,
        perPage: String,
        outletName: String,
        callback: MerchantOutletCallback
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
                val responseBody = response.body()
                if (responseBody != null) {
                    if (response.code() == 200) {
                        callback.onSuccess(responseBody.data)
                    } else {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    }
                } else {
                    if (response.code() == 502) {
                        callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                    } else {
                        val retrofit = MikaRestAdapter().newRetrofitService()
                        val annotation = object : Annotation {}
                        val converter =
                            retrofit.responseBodyConverter<BasicResponse>(
                                BasicResponse::class.java,
                                arrayOf(annotation)
                            )
                        val error = converter.convert(response.errorBody())
                        callback.onFailure(error)
                    }
                }
            }

            override fun onFailure(call: Call<MerchantOutletResponse>, t: Throwable) {
                doOnResponseFailure(t, callback)
            }
        })
    }

    fun changeTransactionStatus(sessionToken: String, request: ChangeTransactionStatusRequest, callback: ChangeTransactionStatusCallback) {
        api.changeTransactionStatus(sessionToken, request)
            .enqueue(object : Callback<BasicResponse> {
                override fun onResponse(call: Call<BasicResponse>, response: Response<BasicResponse>) {
                    val responseBody = response.body()
                    if (responseBody != null) {
                        if (response.code() == 200) {
                            callback.onSuccess(responseBody)
                        } else {
                            callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                        }
                    } else {
                        if (response.code() == 502) {
                            callback.onFailure(BasicResponse(true, response.message(), response.code().toString()))
                        } else {
                            val retrofit = MikaRestAdapter().newRetrofitService()
                            val annotation = object : Annotation {}
                            val converter =
                                retrofit.responseBodyConverter<BasicResponse>(
                                    BasicResponse::class.java,
                                    arrayOf(annotation)
                                )
                            val error = converter.convert(response.errorBody())
                            callback.onFailure(error)
                        }
                    }
                }

                override fun onFailure(call: Call<BasicResponse>, t: Throwable) {
                    doOnResponseFailure(t, callback)
                }

            })
    }
}
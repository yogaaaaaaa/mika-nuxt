package id.mikaapp.sdk.api

import id.mikaapp.sdk.models.*
import retrofit2.Call
import retrofit2.http.*

internal interface Api {

    @POST("auth/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @POST("auth/logout")
    fun logout(@Header("X-Access-Token") token: String): Call<BasicResponse>

    @POST("auth/check")
    fun checkLoginSession(@Body request: CheckRequest): Call<CheckResponse>

    @GET("agent/acquirers")
    fun getAcquirers(@Header("X-Access-Token") token: String): Call<AcquirersResponse>

    @GET("agent/acquirers/{acquirerID}")
    fun getAcquirerByID(@Header("X-Access-Token") sessionToken: String, @Path("acquirerID") acquirerID: String) : Call<AcquirerResponse>

    @GET("agent/transactions")
    fun getTransactions(@Header("X-Access-Token") token: String): Call<TransactionResponse>


    @GET("agent/transactions")
    fun getTransactions(
        @Header("X-Access-Token") token: String, @QueryMap queries: Map<String, String>
    ): Call<TransactionResponse>

    @GET("agent/transactions")
    fun getTransactionsByFilters(
        @Header("X-Access-Token") token: String, @QueryMap queries: Map<String, String>, @Query("f[createdAt]") createdAt: List<String>
    ): Call<TransactionResponse>

    @GET("agent/transactions/{id}")
    fun getTransactionById(@Header("X-Access-Token") token: String, @Path("id") id: String): Call<TransactionDetailResponse>

    @GET("agent/transactions/by_alias/{idAlias}")
    fun getTransactionByIdAlias(@Header("X-Access-Token") token: String, @Path("idAlias") idAlias: String): Call<TransactionDetailResponse>

    @POST("agent/transactions")
    fun createTransactionWallet(@Header("X-Access-Token") token: String, @Body request: WalletTransactionRequest): Call<CreateTransactionResponse>

    @POST("agent/transactions")
    fun createTransactionWallet(@Header("X-Access-Token") token: String, @Body request: WalletTransactionRequestWithoutLocation): Call<CreateTransactionResponse>


    @POST("agent/transactions")
    fun createTransactionCard(@Header("X-Access-Token") token: String, @Body request: CardTransactionRequest): Call<CardTransactionResponse>

    @POST("agent/transactions")
    fun createTransactionCardWithoutLocation(@Header("X-Access-Token") token: String, @Body request: CardTransactionRequestWithoutLocation): Call<CardTransactionResponse>



    @GET("agent")
    fun getAgentInfo(@Header("X-Access-Token") token: String): Call<AgentResponse>

    @POST("auth/change_password")
    fun changePassword(@Header("X-Access-Token") token: String, @Body request: ChangePasswordRequest): Call<BasicResponse>

    @GET("merchant_staff/transactions")
    fun getMerchantTransactions(
        @Header("X-Access-Token") token: String, @QueryMap queries: Map<String, String>, @Query("f[createdAt]") createdAt: List<String>
    ): Call<MerchantTransactionResponse>

    @GET("merchant_staff/transactions/{id}")
    fun getMerchantTransactionById(@Header("X-Access-Token") token: String, @Path("id") id: String): Call<MerchantTransactionDetailRespone>

    @GET("merchant_staff/outlets")
    fun getMerchantOutlets(
        @Header("X-Access-Token") token: String, @QueryMap queries: Map<String, String>
    ): Call<MerchantOutletResponse>

    @GET("merchant_staff")
    fun getMerchantStaffInfo(@Header("X-Access-Token") token: String): Call<MerchantStaffResponse>

    @GET("merchant_staff/statistics/transactions/by_acquirer")
    fun getTransactionStatisticByAcquirer(
        @Header("X-Access-Token") token: String, @QueryMap queries: Map<String, String>, @Query("f[createdAt]") createdAt: List<String>
    ): Call<MerchantStatAcquirerResponse>

    @GET("merchant_staff/statistics/transactions/count_by_time_group")
    fun getTransactionStatisticByTimeGroup(
        @Header("X-Access-Token") token: String, @QueryMap queries: Map<String, String>, @Query("f[createdAt]") createdAt: List<String>
    ): Call<MerchantStatisticResponse>

    @GET("merchant_staff/acquirers")
    fun getMerchantAcquirers(@Header("X-Access-Token") token: String): Call<AcquirersResponse>

    @GET("merchant_staff/acquirers/{acquirerID}")
    fun getMerchantAcquirerByID(@Header("X-Access-Token") sessionToken: String, @Path("acquirerID") acquirerID: String) : Call<AcquirerResponse>

    @POST("agent/debug/change_transaction_status")
    fun changeTransactionStatus(@Header("X-Access-Token") token : String, @Body request: ChangeTransactionStatusRequest) : Call<BasicResponse>

    @POST("agent/transactions/{transactionID}/refund")
    fun refundTransaction(@Header("X-Access-Token") token : String, @Path(value = "transactionID") transactionID : String, @Body request : RefundTransactionRequest) : Call<BasicResponse>

    @POST("agent/transactions/{transactionID}/cancel")
    fun cancelTransaction(@Header("X-Access-Token") token : String, @Path(value = "transactionID") transactionID : String) : Call<BasicResponse>
}
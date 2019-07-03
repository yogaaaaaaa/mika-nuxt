package id.mikaapp.data.api

import id.mikaapp.data.entities.UserData
import io.reactivex.Observable
import retrofit2.http.*

/**
 * Created by grahamdesmon on 02/04/19.
 */


interface Api {

    @FormUrlEncoded
    @POST("/api/auth/login")
    fun login(@Field("username") username: String, @Field("password") password: String): Observable<UserLoginResult>

    @GET("/api/auth/logout")
    fun logout(@Header("X-Access-Token") token: String): Observable<Any>

    @FormUrlEncoded
    @POST("/api/auth/check")
    fun checkLoginSession(@Field("sessionToken") token: String): Observable<Any>

    @GET("/api/agent/payment_providers")
    fun getPaymentProviders(@Header("X-Access-Token") token: String): Observable<PaymentProviderResult>

    @GET("/api/agent/transactions")
    fun getTransactions(@Header("X-Access-Token") token: String, @Query("page") page: String, @Query("perpage") perPage: String): Observable<TransactionsResult>

    @GET("/api/agent/transactions/{id}")
    fun getTransactionDetails(@Header("X-Access-Token") token: String, @Field("id") id: String): Observable<TransactionDetailResult>
}
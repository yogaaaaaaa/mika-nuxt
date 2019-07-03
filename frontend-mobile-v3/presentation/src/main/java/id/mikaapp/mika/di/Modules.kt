package id.mikaapp.mika.di

import android.content.SharedPreferences
import android.preference.PreferenceManager
import com.squareup.picasso.Picasso
import id.mikaapp.data.api.Api
import id.mikaapp.data.local.SharedPrefsLocalStorage
import id.mikaapp.data.repositories.RemoteUserDataStore
import id.mikaapp.data.repositories.UserRepositoryImpl
import id.mikaapp.domain.UserRepository
import id.mikaapp.domain.usecases.UserLogin
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.agent.account.AccountViewModel
import id.mikaapp.mika.agent.acquirer.AcquirerViewModel
import id.mikaapp.mika.agent.cardpayment.CardPaymentViewModel
import id.mikaapp.mika.agent.charge.ChargeViewModel
import id.mikaapp.mika.agent.credential.ChangePasswordViewModel
import id.mikaapp.mika.agent.qrpayment.QrPaymentViewModel
import id.mikaapp.mika.agent.transaction.TransactionViewModel
import id.mikaapp.mika.agent.transactiondetail.TransactionDetailViewModel
import id.mikaapp.mika.common.ASyncTransformer
import id.mikaapp.mika.common.ImageLoader
import id.mikaapp.mika.common.PicassoImageLoader
import id.mikaapp.mika.login.LoginViewModel
import id.mikaapp.mika.mappers.DetailTransactionMapper
import id.mikaapp.mika.mappers.UserEntityUserMapper
import id.mikaapp.mika.merchant.dashboard.DashboardViewModel
import id.mikaapp.mika.merchant.outlet.OutletViewModel
import id.mikaapp.mika.merchant.transaction.MerchantTransactionViewModel
import id.mikaapp.mika.utils.NotificationHelper
import id.mikaapp.sdk.MikaSdk
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import org.koin.android.ext.koin.androidContext
import org.koin.android.viewmodel.dsl.viewModel
import org.koin.dsl.module
import retrofit2.Retrofit
import retrofit2.adapter.rxjava2.RxJava2CallAdapterFactory
import retrofit2.converter.gson.GsonConverterFactory

val appModule = module {
    single {
        MikaSdk.instance.initialize(androidContext(), BuildConfig.SANDBOX_MODE)
        MikaSdk.instance
    }
    single<UserRepository> { UserRepositoryImpl(RemoteUserDataStore(get())) }
    single<SharedPreferences> { PreferenceManager.getDefaultSharedPreferences(androidContext()) }
    single { SharedPrefsLocalStorage(get()) }
    single { NotificationHelper(androidContext()) }
    single<ImageLoader> { PicassoImageLoader(Picasso.get()) }
}

val networkModule = module {
    single<Api> {
        val interceptors = arrayListOf<Interceptor>()

        val keyInterceptor = Interceptor { chain ->

            val original = chain.request()
            val originalHttpUrl = original.url()

            val url = originalHttpUrl.newBuilder()
//                .addQueryParameter("api_key", apiKey)
                .build()

            val requestBuilder = original.newBuilder()
                .url(url)

            val request = requestBuilder.build()
            return@Interceptor chain.proceed(request)
        }

        interceptors.add(keyInterceptor)
        val clientBuilder = OkHttpClient.Builder()
        if (interceptors.isNotEmpty()) {
            interceptors.forEach { interceptor ->
                clientBuilder.addInterceptor(interceptor)
            }
        }
        Retrofit.Builder()
            .client(clientBuilder.build())
            .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
            .addConverterFactory(GsonConverterFactory.create())
            .baseUrl(BuildConfig.BASE_URL)
            .build().create(Api::class.java)
    }
}

val loginModule = module {
    factory { UserLogin(ASyncTransformer(), get()) }
    viewModel { LoginViewModel(get(), UserEntityUserMapper(), get()) }
}

val chargeModule = module {
    viewModel { ChargeViewModel(get()) }
}

val transactionModule = module {
    viewModel { TransactionViewModel(get()) }
    viewModel { MerchantTransactionViewModel(get()) }
}

val accountModule = module {
    viewModel { AccountViewModel(get()) }
}

val acquirerModule = module {
    viewModel { AcquirerViewModel(get()) }
}

val cardPaymentModule = module {
    viewModel { CardPaymentViewModel(get()) }
}

val changePasswordModule = module {
    viewModel { ChangePasswordViewModel(get()) }
}

val qrPaymentModule = module {
    viewModel { QrPaymentViewModel(get()) }
}

val transactionDetailModule = module {
    viewModel { TransactionDetailViewModel(get(), DetailTransactionMapper()) }
}

val outletModule = module {
    viewModel { OutletViewModel(get()) }
}

val dashboardModule = module {
    viewModel { DashboardViewModel(get()) }
}
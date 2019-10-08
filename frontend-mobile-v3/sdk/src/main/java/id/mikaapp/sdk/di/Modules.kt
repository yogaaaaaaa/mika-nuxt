@file:Suppress("RemoveExplicitTypeArguments")

package id.mikaapp.sdk.di

import com.securepreferences.SecurePreferences
import id.mikaapp.sdk.api.MikaApiService
import id.mikaapp.sdk.api.MikaRestAdapter
import id.mikaapp.sdk.datasource.LocalPersistentDataSource
import id.mikaapp.sdk.utils.IUtility
import id.mikaapp.sdk.utils.Utility
import org.koin.android.ext.koin.androidContext
import org.koin.core.qualifier.named
import org.koin.dsl.module

object ModuleName {
    private const val BASE_MODULE_NAME = "id.mikaapp.sdk"
    val mikaApiService = named("$BASE_MODULE_NAME mika api service")
    val iUtility = named("$BASE_MODULE_NAME iutility")
    val localPersistentDataSource = named("$BASE_MODULE_NAME local persistent data source")
}

val appModule = module {
    single<MikaApiService>(ModuleName.mikaApiService) {
        MikaApiService(MikaRestAdapter().newMikaApiService())
    }

    single<IUtility>(ModuleName.iUtility) {
        Utility(androidContext())
    }

    single<LocalPersistentDataSource>(ModuleName.localPersistentDataSource) {
        LocalPersistentDataSource(SecurePreferences(androidContext()))
    }
}
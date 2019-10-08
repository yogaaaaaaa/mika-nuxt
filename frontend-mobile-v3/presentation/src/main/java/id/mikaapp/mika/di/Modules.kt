@file:Suppress("RemoveExplicitTypeArguments")

package id.mikaapp.mika.di

import android.app.Application
import android.content.SharedPreferences
import android.os.Build
import android.preference.PreferenceManager
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.MqttHandler
import id.mikaapp.mika.agent.account.AccountViewModel
import id.mikaapp.mika.agent.agenthome.AgentHomeViewModel
import id.mikaapp.mika.agent.agenthome.charge.ChargeViewModel
import id.mikaapp.mika.agent.agenthome.profile.ProfileViewModel
import id.mikaapp.mika.agent.agenthome.transaction.acquirerfilter.AgentTransactionAcquirerFilterViewModel
import id.mikaapp.mika.agent.agenthome.transaction.transactionlist.AgentTransactionListViewModel
import id.mikaapp.mika.agent.agenttransactiondetail.AgentTransactionDetailViewModel
import id.mikaapp.mika.agent.cardpayment.CardPaymentViewModel
import id.mikaapp.mika.agent.credential.ChangePasswordViewModel
import id.mikaapp.mika.agent.qrpayment.CreateQrTransactionViewModel
import id.mikaapp.mika.agent.qrpayment.QrPaymentViewModel
import id.mikaapp.mika.agent.selectacquirerbottomsheet.SelectAcquirerBottomSheetViewModel
import id.mikaapp.mika.datasource.LocalPersistentDataSource
import id.mikaapp.mika.login.LoginViewModel
import id.mikaapp.mika.service.BroadcastService
import id.mikaapp.mika.service.NotificationService
import id.mikaapp.mika.service.PrinterService
import id.mikaapp.sdk.MikaSdk
import id.mikaapp.sdk.enums.CardPaymentMethod
import id.mikaapp.sdk.service.DeviceType
import org.koin.android.ext.koin.androidContext
import org.koin.android.viewmodel.dsl.viewModel
import org.koin.dsl.module

val appModule = module {
    single {
        MikaSdk.instance.initialize(androidContext(), BuildConfig.SANDBOX_MODE)
        MikaSdk.instance
    }
    single<SharedPreferences> { PreferenceManager.getDefaultSharedPreferences(androidContext()) }
    single { LocalPersistentDataSource(get()) }
    single { NotificationService(androidContext(), get<MikaSdk>()) }
    single { BroadcastService(androidContext(), get<NotificationService>()) }
    single<PrinterService> {
        PrinterService(
            androidContext(), when {
                Build.MODEL.toLowerCase().startsWith("p1") -> DeviceType.Sunmi
                Build.MODEL.toLowerCase() == "x990" -> DeviceType.Verifone
                else -> DeviceType.Unsupported
            }
        )
    }
}

val loginModule = module {
    viewModel { LoginViewModel(get<MikaSdk>(), get<LocalPersistentDataSource>(), get<Application>()) }
}

val agentHomeModule = module {
    factory<MqttHandler> {
        MqttHandler(
            mikaSdk = get<MikaSdk>(),
            broadcastService = get<BroadcastService>()
        )
    }
    viewModel { AgentHomeViewModel(get<MikaSdk>(), get<MqttHandler>()) }
    viewModel { AgentTransactionAcquirerFilterViewModel(get<MikaSdk>()) }
}

val chargeModule = module {
    viewModel { ChargeViewModel(get<Application>()) }
}

val agentTransactionModule = module {
    viewModel { AgentTransactionListViewModel(get<MikaSdk>()) }
}

val agentTransactionDetailModule = module {
    viewModel { (transactionID: String) ->
        AgentTransactionDetailViewModel(
            transactionID,
            get<MikaSdk>(),
            get<LocalPersistentDataSource>(),
            get<PrinterService>()
        )
    }
}

val profileModule = module {
    viewModel { ProfileViewModel(get<MikaSdk>()) }
}

val accountModule = module {
    viewModel { AccountViewModel(get()) }
}

val acquirerModule = module {
    viewModel { SelectAcquirerBottomSheetViewModel(get<MikaSdk>(), get<LocalPersistentDataSource>()) }
}

val cardPaymentModule = module {
    viewModel { (amount: Int, cardPaymentMethod: CardPaymentMethod) ->
        CardPaymentViewModel(
            amount,
            "acqID",
            cardPaymentMethod,
            get<MikaSdk>(),
            get<LocalPersistentDataSource>(),
            get<PrinterService>()
        )
    }
}

val changePasswordModule = module {
    viewModel { ChangePasswordViewModel(get()) }
}

val qrPaymentModule = module {
    viewModel {
        QrPaymentViewModel(
            get<Application>(),
            mikaSdk = get<MikaSdk>(),
            localPersistentDataSource = get<LocalPersistentDataSource>(),
            printerService = get<PrinterService>()
        )
    }
    viewModel {
        CreateQrTransactionViewModel(
            mikaSdk = get<MikaSdk>(),
            localPersistentDataSource = get<LocalPersistentDataSource>()
        )
    }
}
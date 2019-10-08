package id.mikaapp.mika

import android.app.Application
import id.mikaapp.mika.di.*
import io.sentry.Sentry
import io.sentry.android.AndroidSentryClientFactory
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin


/**
 * Created by grahamdesmon on 05/04/19.
 */

class App : Application() {

    override fun onCreate() {
        super.onCreate()
        // Use the Sentry DSN (client key) from the Project Settings page on Sentry
        val sentryDsn = "https://eecede11d2054227ac00a8ff18bd87ae@analytics.mikaapp.ID/2"
        Sentry.init(sentryDsn, AndroidSentryClientFactory(applicationContext))
//        if (LeakCanary.isInAnalyzerProcess(this)) {
//            return
//        }
//        LeakCanary.install(this)

        startKoin {
            androidContext(this@App)
            modules(
                listOf(
                    appModule,
                    loginModule,
                    agentHomeModule,
                    chargeModule,
                    agentTransactionModule,
                    agentTransactionDetailModule,
                    profileModule,
                    accountModule,
                    acquirerModule,
                    cardPaymentModule,
                    changePasswordModule,
                    qrPaymentModule
                )
            )
        }
    }
}
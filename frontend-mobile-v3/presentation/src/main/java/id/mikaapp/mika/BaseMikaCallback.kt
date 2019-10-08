package id.mikaapp.mika

import android.content.Context
import android.content.Intent
import id.mikaapp.mika.login.LoginActivity
import id.mikaapp.sdk.callbacks.MikaCallback
import id.mikaapp.sdk.models.BasicResponse
import org.koin.core.KoinComponent
import org.koin.core.inject

class BaseMikaCallback<T>(
    private val complete: (() -> Unit)? = null,
    private val success: ((response: T) -> Unit)? = null,
    private val failure: ((errorResponse: BasicResponse) -> Unit)? = null,
    private val error: ((error: Throwable) -> Unit)? = null
) : MikaCallback<T>, KoinComponent {

    private val applicationContext: Context by inject()
    private val errorNotAuthenticated: String by lazy { applicationContext.getString(R.string.error_not_authenticated) }
    override fun onSuccess(response: T) {
        success?.invoke(response)
        complete?.invoke()
    }

    override fun onFailure(errorResponse: BasicResponse) {
        if (errorResponse.message == errorNotAuthenticated) {
            val homeIntent = Intent(applicationContext, LoginActivity::class.java)
            homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
            applicationContext.startActivity(homeIntent)
        }
        failure?.invoke(errorResponse)
        complete?.invoke()
    }

    override fun onError(error: Throwable) {
        this.error?.invoke(error)
        complete?.invoke()
    }
}
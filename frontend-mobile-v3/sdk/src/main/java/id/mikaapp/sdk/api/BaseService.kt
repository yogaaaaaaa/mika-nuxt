package id.mikaapp.sdk.api

import android.util.Log
import id.mikaapp.sdk.BuildConfig
import id.mikaapp.sdk.callbacks.HttpRequestCallback

internal abstract class BaseService {

    companion object {
        private val TAG = BaseService::class.java.simpleName
    }

    protected fun doOnResponseFailure(error: Throwable, callback: HttpRequestCallback) {
        try {
            if(BuildConfig.DEBUG)
                Log.e(TAG, "message:" + error.message)

            callback.onError(error)

        } catch (e: Exception) {
            callback.onError(Throwable(e.message))
        }

    }
}
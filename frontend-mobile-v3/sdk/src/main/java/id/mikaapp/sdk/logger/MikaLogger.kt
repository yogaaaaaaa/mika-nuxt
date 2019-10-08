package id.mikaapp.sdk.logger

import android.util.Log
import id.mikaapp.sdk.BuildConfig

@Suppress("ConstantConditionIf")
class MikaLogger {
    companion object {
        fun log(klass: Any, msg: String) {
            if (BuildConfig.DEBUG) {
                Log.d("MikaSdk ${klass.javaClass.simpleName}", msg)
            }
        }
    }
}
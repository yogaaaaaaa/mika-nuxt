package id.mikaapp.sdk.ext

import id.mikaapp.sdk.logger.MikaLogger

fun Any.log(message: String) {
    MikaLogger.log(this, message)
}
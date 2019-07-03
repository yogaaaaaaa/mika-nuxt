package id.mikaapp.sdk.callbacks

interface HttpRequestCallback {
    fun onError(error: Throwable)
}
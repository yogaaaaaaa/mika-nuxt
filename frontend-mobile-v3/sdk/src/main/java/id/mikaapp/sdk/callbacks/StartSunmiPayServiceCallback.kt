package id.mikaapp.sdk.callbacks

interface StartSunmiPayServiceCallback {
    fun onSuccessIcNfcCard(maskedPan: String)
    fun onSuccessMagneticCard(maskedPan: String)
    fun onFailure(code: Int, message: String)
    fun onError(e: Throwable)
    fun onAttach(attached: Boolean, loading: Boolean)
}
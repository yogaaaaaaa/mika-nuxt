package id.mikaapp.mika.service.cardservice

interface ReadCardCallback {
    fun onSuccess(maskedPAN: String)
}
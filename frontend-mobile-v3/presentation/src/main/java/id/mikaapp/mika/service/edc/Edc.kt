package id.mikaapp.edcdeviceservice

import android.annotation.SuppressLint
import android.os.Build
import id.mikaapp.edcdeviceservice.verifone.EdcDeviceVerifone
import id.mikaapp.mika.service.edc.EdcDevice
import id.mikaapp.mika.service.edc.sunmi.EdcDeviceSunmi

object Edc {
    @SuppressLint("DefaultLocale")
    val device: EdcDevice = when {
        Build.MODEL.toLowerCase().startsWith("p1") -> EdcDeviceSunmi()
        Build.MODEL.toLowerCase() == "x990" -> EdcDeviceVerifone()
        else -> throw RuntimeException()
    }
}
package id.mikaapp.sdk.utils

internal class Constant {
    companion object {
        const val MESSAGE_ERROR_SDK = "SDK must be initialized"
        const val MESSAGE_ERROR_NOT_IN_SANDBOX_MODE = "Sandbox feature can only be in sandbox mode"
        const val MESSAGE_ERROR_FAILED_TO_CONNECT = "Failed to connect to server"
        const val MESSAGE_ERROR_USER_PASSWORD_EMPTY = "Username or password is empty"
        const val MESSAGE_ERROR_EMPTY_RESPONSE = "Failed to retrieve response from server"
        const val MESSAGE_ERROR_UNAUTHENTICATED = "Not unauthenticated. Please call login method first"
        const val MESSAGE_DEVICE_NOT_SUPPORTED = "Device is not supported"
        const val MESSAGE_MQTT_FAIL = "Failed to connect to Mika MQTT server"
        const val SESSION_TOKEN_PREF = "MikaSessionToken"
        const val MQTT_BROKER_PREF = "MikaMqttBroker"
        const val USER_TYPE_PREF = "userType"
        const val TAG_MQTT = "Mika SDK - MQTT"
        const val TAG_MIKA = "Mika SDK"
    }
}
package id.mikaapp.sdk.mqtt

internal interface BaseMqtt {

    fun setClientCallback(mqttCallback: MikaMqttCallback)
    fun connectToServer()
    fun disconnectFromServer()
    fun subscribeToTopic(topic:String)
}
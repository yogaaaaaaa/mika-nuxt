package id.mikaapp.sdk.mqtt

import org.eclipse.paho.client.mqttv3.MqttCallbackExtended
import java.io.Serializable

interface MikaMqttCallback : MqttCallbackExtended, Serializable
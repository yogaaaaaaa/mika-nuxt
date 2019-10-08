package id.mikaapp.mika.service

import android.app.*
import android.app.Notification.DEFAULT_SOUND
import android.app.Notification.DEFAULT_VIBRATE
import android.content.Context
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.agenttransactiondetail.AgentTransactionDetail
import id.mikaapp.mika.ext.getBitmap
import id.mikaapp.sdk.MikaSdk

class NotificationService(val context: Context, private val mikaSdk: MikaSdk) {

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    private val notificationSound: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

    fun notifyTransaction(
        status: String,
        id: String,
        idAlias: String,
        thumbnail: String,
        thumbnailGray: String
    ) {
        val title: String
        val urlIcon: String
        if (status == "success") {
            title = context.getString(R.string.success_transaction_notification)
            urlIcon = mikaSdk.baseThumbnailURL + "/" + thumbnail
        } else {
            title = context.getString(R.string.failed_transaction_notification)
            urlIcon = mikaSdk.baseThumbnailURL + "/" + thumbnailGray
        }

        val body = "ID Transaksi $idAlias"

        val agentTransactionDetailIntent = AgentTransactionDetail.newIntent(context, id)
        val agentTransactionDetailPendingIntent: PendingIntent = TaskStackBuilder.create(context).run {
            addNextIntentWithParentStack(agentTransactionDetailIntent)
            getPendingIntent(System.currentTimeMillis().toInt(), PendingIntent.FLAG_UPDATE_CURRENT)
        }
        val notificationBuilder: NotificationCompat.Builder = when {
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O -> {
                val cId = "mika-01"
                val name = context.getString(R.string.channel_notification)

                val importance = NotificationManager.IMPORTANCE_DEFAULT
                val channel = NotificationChannel(cId, name, importance).apply {
                    enableLights(true)
                    enableVibration(true)
                }

                notificationManager.createNotificationChannel(channel)

                val stackBuilder = TaskStackBuilder.create(context)
                stackBuilder.addNextIntentWithParentStack(agentTransactionDetailIntent)

                NotificationCompat.Builder(context, cId)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setChannelId(cId)
                    .setContentIntent(agentTransactionDetailPendingIntent)
                    .setSound(notificationSound)
                    .setSmallIcon(R.drawable.ic_logo_mika)
                    .setAutoCancel(true)
                    .setDefaults(Notification.DEFAULT_LIGHTS or DEFAULT_SOUND)
            }
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP -> {
                NotificationCompat.Builder(context)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setContentIntent(agentTransactionDetailPendingIntent)
                    .setSound(notificationSound)
                    .setSmallIcon(R.drawable.ic_logo_mika)
                    .setAutoCancel(true)
                    .setDefaults(DEFAULT_SOUND or DEFAULT_VIBRATE)

            }
            else -> {
                NotificationCompat.Builder(context)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setContentIntent(agentTransactionDetailPendingIntent)
                    .setSound(notificationSound)
                    .setSmallIcon(R.drawable.ic_logo_mika)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setDefaults(DEFAULT_SOUND or DEFAULT_VIBRATE)

            }
        }

        context.getBitmap(urlIcon) {
            notificationBuilder.setLargeIcon(it)
            val notification = notificationBuilder.build()
            notificationManager.notify(id.hashCode(), notification)
        }
    }
}
package id.mikaapp.mika.utils

import android.app.*
import android.app.Notification.DEFAULT_SOUND
import android.app.Notification.DEFAULT_VIBRATE
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import id.mikaapp.mika.BuildConfig
import id.mikaapp.mika.R
import id.mikaapp.mika.agent.home.HomeActivity.Companion.TRANSACTION_MQTT_ACTION
import id.mikaapp.mika.agent.transactiondetail.TransactionDetailActivity

class NotificationHelper(var context: Context) {
    private lateinit var title: String
    private lateinit var urlIcon: String
    private var isSuccess: Boolean = false

    fun setTransactionNotification(
        status: String,
        id: String,
        idAlias: String,
        thumbnail: String,
        thumbnailGray: String
    ) {

        if (status == "success") {
            title = context.getString(R.string.success_transaction_notification)
            isSuccess = true
            urlIcon = BuildConfig.BASE_URL + "/thumbnails/" + thumbnail
        } else {
            title = context.getString(R.string.failed_transaction_notification)
            urlIcon = BuildConfig.BASE_URL + "/thumbnails/" + thumbnailGray
        }

        val body = "ID Transaksi $idAlias"

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notificationSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val intent = TransactionDetailActivity.newIntent(
            context, true, false, false, id
        )
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        val pendingIntent: PendingIntent = PendingIntent.getActivity(context, 0, intent, 0)
        var notification: Notification
        val mBuilder: NotificationCompat.Builder

        when {
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
                stackBuilder.addNextIntentWithParentStack(intent)
                val resultPendingIntent =
                    stackBuilder.getPendingIntent(System.currentTimeMillis().toInt(), PendingIntent.FLAG_UPDATE_CURRENT)

                mBuilder = NotificationCompat.Builder(context, cId)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setChannelId(cId)
                    .setContentIntent(resultPendingIntent)
                    .setSound(notificationSound)
                    .setSmallIcon(R.drawable.ic_logo_mika)
                    .setAutoCancel(true)
                    .setDefaults(Notification.DEFAULT_LIGHTS or DEFAULT_SOUND)
            }
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP -> {
                mBuilder = NotificationCompat.Builder(context)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setContentIntent(pendingIntent)
                    .setSound(notificationSound)
                    .setSmallIcon(R.drawable.ic_logo_mika)
                    .setAutoCancel(true)
                    .setDefaults(DEFAULT_SOUND or DEFAULT_VIBRATE)

            }
            else -> {
                mBuilder = NotificationCompat.Builder(context)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setContentIntent(pendingIntent)
                    .setSound(notificationSound)
                    .setSmallIcon(R.drawable.ic_logo_mika)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setDefaults(DEFAULT_SOUND or DEFAULT_VIBRATE)

            }
        }
        Glide.with(context).asBitmap().load(urlIcon).into(object : CustomTarget<Bitmap>() {
            override fun onLoadCleared(placeholder: Drawable?) {

            }

            override fun onResourceReady(resource: Bitmap, transition: Transition<in Bitmap>?) {
                val notificationId = System.currentTimeMillis().toInt()
                mBuilder.setLargeIcon(resource)
                notification = mBuilder.build()
                notificationManager.notify(notificationId, notification)

                val intentBroadcast = Intent(TRANSACTION_MQTT_ACTION)
                intentBroadcast.putExtra("id", id)
                intentBroadcast.putExtra("status", status)
                intentBroadcast.putExtra("notificationId", notificationId)
                LocalBroadcastManager.getInstance(context).sendBroadcast(intentBroadcast)
            }

        })
    }
}
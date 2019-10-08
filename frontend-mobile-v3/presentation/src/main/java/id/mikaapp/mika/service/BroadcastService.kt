package id.mikaapp.mika.service

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.google.gson.Gson
import id.mikaapp.sdk.models.Transaction

class BroadcastService(private val context: Context, private val notificationService: NotificationService) {

    companion object {
        const val TRANSACTION_BROADCAST_ACTION = "TRANSACTION_BROADCAST_ACTION"
        const val TRANSACTION_BROADCAST_EXTRA_JSON = "TRANSACTION_BROADCAST_EXTRA_JSON"
        const val TRANSACTION_BROADCAST_EXTRA_SHOW_NOTIFICATION = "TRANSACTION_BROADCAST_EXTRA_SHOW_NOTIFICATION"
    }

    fun broadcastTransaction(transaction: Transaction) {
        val intentBroadcast = Intent(TRANSACTION_BROADCAST_ACTION)
        intentBroadcast.putExtra(TRANSACTION_BROADCAST_EXTRA_JSON, Gson().toJson(transaction))
        intentBroadcast.putExtra(TRANSACTION_BROADCAST_EXTRA_SHOW_NOTIFICATION, true)
        context.applicationContext.sendOrderedBroadcast(intentBroadcast, null, object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val results = getResultExtras(true)
                val showNotification = results.getBoolean(TRANSACTION_BROADCAST_EXTRA_SHOW_NOTIFICATION, true)
                Log.d("TESTTESTTEST", "SHOW NOTIFICATION: $showNotification")
                if (showNotification) notificationService.notifyTransaction(
                    transaction.status,
                    transaction.id,
                    transaction.idAlias,
                    transaction.acquirer.acquirerType.thumbnail,
                    transaction.acquirer.acquirerType.thumbnailGray
                )
            }
        }, null, Activity.RESULT_OK, null, null)
    }
}
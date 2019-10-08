package id.mikaapp.mika.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Log
import com.google.gson.Gson
import id.mikaapp.sdk.models.Transaction

class TransactionBroadcastReceiver(
    private val context: Context,
    private val showNotification: Boolean? = null,
    private val onTransactionReceiveListener: ((Transaction) -> Unit)
) : BroadcastReceiver() {

    private var registered = false

    fun start() {
        context.registerReceiver(this, IntentFilter(BroadcastService.TRANSACTION_BROADCAST_ACTION))
        registered = true
    }

    override fun onReceive(context: Context?, bundle: Intent?) {
        Log.d("TESTTESTTEST", "receive transaction: ${bundle?.action}")
        bundle?.let {
            val results = getResultExtras(true)
            if (it.action == BroadcastService.TRANSACTION_BROADCAST_ACTION) {
                val transaction = Gson().fromJson(
                    it.getStringExtra(BroadcastService.TRANSACTION_BROADCAST_EXTRA_JSON),
                    Transaction::class.java
                )
                onTransactionReceiveListener.invoke(transaction)
                showNotification?.let { show ->
                    results.putBoolean(BroadcastService.TRANSACTION_BROADCAST_EXTRA_SHOW_NOTIFICATION, show)
                }
            }
//                val notificationId = bundle.getIntExtra("notificationId", 0)
//                val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
//                if (notificationId > 0) {
//                    notificationManager.cancel(notificationId)
//                } else {
//                    notificationManager.cancelAll()
//                }
//
//                if (transactionId == id) {
//                    val intent = if (status == "success") {
//                        TransactionDetailActivity.newIntent(
//                            applicationContext, true, false, true, id
//                        )
//
//                    } else {
//                        TransactionDetailActivity.newIntent(
//                            applicationContext, true, false, false, id
//                        )
//                    }
//                    startActivity(intent)
//                    finish()
//                }
//            }
        }
    }

    fun stop() {
        if (registered) {
            context.unregisterReceiver(this)
            registered = false
        }
    }
}
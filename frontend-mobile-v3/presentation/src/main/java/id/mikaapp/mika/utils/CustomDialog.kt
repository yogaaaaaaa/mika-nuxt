package id.mikaapp.mika.utils

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.view.LayoutInflater
import android.widget.TextView
import id.mikaapp.mika.R

class CustomDialog {
    companion object {
        fun progressDialog(context: Context, message: String): Dialog {
            val dialog = Dialog(context)
            val inflate = LayoutInflater.from(context).inflate(R.layout.dialog_loading, null)
            dialog.setContentView(inflate)
            val messageTextView = dialog.findViewById<TextView>(R.id.message_text_view)
            messageTextView.text = message
            dialog.setCancelable(true)
            dialog.window!!.setBackgroundDrawable(
                ColorDrawable(Color.TRANSPARENT)
            )
            return dialog
        }
    }
}
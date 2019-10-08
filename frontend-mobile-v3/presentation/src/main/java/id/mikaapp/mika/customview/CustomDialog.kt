package id.mikaapp.mika.customview

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.view.LayoutInflater
import id.mikaapp.mika.R
import kotlinx.android.synthetic.main.dialog_loading.view.*

class CustomDialog {
    companion object {
        fun progressDialog(context: Context, message: String, cancelabe: Boolean = true): Dialog {
            val dialog = Dialog(context)
            val view = LayoutInflater.from(context).inflate(R.layout.dialog_loading, null)
            dialog.setContentView(view)
            view.dialogLoadingMessage.text = message
            dialog.setCancelable(cancelabe)
            dialog.window!!.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            return dialog
        }
    }
}
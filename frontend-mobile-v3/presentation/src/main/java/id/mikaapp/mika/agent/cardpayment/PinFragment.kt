package id.mikaapp.mika.agent.cardpayment


import android.app.Dialog
import android.content.Context
import android.content.DialogInterface
import android.os.Bundle
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import androidx.fragment.app.Fragment
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.widget.EditText
import android.widget.RelativeLayout
import android.widget.Toast
import id.mikaapp.mika.R
import jp.wasabeef.blurry.Blurry


/**
 * A simple [Fragment] subclass.
 *
 */
class PinFragment : BottomSheetDialogFragment() {

    private lateinit var behavior: BottomSheetBehavior<View>
    private var pin = ""
    private val editPins: MutableList<EditText> = mutableListOf()
    private val isFinish = false

    private val TAG = PinFragment::class.java.simpleName
    private var callback: OnOkClickListener? = null

    interface OnOkClickListener {
        fun onOkClicked(pin: String)
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {

        val dialog = super.onCreateDialog(savedInstanceState) as BottomSheetDialog
        dialog.setCancelable(false)
        val view = View.inflate(context, R.layout.fragment_bottomsheet_pin, null)
        editPins.add(view.findViewById<View>(R.id.edit_pin1) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin2) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin3) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin4) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin5) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin6) as EditText)

        dialog.setContentView(view)
        dialog.setOnKeyListener { arg0, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_BACK) {
                dialog.dismiss()
            }
            true
        }
        behavior = BottomSheetBehavior.from(view.parent as View)
        behavior.isHideable = false
        behavior.peekHeight = 5000

        behavior.setBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
            override fun onStateChanged(bottomSheet: View, newState: Int) {

                if (BottomSheetBehavior.STATE_HIDDEN == newState) {
                    dismiss()
                }
            }

            override fun onSlide(bottomSheet: View, slideOffset: Float) {

            }
        })

        view.findViewById<View>(R.id.btn_close).setOnClickListener { dismiss() }

        return dialog
    }

    override fun onStart() {
        super.onStart()
        behavior.state = BottomSheetBehavior.STATE_COLLAPSED
    }

    override fun onAttach(context: Context?) {
        super.onAttach(context)
        try {
            callback = context as OnOkClickListener?
        } catch (e: ClassCastException) {
            Log.e(TAG, e.message)
            throw ClassCastException(context!!.toString() + " must implement OnOkClickListener")
        }

    }

    override fun onDismiss(dialog: DialogInterface?) {
        super.onDismiss(dialog)
        if (!isFinish) {
            try {
                Blurry.delete(activity?.findViewById<View>(R.id.lyt_root) as RelativeLayout)
            } catch (e: Exception) {
                Log.e(TAG, e.message)
            }

        }
    }

    fun onClicked(s: String) {
        var position = pin.length

        if (resources.getString(R.string.button_backspace) == s) {
            if (position > 0) {
                position--
                editPins[position].text?.clear()
                val sb = StringBuilder(pin)
                sb.deleteCharAt(position)
                pin = sb.toString()
            }
        } else if (resources.getString(R.string.text_okay) == s) {
            if (pin.length == editPins.size) {
                callback?.onOkClicked(pin)
                dismiss()
            } else {
                Toast.makeText(context, R.string.error_incomplete_pin, Toast.LENGTH_SHORT).show()
            }
        } else {
            if (position < editPins.size) {
                editPins[position].setText(R.string.text_asterisk)
                pin += s
            }
        }
    }
}

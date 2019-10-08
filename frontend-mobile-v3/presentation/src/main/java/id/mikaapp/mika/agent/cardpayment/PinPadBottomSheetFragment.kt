package id.mikaapp.mika.agent.cardpayment


import android.app.Dialog
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.widget.EditText
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import id.mikaapp.mika.R
import kotlinx.android.synthetic.main.fragment_bottomsheet_pinpad.view.*


/**
 * A simple [Fragment] subclass.
 *
 */
class PinPadBottomSheetFragment : BottomSheetDialogFragment() {

    private lateinit var behavior: BottomSheetBehavior<View>
    private var pin = ""
    private val editPins: MutableList<EditText> = mutableListOf()

    private var callback: OnOkClickListener? = null

    interface OnOkClickListener {
        fun onOkClicked(pin: String)
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {

        val dialog = super.onCreateDialog(savedInstanceState) as BottomSheetDialog
        dialog.setCancelable(false)
        val view = View.inflate(context, R.layout.fragment_bottomsheet_pinpad, null)
        editPins.add(view.findViewById<View>(R.id.edit_pin1) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin2) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin3) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin4) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin5) as EditText)
        editPins.add(view.findViewById<View>(R.id.edit_pin6) as EditText)

        listOf(
            view.pinPadButton0,
            view.pinPadButton1,
            view.pinPadButton2,
            view.pinPadButton3,
            view.pinPadButton4,
            view.pinPadButton5,
            view.pinPadButton6,
            view.pinPadButton7,
            view.pinPadButton8,
            view.pinPadButton9,
            view.pinPadButtonOK,
            view.pinPadButtonDelete
        ).forEach { button -> button.setOnClickListener { onPinButtonClicked(button.text.toString()) } }

        dialog.setContentView(view)
        dialog.setOnKeyListener { _, keyCode, _ ->
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

//    override fun onAttach(context: Context?) {
//        super.onAttach(context)
//        try {
//            callback = context as OnOkClickListener?
//        } catch (e: ClassCastException) {
//            Log.e(TAG, e.message)
//            throw ClassCastException(context!!.toString() + " must implement OnOkClickListener")
//        }
//
//    }

    private fun onPinButtonClicked(s: String) {
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

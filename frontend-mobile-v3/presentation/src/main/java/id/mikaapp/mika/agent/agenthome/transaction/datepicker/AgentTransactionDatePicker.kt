package id.mikaapp.mika.agent.agenthome.transaction.datepicker


import android.content.res.Resources
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.DatePicker
import android.widget.NumberPicker
import androidx.fragment.app.DialogFragment
import id.mikaapp.mika.R
import kotlinx.android.synthetic.main.fragment_agent_transaction_date_picker.*
import java.util.*


class AgentTransactionDatePicker : DialogFragment() {

    private var onDateSelectedListener: ((day: Int, month: Int, year: Int) -> Unit)? = null
    private var showDay = false


    private lateinit var dayNumberPicker: NumberPicker
    private lateinit var monthNumberPicker: NumberPicker
    private lateinit var yearNumberPicker: NumberPicker

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Locale.setDefault(Locale("in", "ID"))
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        return inflater.inflate(R.layout.fragment_agent_transaction_date_picker, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        agentTransactionDatePickerView.maxDate = Calendar.getInstance().timeInMillis

        dayNumberPicker = agentTransactionDatePickerView.findViewById(
            Resources.getSystem().getIdentifier("day", "id", "android")
        ) as NumberPicker

        monthNumberPicker = agentTransactionDatePickerView.findViewById(
            Resources.getSystem().getIdentifier("month", "id", "android")
        ) as NumberPicker

        yearNumberPicker = agentTransactionDatePickerView.findViewById(
            Resources.getSystem().getIdentifier("year", "id", "android")
        ) as NumberPicker


        setNumberPickerDividerColour(dayNumberPicker)
        setNumberPickerDividerColour(monthNumberPicker)
        setNumberPickerDividerColour(yearNumberPicker)
        agentTransactionDatePickerView.descendantFocusability = DatePicker.FOCUS_BLOCK_DESCENDANTS

        dayNumberPicker.visibility = if (showDay) View.VISIBLE else View.GONE
        agentTransactionDatePickerTitle.text = if (showDay) "Pilih Berdasarkan Tanggal" else "Pilih Berdasarkan Bulan"
        agentTransactionDatePickerConfirm.text = if (showDay) "Terapkan Tanggal" else "Terapkan Bulan"
        agentTransactionDatePickerConfirm.setOnClickListener {
            val day = agentTransactionDatePickerView.dayOfMonth
            val month = agentTransactionDatePickerView.month
            val year = agentTransactionDatePickerView.year
            onDateSelectedListener?.invoke(if (!showDay) 1 else day, month, year)
            dismiss()
        }
    }

    fun setOnDateSelected(listener: ((day: Int, month: Int, year: Int) -> Unit)?) {
        onDateSelectedListener = listener
    }

    fun showDay(show: Boolean) {
        showDay = show
    }

    private fun setNumberPickerDividerColour(number_picker: NumberPicker) {
        val count = number_picker.childCount

        for (i in 0 until count) {

            try {
                val dividerField = number_picker::class.java.getDeclaredField("mSelectionDivider")
                dividerField.isAccessible = true
                val colorDrawable = ColorDrawable(Color.TRANSPARENT)
                dividerField.set(number_picker, colorDrawable)

                number_picker.invalidate()
            } catch (e: NoSuchFieldException) {
                Log.w("setNumberPickerTxtClr", e)
            } catch (e: IllegalAccessException) {
                Log.w("setNumberPickerTxtClr", e)
            } catch (e: IllegalArgumentException) {
                Log.w("setNumberPickerTxtClr", e)
            }

        }
    }
}

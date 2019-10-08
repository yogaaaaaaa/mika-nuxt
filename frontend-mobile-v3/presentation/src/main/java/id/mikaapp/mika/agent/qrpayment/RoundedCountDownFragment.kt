package id.mikaapp.mika.agent.qrpayment


import android.os.Bundle
import android.os.CountDownTimer
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import id.mikaapp.mika.R
import kotlinx.android.synthetic.main.fragment_rounded_count_down.*

class RoundedCountDownFragment : Fragment() {

    private var countDownTimer: CountDownTimer? = null
    private var onFinishListener: (() -> Unit)? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_rounded_count_down, container, false)
    }

    fun start(durationInSecond: Long) {
        roundedCountDownProgressBar.max = durationInSecond.toInt()
        countDownTimer?.cancel()
        countDownTimer = object : CountDownTimer(durationInSecond * 1000, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val progress = (millisUntilFinished / 1000).toInt()
                roundedCountDownProgressBar.progress = progress
                roundedCountDownText.text = progress.toString()
            }

            override fun onFinish() {
                onFinishListener?.invoke()
            }
        }.apply { start() }
    }

    fun setOnFinish(listener: (() -> Unit)?) {
        onFinishListener = listener
    }

    override fun onDetach() {
        countDownTimer?.cancel()
        countDownTimer = null
        super.onDetach()
    }

}

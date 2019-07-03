package id.mikaapp.mika.agent.cardpayment


import android.app.Dialog
import android.content.Context
import android.content.DialogInterface
import android.graphics.*
import android.os.Bundle
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import androidx.fragment.app.Fragment
import android.util.Base64
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.RelativeLayout
import com.github.gcacace.signaturepad.views.SignaturePad

import id.mikaapp.mika.R
import jp.wasabeef.blurry.Blurry
import sunmi.sunmiui.utils.LogUtil
import java.io.ByteArrayOutputStream

/**
 * A simple [Fragment] subclass.
 *
 */
class SignatureFragment : BottomSheetDialogFragment(), View.OnClickListener {

    private var behavior: BottomSheetBehavior<*>? = null
    private val isFinish = false
    private var btnClear: Button? = null
    private var btnContinue: Button? = null
    private var btnClose: ImageButton? = null
    private var mSignaturePad: SignaturePad? = null
    private val TAG = SignatureFragment::class.java.simpleName
    private var callback: OnContinueClickListener? = null

    interface OnContinueClickListener {
        fun onContinueClicked(signature: String)
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = super.onCreateDialog(savedInstanceState) as BottomSheetDialog
        val view = View.inflate(context, R.layout.fragment_bottomsheet_signature, null)

        dialog.setCancelable(false)

        btnClear = view.findViewById(R.id.btn_clear)
        btnContinue = view.findViewById(R.id.btn_continue)
        btnClose = view.findViewById(R.id.btn_close)

        mSignaturePad = view.findViewById(R.id.signature_pad)
        mSignaturePad!!.setOnSignedListener(object : SignaturePad.OnSignedListener {
            override fun onStartSigning() {

            }

            override fun onSigned() {
                btnClear!!.background = context?.getDrawable(R.drawable.blue_button_bg)
                btnContinue!!.background = context?.getDrawable(R.drawable.blue_button_bg)
            }

            override fun onClear() {
                btnClear!!.background = context?.getDrawable(R.drawable.btn_gray_bg)
                btnContinue!!.background = context?.getDrawable(R.drawable.btn_gray_bg)
            }
        })

        dialog.setContentView(view)
        dialog.setOnKeyListener { arg0, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_BACK) {
                dialog.dismiss()
            }
            true
        }

        behavior = BottomSheetBehavior.from(view.parent as View)
        behavior!!.isHideable = false
        behavior!!.setBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
            override fun onStateChanged(bottomSheet: View, newState: Int) {

                if (BottomSheetBehavior.STATE_HIDDEN == newState) {
                    dismiss()
                }
            }

            override fun onSlide(bottomSheet: View, slideOffset: Float) {

            }
        })

        btnClose!!.setOnClickListener(this)
        btnClear!!.setOnClickListener(this)
        btnContinue!!.setOnClickListener(this)

        return dialog
    }

    override fun onStart() {
        super.onStart()
        behavior!!.state = BottomSheetBehavior.STATE_COLLAPSED
    }

    override fun onAttach(context: Context?) {
        super.onAttach(context)
        try {
            callback = context as OnContinueClickListener?
        } catch (e: ClassCastException) {
            throw ClassCastException(context!!.toString() + " must implement OnContinueClickListener")
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

    override fun onClick(view: View) {
        when (view){
            btnClear -> mSignaturePad!!.clear()
            btnClose -> dismiss()
            btnContinue -> {
                val signatureBitmap = mSignaturePad!!.signatureBitmap
                val signature = getBase64Signature(signatureBitmap)
                callback!!.onContinueClicked(signature)
                dismiss()
            }
        }
    }

    private fun getBase64Signature(bitmap: Bitmap): String {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)

        var byteArray = stream.toByteArray()
        bitmap.recycle()
        byteArray = compressImage(byteArray).toByteArray()

        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }

    private fun compressImage(`in`: ByteArray): ByteArrayOutputStream {
        val stream = ByteArrayOutputStream()
        var scaledBitmap: Bitmap? = null
        val options = BitmapFactory.Options()
        options.inJustDecodeBounds = true
        var bmp = BitmapFactory.decodeByteArray(`in`, 0, `in`.size, options)

        var actualHeight = options.outHeight
        var actualWidth = options.outWidth
        val maxHeight = 128.0f
        val maxWidth = 384.0f
        var imgRatio = (actualWidth / actualHeight).toFloat()
        val maxRatio = maxWidth / maxHeight

        if (actualHeight > maxHeight || actualWidth > maxWidth) {
            if (imgRatio < maxRatio) {
                imgRatio = maxHeight / actualHeight
                actualWidth = (imgRatio * actualWidth).toInt()
                actualHeight = maxHeight.toInt()
            } else if (imgRatio > maxRatio) {
                imgRatio = maxWidth / actualWidth
                actualHeight = (imgRatio * actualHeight).toInt()
                actualWidth = maxWidth.toInt()
            } else {
                actualHeight = maxHeight.toInt()
                actualWidth = maxWidth.toInt()
            }
        }

        options.inSampleSize = calculateInSampleSize(options, actualWidth, actualHeight)
        options.inJustDecodeBounds = false
        options.inTempStorage = ByteArray(16 * 2048)

        try {
            bmp = BitmapFactory.decodeByteArray(`in`, 0, `in`.size, options)
        } catch (exception: OutOfMemoryError) {
            LogUtil.e(TAG, exception.message)
            exception.printStackTrace()
        }

        try {
            scaledBitmap = Bitmap.createBitmap(actualWidth, actualHeight, Bitmap.Config.ARGB_8888)
        } catch (exception: OutOfMemoryError) {
            LogUtil.e(TAG, exception.message)
            exception.printStackTrace()
        }

        val ratioX = actualWidth / options.outWidth.toFloat()
        val ratioY = actualHeight / options.outHeight.toFloat()
        val middleX = actualWidth / 2.0f
        val middleY = actualHeight / 2.0f

        val scaleMatrix = Matrix()
        scaleMatrix.setScale(ratioX, ratioY, middleX, middleY)

        val canvas = Canvas(scaledBitmap!!)
        canvas.matrix = scaleMatrix
        canvas.drawBitmap(
            bmp, middleX - bmp.width / 2, middleY - bmp.height / 2,
            Paint(Paint.FILTER_BITMAP_FLAG)
        )

        scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 5, stream)
        scaledBitmap.recycle()

        return stream
    }

    private fun calculateInSampleSize(
        options: BitmapFactory.Options, reqWidth: Int, reqHeight: Int
    ): Int {
        // Raw height and width of image
        val height = options.outHeight
        val width = options.outWidth
        var inSampleSize = 1

        if (height > reqHeight || width > reqWidth) {

            val halfHeight = height / 2
            val halfWidth = width / 2

            // Calculate the largest inSampleSize value that is a power of 2 and keeps both
            // height and width larger than the requested height and width.
            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }

        return inSampleSize
    }

}

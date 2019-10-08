package id.mikaapp.mika.agent.cardpayment


import android.app.Dialog
import android.graphics.*
import android.os.Bundle
import android.util.Base64
import android.view.KeyEvent
import android.view.View
import com.github.gcacace.signaturepad.views.SignaturePad
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import id.mikaapp.mika.R
import kotlinx.android.synthetic.main.fragment_bottomsheet_signature.view.*
import java.io.ByteArrayOutputStream

class SignatureBottomSheetFragment : BottomSheetDialogFragment() {

    private var behavior: BottomSheetBehavior<*>? = null
    private var onSubmitListener: ((signatureBase64: String, signatureBitmap: Bitmap) -> Unit)? = null


    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = super.onCreateDialog(savedInstanceState) as BottomSheetDialog
        val view = View.inflate(context, R.layout.fragment_bottomsheet_signature, null)

        dialog.setCancelable(false)


        view.signatureBottomSheetPad.setOnSignedListener(object : SignaturePad.OnSignedListener {
            override fun onStartSigning() {

            }

            override fun onSigned() {
                view.signatureBottomSheetClear.background = context?.getDrawable(R.drawable.blue_button_bg)
                view.signatureBottomSheetContinue.background = context?.getDrawable(R.drawable.blue_button_bg)
            }

            override fun onClear() {
                view.signatureBottomSheetClear.background = context?.getDrawable(R.drawable.btn_gray_bg)
                view.signatureBottomSheetContinue.background = context?.getDrawable(R.drawable.btn_gray_bg)
            }
        })

        dialog.setContentView(view)
        dialog.setOnKeyListener { _, keyCode, _ ->
            if (keyCode == KeyEvent.KEYCODE_BACK) {
                dialog.dismiss()
            }
            true
        }

        behavior = BottomSheetBehavior.from(view.parent as View)
        behavior?.isHideable = false
        behavior?.setBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
            override fun onStateChanged(bottomSheet: View, newState: Int) {

                if (BottomSheetBehavior.STATE_HIDDEN == newState) {
                    dismiss()
                }
            }

            override fun onSlide(bottomSheet: View, slideOffset: Float) {

            }
        })

        view.signatureBottomSheetClose.setOnClickListener { dismiss() }
        view.signatureBottomSheetClear.setOnClickListener { view.signatureBottomSheetPad.clear() }
        view.signatureBottomSheetContinue.setOnClickListener {
            val signatureBitmap = view.signatureBottomSheetPad.signatureBitmap
            val signatureBase64 = getBase64Signature(signatureBitmap.copy(signatureBitmap.config, false))
            onSubmitListener?.invoke(signatureBase64, signatureBitmap.copy(signatureBitmap.config, false))
            dismiss()
        }

        return dialog
    }

    fun setOnSubmit(listener: ((signatureBase64: String, signatureBitmap: Bitmap) -> Unit)?) {
        onSubmitListener = listener
    }

    override fun onStart() {
        super.onStart()
        behavior?.state = BottomSheetBehavior.STATE_COLLAPSED
    }

    private fun getBase64Signature(bitmap: Bitmap): String {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)

        var byteArray = stream.toByteArray()
        bitmap.recycle()
        byteArray = compressImage(byteArray).toByteArray()

        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }

    private fun compressImage(imageByteArray: ByteArray): ByteArrayOutputStream {
        val stream = ByteArrayOutputStream()
        var scaledBitmap: Bitmap? = null
        val options = BitmapFactory.Options()
        options.inJustDecodeBounds = true
        var bmp = BitmapFactory.decodeByteArray(imageByteArray, 0, imageByteArray.size, options)

        var actualHeight = options.outHeight
        var actualWidth = options.outWidth
        val maxHeight = 128.0f
        val maxWidth = 384.0f
        var imgRatio = (actualWidth / actualHeight).toFloat()
        val maxRatio = maxWidth / maxHeight

        if (actualHeight > maxHeight || actualWidth > maxWidth) {
            when {
                imgRatio < maxRatio -> {
                    imgRatio = maxHeight / actualHeight
                    actualWidth = (imgRatio * actualWidth).toInt()
                    actualHeight = maxHeight.toInt()
                }
                imgRatio > maxRatio -> {
                    imgRatio = maxWidth / actualWidth
                    actualHeight = (imgRatio * actualHeight).toInt()
                    actualWidth = maxWidth.toInt()
                }
                else -> {
                    actualHeight = maxHeight.toInt()
                    actualWidth = maxWidth.toInt()
                }
            }
        }

        options.inSampleSize = calculateInSampleSize(options, actualWidth, actualHeight)
        options.inJustDecodeBounds = false
        options.inTempStorage = ByteArray(16 * 2048)

        try {
            bmp = BitmapFactory.decodeByteArray(imageByteArray, 0, imageByteArray.size, options)
        } catch (exception: OutOfMemoryError) {
            exception.printStackTrace()
        }

        try {
            scaledBitmap = Bitmap.createBitmap(actualWidth, actualHeight, Bitmap.Config.ARGB_8888)
        } catch (exception: OutOfMemoryError) {
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

    private fun calculateInSampleSize(options: BitmapFactory.Options, reqWidth: Int, reqHeight: Int): Int {
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

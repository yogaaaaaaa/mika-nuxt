package id.mikaapp.mika.ext

import android.content.Context
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.widget.ImageView
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition

fun Context.showToast(message: String, duration: Int = Toast.LENGTH_SHORT) =
    Toast.makeText(this, message, duration).show()

fun Context.loadImage(url: String, into: ImageView) = Glide.with(this).load(url).into(into)

fun Context.getBitmap(url: String, onLoaded: (Bitmap) -> Unit) {
    Glide.with(this).asBitmap().load(url).into(object : CustomTarget<Bitmap>() {
        override fun onLoadCleared(placeholder: Drawable?) {}
        override fun onResourceReady(resource: Bitmap, transition: Transition<in Bitmap>?) {
            onLoaded(resource)
        }
    })
}

fun Context.getDrawableCompat(id: Int) = ContextCompat.getDrawable(this, id)
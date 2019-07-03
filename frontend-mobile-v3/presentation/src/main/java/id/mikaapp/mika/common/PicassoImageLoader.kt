package id.mikaapp.mika.common

import android.widget.ImageView
import com.squareup.picasso.Callback
import com.squareup.picasso.Picasso

/**
 * Created by grahamdesmon on 04/04/19.
 */

class PicassoImageLoader(private val picasso: Picasso) : ImageLoader {

    override fun load(url: String, imageView: ImageView, callback: (Boolean) -> Unit) {
        picasso.load(url).into(imageView, FetchCallback(callback))
    }

    override fun load(resourceId: Int, imageView: ImageView, fadeEffect: Boolean) {
        if (fadeEffect)
            picasso.load(resourceId).into(imageView)
        else
            picasso.load(resourceId).noFade().into(imageView)
    }

    override fun load(url: String, imageView: ImageView, fadeEffect: Boolean) {
        if (fadeEffect)
            picasso.load(url).into(imageView)
        else
            picasso.load(url).noFade().into(imageView)
    }

    private class FetchCallback(val delegate: (Boolean) -> Unit): Callback {

        override fun onSuccess() {
            delegate(true)
        }

        override fun onError(e: Exception?) {
            delegate(false)
        }

    }
}
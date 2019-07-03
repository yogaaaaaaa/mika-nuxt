package id.mikaapp.mika.common

import android.widget.ImageView

/**
 * Created by grahamdesmon on 04/04/19.
 */

interface ImageLoader {
    fun load(url: String, imageView: ImageView, callback: (Boolean) -> Unit)
    fun load(url: String, imageView: ImageView, fadeEffect: Boolean = true)
    fun load(resourceId: Int, imageView: ImageView, fadeEffect: Boolean = true)
}
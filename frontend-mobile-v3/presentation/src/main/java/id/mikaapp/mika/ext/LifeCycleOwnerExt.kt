package id.mikaapp.mika.ext

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LiveData
import androidx.lifecycle.Observer

fun <T> LifecycleOwner.observe(liveData: LiveData<T>, onData: (T) -> Unit) {
    liveData.observe(this, Observer { onData(it) })
}
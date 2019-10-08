package id.mikaapp.mika.ext

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData

val <T> MutableLiveData<T>.liveData get() = this as LiveData<T>
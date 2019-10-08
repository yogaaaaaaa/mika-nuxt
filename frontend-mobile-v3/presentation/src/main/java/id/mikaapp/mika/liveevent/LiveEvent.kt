package id.mikaapp.mika.liveevent

import androidx.lifecycle.MutableLiveData

class LiveEvent<T> : MutableLiveData<T?>() {
    override fun setValue(value: T?) {
        super.setValue(value)
        super.setValue(null)
    }

    override fun postValue(value: T?) {
        super.postValue(value)
        super.postValue(null)
    }
}
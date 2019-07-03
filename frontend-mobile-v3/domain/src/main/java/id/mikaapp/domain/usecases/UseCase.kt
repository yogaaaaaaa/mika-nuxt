package id.mikaapp.domain.usecases

import id.mikaapp.domain.common.Transformer
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 01/04/19.
 */
 
abstract class UseCase<T>(private val transformer: Transformer<T>){

    abstract fun createObservable(data: Map<String, Any>? = null): Observable<T>

    fun observable(withData: Map<String, Any>? = null): Observable<T>{
        return createObservable(withData).compose(transformer)
    }
}
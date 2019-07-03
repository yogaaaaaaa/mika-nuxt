package id.mikaapp.domain.common

import id.mikaapp.domain.entities.Optional
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 01/04/19.
 */

abstract class Mapper<in E, T> {
    abstract fun mapFrom(from: E): T

    fun mapOptional(from: Optional<E>): Optional<T> {
        from.value?.let {
            return Optional.of(mapFrom(it))
        } ?: return Optional.empty()
    }

    fun observable(from: E): Observable<T> {
        return Observable.fromCallable { mapFrom(from) }
    }

    fun observable(from: List<E>): Observable<List<T>> {
        return Observable.fromCallable { from.map { mapFrom(it) } }
    }
}
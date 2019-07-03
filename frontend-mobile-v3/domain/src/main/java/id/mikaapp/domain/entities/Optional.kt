package id.mikaapp.domain.entities

/**
 * Created by grahamdesmon on 01/04/19.
 */

class Optional<out T>(val value: T? = null) {

    companion object {

        fun <T> of(value: T?): Optional<T> {
            return Optional(value)
        }

        fun <T> empty(): Optional<T> {
            return Optional()
        }
    }

    fun hasValue(): Boolean {
        return value != null
    }

}
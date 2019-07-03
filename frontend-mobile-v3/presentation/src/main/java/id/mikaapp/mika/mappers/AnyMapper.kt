package id.mikaapp.mika.mappers

import id.mikaapp.domain.common.Mapper

/**
 * Created by grahamdesmon on 10/04/19.
 */

class AnyMapper : Mapper<Any, Any>() {
    override fun mapFrom(from: Any): Any {
        return from
    }

}
package id.mikaapp.domain.entities

/**
 * Created by grahamdesmon on 08/04/19.
 */

data class Properties(
    var flows: List<String>? = null,
    var tokenTypes: List<String>? = null,
    var userTokenTypes: List<Any>? = null
)
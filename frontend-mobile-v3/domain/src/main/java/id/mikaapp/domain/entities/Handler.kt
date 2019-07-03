package id.mikaapp.domain.entities

/**
 * Created by grahamdesmon on 08/04/19.
 */

data class Handler(
    var classes: List<String>? = null,
    var name: String? = "",
    var properties: Properties? = null
)
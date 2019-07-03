package id.mikaapp.sdk.callbacks

import id.mikaapp.sdk.models.AgentResponse
import id.mikaapp.sdk.models.BasicResponse

interface AgentInfoCallback : HttpRequestCallback {

    fun onSuccess(response: AgentResponse)
    fun onFailure(errorResponse: BasicResponse)
}
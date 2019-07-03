package id.mikaapp.domain.usecases

import id.mikaapp.domain.UserRepository
import id.mikaapp.domain.common.Transformer
import id.mikaapp.domain.entities.Optional
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 08/04/19.
 */

class UserLogout(
    transformer: Transformer<Optional<Any>>,
    private val userRepository: UserRepository
) :
    UseCase<Optional<Any>>(transformer) {

    companion object {
        private const val PARAM_TOKEN = "param:token"
    }

    fun logout(username: String, password: String): Observable<Optional<Any>> {
        val data = HashMap<String, String>()
        data[PARAM_TOKEN] = username

        return observable(data)
    }

    override fun createObservable(data: Map<String, Any>?): Observable<Optional<Any>> {
        val token = data?.get(PARAM_TOKEN)

        return userRepository.logout(token as String)
    }

}
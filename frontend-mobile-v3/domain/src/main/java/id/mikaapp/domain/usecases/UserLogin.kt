package id.mikaapp.domain.usecases

import id.mikaapp.domain.UserRepository
import id.mikaapp.domain.common.Transformer
import id.mikaapp.domain.entities.Optional
import id.mikaapp.domain.entities.UserEntity
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 04/04/19.
 */

class UserLogin(
    transformer: Transformer<Optional<UserEntity>>,
    private val userRepository: UserRepository
) :
    UseCase<Optional<UserEntity>>(transformer) {

    companion object {
        private const val PARAM_LOGIN_USERNAME = "param:login_username"
        private const val PARAM_LOGIN_PASSWORD = "param:login_password"
    }

    fun login(username: String, password: String): Observable<Optional<UserEntity>> {
        val data = HashMap<String, String>()
        data[PARAM_LOGIN_USERNAME] = username
        data[PARAM_LOGIN_PASSWORD] = password

        return observable(data)
    }

    override fun createObservable(data: Map<String, Any>?): Observable<Optional<UserEntity>> {
        val username = data?.get(PARAM_LOGIN_USERNAME)
        val password = data?.get(PARAM_LOGIN_PASSWORD)

        return userRepository.login(username as String, password as String)
    }

}
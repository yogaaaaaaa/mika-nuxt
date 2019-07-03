package id.mikaapp.data.repositories

import id.mikaapp.data.api.Api
import id.mikaapp.data.mappers.UserDataEntityMapper
import id.mikaapp.domain.UserDataStore
import id.mikaapp.domain.entities.Optional
import id.mikaapp.domain.entities.UserEntity
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 04/04/19.
 */

class RemoteUserDataStore(private val api: Api) : UserDataStore {

    private val userDataMapper = UserDataEntityMapper()

    override fun login(username: String, password: String): Observable<Optional<UserEntity>> {
        return api.login(username, password).flatMap { result ->
            Observable.just(Optional.of(userDataMapper.mapFrom(result.data)))
        }
    }

    override fun logout(token: String): Observable<Optional<Any>> {
        return api.logout(token).flatMap { result ->
            Observable.just(Optional.of(result))
        }
    }

    override fun checkLoginSession(token: String): Observable<Optional<Any>> {
        return api.checkLoginSession(token).flatMap { result ->
            Observable.just(Optional.of(result))
        }
    }

}
package id.mikaapp.data.repositories

import id.mikaapp.domain.UserRepository
import id.mikaapp.domain.entities.Optional
import id.mikaapp.domain.entities.UserEntity
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 04/04/19.
 */

class UserRepositoryImpl(private val remoteDataStore: RemoteUserDataStore) : UserRepository {

    override fun login(username: String, password: String): Observable<Optional<UserEntity>> {
        return remoteDataStore.login(username, password)
    }

    override fun logout(token: String): Observable<Optional<Any>> {
        return remoteDataStore.logout(token)
    }

    override fun checkLoginSession(token: String): Observable<Optional<Any>> {
        return remoteDataStore.checkLoginSession(token)
    }

}
package id.mikaapp.domain

import id.mikaapp.domain.entities.Optional
import id.mikaapp.domain.entities.UserEntity
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 04/04/19.
 */
 
interface UserRepository{

    fun login(username:String, password:String): Observable<Optional<UserEntity>>
    fun logout(token:String):Observable<Optional<Any>>
    fun checkLoginSession(token:String):Observable<Optional<Any>>
}
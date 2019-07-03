package id.mikaapp.mika.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import id.mikaapp.domain.common.Mapper
import id.mikaapp.domain.entities.UserEntity
import id.mikaapp.domain.usecases.UserLogin
import id.mikaapp.mika.entities.User
import id.mikaapp.sdk.MikaSdk

/**
 * Created by grahamdesmon on 05/04/19.
 */

class LoginVMFactory(
    val userLogin: UserLogin,
    val mapper: Mapper<UserEntity, User>,
    val mikaSdk: MikaSdk
) : ViewModelProvider.Factory {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        return LoginViewModel(userLogin, mapper, mikaSdk) as T
    }

}
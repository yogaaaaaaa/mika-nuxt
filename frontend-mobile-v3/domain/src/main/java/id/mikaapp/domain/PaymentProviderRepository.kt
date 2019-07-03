package id.mikaapp.domain

import id.mikaapp.domain.entities.PaymentProviderEntity
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 08/04/19.
 */
 
interface PaymentProviderRepository{
    fun getPaymentProviders(token: String): Observable<List<PaymentProviderEntity>>
}
package id.mikaapp.data.repositories

import id.mikaapp.domain.PaymentProviderRepository
import id.mikaapp.domain.entities.PaymentProviderEntity
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 08/04/19.
 */

class PaymentProviderRepositoryImpl(private val remotePaymentProviderData: RemotePaymentProviderDataStore) :
    PaymentProviderRepository {

    override fun getPaymentProviders(token: String): Observable<List<PaymentProviderEntity>> {
        return remotePaymentProviderData.getPaymentProviders(token)
    }

}
package id.mikaapp.data.repositories

import id.mikaapp.data.api.Api
import id.mikaapp.data.mappers.PaymentProviderDataEntityMapper
import id.mikaapp.domain.PaymentProviderDataStore
import id.mikaapp.domain.entities.PaymentProviderEntity
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 08/04/19.
 */

class RemotePaymentProviderDataStore(private val api: Api) : PaymentProviderDataStore {

    private val paymentProviderDataMapper = PaymentProviderDataEntityMapper()

    override fun getPaymentProviders(token: String): Observable<List<PaymentProviderEntity>> {
        return api.getPaymentProviders(token).map { results ->
            results.data.map { paymentProviderDataMapper.mapFrom(it) }
        }
    }


}
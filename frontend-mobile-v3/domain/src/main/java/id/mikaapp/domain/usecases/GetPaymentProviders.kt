package id.mikaapp.domain.usecases

import id.mikaapp.domain.PaymentProviderRepository
import id.mikaapp.domain.common.Transformer
import id.mikaapp.domain.entities.PaymentProviderEntity
import io.reactivex.Observable

/**
 * Created by grahamdesmon on 08/04/19.
 */

class GetPaymentProviders(
    transformer: Transformer<List<PaymentProviderEntity>>,
    private val paymentProviderRepository: PaymentProviderRepository
) :
    UseCase<List<PaymentProviderEntity>>(transformer) {

    companion object {
        private const val PARAM_TOKEN = "param:token"
    }

    fun getPaymentProviders(token: String): Observable<List<PaymentProviderEntity>> {
        val data = HashMap<String, String>()
        data[PARAM_TOKEN] = token

        return observable(data)
    }

    override fun createObservable(data: Map<String, Any>?): Observable<List<PaymentProviderEntity>> {
        val token = data?.get(PARAM_TOKEN)

        return paymentProviderRepository.getPaymentProviders(token as String)
    }

}
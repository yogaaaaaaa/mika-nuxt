package id.getmika.ftie.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import id.getmika.ftie.message.bni.BniRequest;
import id.getmika.ftie.message.bni.BniResponse;
import id.getmika.ftie.message.bni.debit.BniDebitSaleRequest;
import id.getmika.ftie.message.bni.debit.BniDebitSaleResponse;

@RestController
public class BniDebitNoTleController extends BniBaseController {

	@PostMapping("/bni/notle/debit/sale")
	public BniDebitSaleResponse postNoTleDebitSale(@RequestBody BniDebitSaleRequest request) {
		
		return (BniDebitSaleResponse) doDebitTransaction(request, new BniDebitSaleResponse());
	}

	private BniResponse doDebitTransaction(BniRequest request, BniResponse response) {
		
		setDebitNoTleTpdu(request);		
		postNonTleTransaction(request, response, "/bni/notle/debit/sale");
		
		return response;
	}
}
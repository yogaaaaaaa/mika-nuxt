package id.getmika.ftie.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import id.getmika.ftie.message.bni.BniRequest;
import id.getmika.ftie.message.bni.BniResponse;
import id.getmika.ftie.message.bni.credit.BniCreditBatchUploadRequest;
import id.getmika.ftie.message.bni.credit.BniCreditBatchUploadResponse;
import id.getmika.ftie.message.bni.credit.BniCreditInstallmentRequest;
import id.getmika.ftie.message.bni.credit.BniCreditInstallmentResponse;
import id.getmika.ftie.message.bni.credit.BniCreditLoadKeyRequest;
import id.getmika.ftie.message.bni.credit.BniCreditLoadKeyResponse;
import id.getmika.ftie.message.bni.credit.BniCreditPointInquiryRequest;
import id.getmika.ftie.message.bni.credit.BniCreditPointInquiryResponse;
import id.getmika.ftie.message.bni.credit.BniCreditRedeemRequest;
import id.getmika.ftie.message.bni.credit.BniCreditRedeemResponse;
import id.getmika.ftie.message.bni.credit.BniCreditReversalRequest;
import id.getmika.ftie.message.bni.credit.BniCreditReversalResponse;
import id.getmika.ftie.message.bni.credit.BniCreditReversalVoidRequest;
import id.getmika.ftie.message.bni.credit.BniCreditReversalVoidResponse;
import id.getmika.ftie.message.bni.credit.BniCreditSaleRequest;
import id.getmika.ftie.message.bni.credit.BniCreditSaleResponse;
import id.getmika.ftie.message.bni.credit.BniCreditSettlementRequest;
import id.getmika.ftie.message.bni.credit.BniCreditSettlementResponse;
import id.getmika.ftie.message.bni.credit.BniCreditVoidRequest;
import id.getmika.ftie.message.bni.credit.BniCreditVoidResponse;

@RestController
public class BniCreditController extends BniBaseController {
	
	@PostMapping("/bni/credit/sale")
	public BniCreditSaleResponse postCreditSale(@RequestBody BniCreditSaleRequest request) {
			
		return (BniCreditSaleResponse) doCreditTransaction(request, new BniCreditSaleResponse(), "/bni/credit/sale");
	}
	
	@PostMapping("/bni/credit/void")
	public BniCreditVoidResponse postCreditVoid(@RequestBody BniCreditVoidRequest request) {

		return (BniCreditVoidResponse) doCreditTransaction(request, new BniCreditVoidResponse(), "/bni/credit/void");
	}
	
	@PostMapping("/bni/credit/reversal")
	public BniCreditReversalResponse postCreditReversal(@RequestBody BniCreditReversalRequest request) {
		
		return (BniCreditReversalResponse) doCreditTransaction(request, new BniCreditReversalResponse(), "/bni/credit/reversal");
	}
	
	@PostMapping("/bni/credit/reversalvoid")
	public BniCreditReversalVoidResponse postCreditReversalVoid(@RequestBody BniCreditReversalVoidRequest request) {
		
		return (BniCreditReversalVoidResponse) doCreditTransaction(request, new BniCreditReversalVoidResponse(), "/bni/credit/reversalvoid");
	}
	
	@PostMapping("/bni/credit/settlement")
	public BniCreditSettlementResponse postCreditSettlement(@RequestBody BniCreditSettlementRequest request) {
		
		return (BniCreditSettlementResponse) doCreditTransaction(request, new BniCreditSettlementResponse(), "/bni/credit/settlement");
	}
	
	@PostMapping("/bni/credit/batchupload")
	public BniCreditBatchUploadResponse postCreditBatchUpload(@RequestBody BniCreditBatchUploadRequest request) {
		
		return (BniCreditBatchUploadResponse) doCreditTransaction(request, new BniCreditBatchUploadResponse(), "/bni/credit/batchupload");
	}
	
	@PostMapping("/bni/credit/loadkey")
	public BniCreditLoadKeyResponse postCreditLoadKey(@RequestBody BniCreditLoadKeyRequest request) {
		
		return (BniCreditLoadKeyResponse) doCreditTransaction(request, new BniCreditLoadKeyResponse(request.getTleOptions().getLtwkDEK()), "/bni/credit/loadkey");
	}
	
	@PostMapping("/bni/credit/installment")
	public BniCreditInstallmentResponse postCreditInstallment(@RequestBody BniCreditInstallmentRequest request) {
		
		return (BniCreditInstallmentResponse) doCreditTransaction(request, new BniCreditInstallmentResponse(), "/bni/credit/installment");
	}
	
	@PostMapping("/bni/credit/pointinquiry")
	public BniCreditPointInquiryResponse postCreditPointInquiry(@RequestBody BniCreditPointInquiryRequest request) {
		
		return (BniCreditPointInquiryResponse) doCreditTransaction(request, new BniCreditPointInquiryResponse(),"/bni/credit/pointinquiry");
	}
	
	@PostMapping("/bni/credit/redeem")
	public BniCreditRedeemResponse postCreditPartialRedeem(@RequestBody BniCreditRedeemRequest request) {
		
		return (BniCreditRedeemResponse) doCreditTransaction(request, new BniCreditRedeemResponse(), "/bni/credit/redeem");
	}
	
	private BniResponse doCreditTransaction(BniRequest request, BniResponse response, String logmsg) {
		
		setCreditTpdu(request);
		postTransaction(request, response, logmsg);
		
		return response;
	}
}

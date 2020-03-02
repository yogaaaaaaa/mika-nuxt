package id.getmika.ftie.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import id.getmika.ftie.message.bni.BniRequest;
import id.getmika.ftie.message.bni.BniResponse;
import id.getmika.ftie.message.bni.debit.BniDebitBalanceInquiryRequest;
import id.getmika.ftie.message.bni.debit.BniDebitBalanceInquiryResponse;
import id.getmika.ftie.message.bni.debit.BniDebitBatchUploadRequest;
import id.getmika.ftie.message.bni.debit.BniDebitBatchUploadResponse;
import id.getmika.ftie.message.bni.debit.BniDebitCashRequest;
import id.getmika.ftie.message.bni.debit.BniDebitCashResponse;
import id.getmika.ftie.message.bni.debit.BniDebitChannelRegistrationRequest;
import id.getmika.ftie.message.bni.debit.BniDebitChannelRegistrationResponse;
import id.getmika.ftie.message.bni.debit.BniDebitPaymentInquiryRequest;
import id.getmika.ftie.message.bni.debit.BniDebitPaymentInquiryResponse;
import id.getmika.ftie.message.bni.debit.BniDebitPaymentRequest;
import id.getmika.ftie.message.bni.debit.BniDebitPaymentResponse;
import id.getmika.ftie.message.bni.debit.BniDebitReversalRequest;
import id.getmika.ftie.message.bni.debit.BniDebitReversalResponse;
import id.getmika.ftie.message.bni.debit.BniDebitSaleRequest;
import id.getmika.ftie.message.bni.debit.BniDebitSaleResponse;
import id.getmika.ftie.message.bni.debit.BniDebitSettlementRequest;
import id.getmika.ftie.message.bni.debit.BniDebitSettlementResponse;
import id.getmika.ftie.message.bni.debit.BniDebitSmsBankingVerifyRequest;
import id.getmika.ftie.message.bni.debit.BniDebitSmsBankingVerifyResponse;
import id.getmika.ftie.message.bni.debit.BniDebitTopUpBniRequest;
import id.getmika.ftie.message.bni.debit.BniDebitTopUpBniResponse;
import id.getmika.ftie.message.bni.debit.BniDebitTopUpPhoneRequest;
import id.getmika.ftie.message.bni.debit.BniDebitTopUpPhoneResponse;
import id.getmika.ftie.message.bni.debit.BniDebitTransferInquiryRequest;
import id.getmika.ftie.message.bni.debit.BniDebitTransferInquiryResponse;
import id.getmika.ftie.message.bni.debit.BniDebitTransferRequest;
import id.getmika.ftie.message.bni.debit.BniDebitTransferResponse;
import id.getmika.ftie.message.bni.debit.BniDebitVoidRequest;
import id.getmika.ftie.message.bni.debit.BniDebitVoidResponse;

@RestController
public class BniDebitController extends BniBaseController {

	@PostMapping("/bni/debit/sale")
	public BniDebitSaleResponse postDebitSale(@RequestBody BniDebitSaleRequest request) {
		
		return (BniDebitSaleResponse) doDebitTransaction(request, new BniDebitSaleResponse(), "/bni/debit/sale");
	}
	
	@PostMapping("/bni/debit/void")
	public BniDebitVoidResponse postDebitVoid(@RequestBody BniDebitVoidRequest request) {
		
		return (BniDebitVoidResponse) doDebitTransaction(request, new BniDebitVoidResponse(), "/bni/debit/void");
	}
	
	@PostMapping("/bni/debit/reversal")
	public BniDebitReversalResponse postDebitReversal(@RequestBody BniDebitReversalRequest request) {
				
		return (BniDebitReversalResponse) doDebitTransaction(request, new BniDebitReversalResponse(), "/bni/debit/reversal");
	}
	
	@PostMapping("/bni/debit/settlement")
	public BniDebitSettlementResponse postDebitSettlement(@RequestBody BniDebitSettlementRequest request) {
		
		return (BniDebitSettlementResponse) doDebitTransaction(request, new BniDebitSettlementResponse(), "/bni/debit/settlement");
	}
	
	@PostMapping("/bni/debit/batchupload")
	public BniDebitBatchUploadResponse postDebitBatchUpload(@RequestBody BniDebitBatchUploadRequest request) {
				
		return (BniDebitBatchUploadResponse) doDebitTransaction(request, new BniDebitBatchUploadResponse(), "/bni/debit/batchupload");
	}
	
	@PostMapping("/bni/debit/balance")
	public BniDebitBalanceInquiryResponse postDebitBalance(@RequestBody BniDebitBalanceInquiryRequest request) {
		
		return (BniDebitBalanceInquiryResponse) doDebitTransaction(request, new BniDebitBalanceInquiryResponse(), "/bni/debit/balance");
	}
	
	@PostMapping("/bni/debit/cash")
	public BniDebitCashResponse postDebitCash(@RequestBody BniDebitCashRequest request) {
		
		return (BniDebitCashResponse) doDebitTransaction(request, new BniDebitCashResponse(), "/bni/debit/cash");
	}
	
	@PostMapping("/bni/debit/paymentinquiry")
	public BniDebitPaymentInquiryResponse postDebitPaymentInquiry(@RequestBody BniDebitPaymentInquiryRequest request) {
		
		return (BniDebitPaymentInquiryResponse) doDebitTransaction(request, new BniDebitPaymentInquiryResponse(), "/bni/debit/paymentinquiry");
	}
	
	@PostMapping("/bni/debit/payment")
	public BniDebitPaymentResponse postDebitPayment(@RequestBody BniDebitPaymentRequest request) {
		
		return (BniDebitPaymentResponse) doDebitTransaction(request, new BniDebitPaymentResponse(), "/bni/debit/payment");
	}
	
	@PostMapping("/bni/debit/topupphone")
	public BniDebitTopUpPhoneResponse postDebitTopUpPhone(@RequestBody BniDebitTopUpPhoneRequest request) {
		
		return (BniDebitTopUpPhoneResponse) doDebitTransaction(request, new BniDebitTopUpPhoneResponse(), "/bni/debit/topupphone");
	}
	
	@PostMapping("/bni/debit/topupbni")
	public BniDebitTopUpBniResponse postDebitTopUpBni(@RequestBody BniDebitTopUpBniRequest request) {
		
		return (BniDebitTopUpBniResponse) doDebitTransaction(request, new BniDebitTopUpBniResponse(), "/bni/debit/topupbni");
	}
	
	@PostMapping("/bni/debit/transferinquiry")
	public BniDebitTransferInquiryResponse postDebitTransferInquiry(@RequestBody BniDebitTransferInquiryRequest request) {
		
		return (BniDebitTransferInquiryResponse) doDebitTransaction(request, new BniDebitTransferInquiryResponse(), "/bni/debit/transferinquiry");
	}
	
	@PostMapping("/bni/debit/transfer")
	public BniDebitTransferResponse postDebitTransfer(@RequestBody BniDebitTransferRequest request) {
		
		return (BniDebitTransferResponse) doDebitTransaction(request, new BniDebitTransferResponse(), "/bni/debit/transfer");
	}
	
	@PostMapping("/bni/debit/smsverify")
	public BniDebitSmsBankingVerifyResponse postDebitSmsVerify(@RequestBody BniDebitSmsBankingVerifyRequest request) {
		
		return (BniDebitSmsBankingVerifyResponse) doDebitTransaction(request, new BniDebitSmsBankingVerifyResponse(), "/bni/debit/smsverify");
	}
	
	@PostMapping("/bni/debit/registration")
	public BniDebitChannelRegistrationResponse postDebitRegistration(@RequestBody BniDebitChannelRegistrationRequest request) {
		
		return (BniDebitChannelRegistrationResponse) doDebitTransaction(request, new BniDebitChannelRegistrationResponse(), "/bni/debit/registration");
	}
	
	private BniResponse doDebitTransaction(BniRequest request, BniResponse response, String logmsg) {
		
		setDebitTpdu(request);		
		postTransaction(request, response, logmsg);
		
		return response;
	}
}

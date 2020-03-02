package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.message.DataElement;

public class BniDebitPaymentInquiryRequest extends BniDebitInquiryRequest {

	public BniDebitPaymentInquiryRequest() {
		super();
		tm.getIsomsg().addDE(new DataElement(3, 340000, 6));
		tm.getIsomsg().addDE(new DataElement(4, 0, 12));
	}
	
}

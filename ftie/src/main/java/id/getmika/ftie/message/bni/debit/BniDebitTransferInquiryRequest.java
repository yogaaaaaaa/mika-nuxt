package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;

public class BniDebitTransferInquiryRequest extends BniDebitInquiryRequest {

	public BniDebitTransferInquiryRequest() {
		super();
	}
	
	@Override
	public void setProcessingCode(String processingCode) {
		super.setProcessingCode(processingCode);
		if (getProcessingCode() != 321000 && getProcessingCode() != 322000)
			throw new IllegalArgumentException("Invalid processing code");
		this.tm.getIsomsg().addDE(new DataElement(3, getProcessingCode(), 6));
	}
	
	@Override
	public void setAmount(String amount) {
		super.setAmount(amount);
		tm.getIsomsg().addDE(new DataElement(4, getAmount(), 12));	
	}
	
	public void setPrivateData63(String privateData63) {
		if (privateData63.length() != 40)
			throw new IllegalArgumentException("Must be 40 chars PrivateData63: " + privateData63);
		tm.getIsomsg().addDE(new DataElement(63, privateData63).setPacked(true).setL4(EncodeType.BCD).setLnVal(20));	
	}
}

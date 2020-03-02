package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniRequest;

public class BniDebitSettlementRequest extends BniRequest {

	public BniDebitSettlementRequest() {
		super(500);		
	}
	
	@Override
	public void setProcessingCode(String processingCode) {
		super.setProcessingCode(processingCode);
		if (getProcessingCode() != 920000 && getProcessingCode() != 960000)
			throw new IllegalArgumentException("Invalid ProcessingCode: " + processingCode);
		tm.getIsomsg().addDE(new DataElement(3, getProcessingCode(), 6));
	}
	
	public void setPrivateData60(String privateData60) {
		if (privateData60.length() != 12)
			throw new IllegalArgumentException("Must be 12 chars PrivateData60: " + privateData60);
		this.tm.getIsomsg().addDE(new DataElement(60, privateData60).setPacked(true).setL4(EncodeType.BCD).setLnVal(6));
	}
	
	public void setPrivateData63(String privateData63) {
		if (privateData63.length() != 180)
			throw new IllegalArgumentException("Must be 180 chars PrivateData60: " + privateData63);
		this.tm.getIsomsg().addDE(new DataElement(60, privateData63).setPacked(true).setL4(EncodeType.BCD).setLnVal(90));
	}
}

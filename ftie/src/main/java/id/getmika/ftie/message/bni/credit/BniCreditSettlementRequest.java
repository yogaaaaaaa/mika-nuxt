package id.getmika.ftie.message.bni.credit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniRequest;

public class BniCreditSettlementRequest extends BniRequest {

	public BniCreditSettlementRequest() {
		super(500);
		tm.getIsomsg().addDE(new DataElement(3, 920000, 6));
	}
		
	public void setPrivateData60(String privateData60) {
		if (privateData60.length() != 14)
			throw new IllegalArgumentException("Must be 14 chars PrivateData60: " + privateData60);
		tm.getIsomsg().addDE(new DataElement(60, privateData60));
	}

	public void setPrivateData63(String privateData63) {
		this.tm.getIsomsg().addDE(new DataElement(63, privateData63).setL3(EncodeType.BCD));		
	}
}

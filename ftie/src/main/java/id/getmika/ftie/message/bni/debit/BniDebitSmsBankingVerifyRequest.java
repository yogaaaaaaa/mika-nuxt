package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;

public class BniDebitSmsBankingVerifyRequest extends BniDebitInquiryRequest {
	
	public BniDebitSmsBankingVerifyRequest() {
		tm.getIsomsg().addDE(new DataElement(3, 330000, 6));
		tm.getIsomsg().addDE(new DataElement(4, 0, 12));
	}
	
	public void setPrivateData48(String data) {
		if (data.length() != 62)
			throw new IllegalArgumentException("Must be 62 chars PrivateData48: " + data);
		tm.getIsomsg().addDE((new DataElement(48, data)).setPacked(true).setL4(EncodeType.BCD).setLnVal(31));
	}
	
}

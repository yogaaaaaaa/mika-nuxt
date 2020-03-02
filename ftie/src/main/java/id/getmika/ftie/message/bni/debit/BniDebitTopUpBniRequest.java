package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;

public class BniDebitTopUpBniRequest extends BniDebitPaymentRequest {

	public void setPrivateData48(String data) {
		if (data.length() != 40)
			throw new IllegalArgumentException("Must be 40 chars PrivateData48: " + data);
		tm.getIsomsg().addDE((new DataElement(48, data)).setPacked(true).setL4(EncodeType.BCD).setLnVal(20));
	}	
}

package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;

public class BniDebitTopUpPhoneRequest extends BniDebitPaymentRequest {

	public void setPrivateData48(String data) {
		if (data.length() != 46)
			throw new IllegalArgumentException("Must be 46 chars PrivateData48: " + data); 
		tm.getIsomsg().addDE((new DataElement(48, data)).setPacked(true).setL4(EncodeType.BCD).setLnVal(23));
	}
}

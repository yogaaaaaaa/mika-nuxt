package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;

public class BniDebitPaymentInquiryResponse extends BniDebitInquiryResponse {

	public BniDebitPaymentInquiryResponse() {
		super();
		tm.getIsomsg().addDE(new DataElement(48, DataType.NUMERIC, 155).setL4(EncodeType.BCD).setLnVal(155));
	}
	
	public String getPrivateData48() {
		if (!isBeenParsed())
			return null;
		DataElement de = this.tm.getIsomsg().getDE(48);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData44 - DE 48");
			return null;
		}
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
	}
	
}

package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;

public class BniDebitBalanceInquiryResponse extends BniDebitInquiryResponse {

	public BniDebitBalanceInquiryResponse() {
		super();		
		tm.getIsomsg().addDE(new DataElement(62, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
	}
	
	public String getPrivateData62() {
		if (!isBeenParsed())
			return null;
		DataElement de = this.tm.getIsomsg().getDE(62);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData62 - DE 62");
			return null;
		}
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
	}
}

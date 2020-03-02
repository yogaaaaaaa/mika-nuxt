package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;

public class BniDebitSmsBankingVerifyResponse extends BniDebitInquiryResponse {
	
	public BniDebitSmsBankingVerifyResponse() {
		tm.getIsomsg().addDE((new DataElement(48, DataType.NUMERIC, 31)).setL4(EncodeType.BCD).setLnVal(31));
		tm.getIsomsg().addDE((new DataElement(62, DataType.ALPHANUMERIC, 1)).setL4(EncodeType.BCD));
	}
	
	public String getPrivateData48() {
		if (!isBeenParsed())
			return null; 
		DataElement de = this.tm.getIsomsg().getDE(48);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData48 - DE 48");
			return null;
		}
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
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

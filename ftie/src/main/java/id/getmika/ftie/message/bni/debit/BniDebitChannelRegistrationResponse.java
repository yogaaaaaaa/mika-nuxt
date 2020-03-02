package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;

public class BniDebitChannelRegistrationResponse extends BniDebitInquiryResponse {

	public BniDebitChannelRegistrationResponse() {
		tm.getIsomsg().addDE((new DataElement(48, DataType.NUMERIC, 31)).setL4(EncodeType.BCD).setLnVal(31));
		tm.getIsomsg().addDE((new DataElement(62, DataType.NUMERIC, 10)).setL4(EncodeType.BCD).setLnVal(10));
		tm.getIsomsg().addDE((new DataElement(63, DataType.NUMERIC, 20)).setL4(EncodeType.BCD).setLnVal(20));
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
	
	public String getPrivateData63() {
		if (!isBeenParsed())
			return null; 
		DataElement de = this.tm.getIsomsg().getDE(63);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData63 - DE 63");
			return null;
		}
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
	}
}

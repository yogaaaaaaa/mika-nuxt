package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniResponse;

public class BniDebitSettlementResponse extends BniResponse {

	public BniDebitSettlementResponse() {
		super();
		tm.getIsomsg().addDE(new DataElement(37, DataType.ALPHANUMERIC, 12));
		tm.getIsomsg().addDE(new DataElement(55, DataType.ALPHANUMERIC, 1).setL3(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(63, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
	}
	
	public String getReferenceNumber() {
		if (!isBeenParsed())
			return null;
		DataElement de = this.tm.getIsomsg().getDE(37);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing ReferenceNumber - DE 37");
			return null;
		}
		return de.toString();
	}
	
	public String getEmvData() {
		if (!isBeenParsed())
			return null;
		DataElement de = this.tm.getIsomsg().getDE(55);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing EmvData - DE 55");
			return null;
		}
		return de.toString();
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

package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniResponse;

public class BniDebitVoidResponse extends BniResponse {

	public BniDebitVoidResponse() {
		super();
		tm.getIsomsg().addDE(new DataElement(4, DataType.NUMERIC, 12));
		tm.getIsomsg().addDE(new DataElement(37, DataType.ALPHANUMERIC, 12));
		tm.getIsomsg().addDE(new DataElement(38, DataType.ALPHANUMERIC, 6));
		tm.getIsomsg().addDE(new DataElement(55, DataType.ALPHANUMERIC, 1).setL3(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(63, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
	}
	
	public String getAmount() {
		if (!isBeenParsed())
			return null;
		DataElement de = this.tm.getIsomsg().getDE(4);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing Amount - DE 4");
			return null;
		}
			
		return Long.toString(de.toLong());
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
	
	public String getApprovalCode() {
		if (!isBeenParsed())
			return null;
		DataElement de = this.tm.getIsomsg().getDE(38);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing ApprovalCode - DE 38");
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

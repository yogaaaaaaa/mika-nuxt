package id.getmika.ftie.message.bni.credit;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniResponse;

public class BniCreditReversalResponse extends BniResponse {

	public BniCreditReversalResponse() {
		super();
		tm.getIsomsg().addDE(new DataElement(38, DataType.ALPHANUMERIC, 6));
		tm.getIsomsg().addDE(new DataElement(61, DataType.ALPHANUMERIC, 1).setL3(EncodeType.BCD));
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
	
	public String getPrivateData61() {
		if (!isBeenParsed())
			return null;
		DataElement de = this.tm.getIsomsg().getDE(61);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData63 - DE 61");
			return null;
		}
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
	}
}

package id.getmika.ftie.message.bni.credit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.bni.BniResponse;

public class BniCreditSaleResponse extends BniResponse {
	
	public BniCreditSaleResponse() {
		super();
		tm.getIsomsg().addDE(new DataElement(4, DataType.NUMERIC, 12));
		tm.getIsomsg().addDE(new DataElement(37, DataType.ALPHANUMERIC, 12));
		tm.getIsomsg().addDE(new DataElement(38, DataType.ALPHANUMERIC, 6));
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
}

package id.getmika.ftie.message.bni.credit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;

public class BniCreditRedeemResponse extends BniCreditPointResponse {

	public BniCreditRedeemResponse() {
		super();
		tm.getIsomsg().addDE(new DataElement(4, DataType.NUMERIC, 12));
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
}

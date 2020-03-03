package id.getmika.ftie.message.bni.credit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.bni.BniResponse;

public class BniCreditBatchUploadResponse extends BniResponse {

	public BniCreditBatchUploadResponse() {
		super();
		tm.getIsomsg().addDE(new DataElement(37, DataType.ALPHANUMERIC, 12));
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
}
package id.getmika.ftie.message.bni.credit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.bni.BniRequest;

public class BniCreditLoadKeyRequest extends BniRequest {

	public BniCreditLoadKeyRequest() {
		super(100);
	}
	
	@Override
	public void setProcessingCode(String processingCode) {
		super.setProcessingCode(processingCode);
		if (getProcessingCode() != 860000 && getProcessingCode() != 870000)
			throw new IllegalArgumentException("Invalid processing code");
		this.tm.getIsomsg().addDE(new DataElement(3, getProcessingCode(), 6));
	}
}

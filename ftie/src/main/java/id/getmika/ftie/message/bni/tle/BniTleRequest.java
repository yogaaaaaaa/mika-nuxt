package id.getmika.ftie.message.bni.tle;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.bni.BniRequest;

public class BniTleRequest extends BniRequest {

	public BniTleRequest() {
		super(800);
	}
	
	@Override
	public void setProcessingCode(String processingCode) {
		tm.getIsomsg().addDE(new DataElement(3, Integer.parseInt(processingCode), 6));
	}
}

package id.getmika.ftie.message.bni.debit;

import id.getmika.ftie.message.DataElement;

public class BniDebitBalanceInquiryRequest extends BniDebitInquiryRequest {

	public BniDebitBalanceInquiryRequest() {
		super();
		tm.getIsomsg().addDE(new DataElement(4, 0, 12));
		tm.getIsomsg().addDE(new DataElement(25, 0, 2));
	}
	
	@Override
	public void setProcessingCode(String processingCode) {
		super.setProcessingCode(processingCode);
		if (getProcessingCode() != 311000 && getProcessingCode() != 312000)
			throw new IllegalArgumentException("Invalid processing code");
		this.tm.getIsomsg().addDE(new DataElement(3, getProcessingCode(), 6));
	}
	
	@Override
	public void setAppPan(String appPan) {
		super.setAppPan(appPan);
		tm.getIsomsg().addDE(new DataElement(23, getAppPan(), 3));
	}
	
	@Override
	public void setPosCode(String posCode) {
		super.setPosCode(posCode);
		tm.getIsomsg().addDE(new DataElement(25, getPosCode(), 2));
	}
}

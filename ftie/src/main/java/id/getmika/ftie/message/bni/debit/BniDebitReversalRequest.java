package id.getmika.ftie.message.bni.debit;

import java.time.LocalDate;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniRequest;

public class BniDebitReversalRequest extends BniRequest {

	public BniDebitReversalRequest() {
		super(400);
	}
	
	@Override
	public void setPan(String pan) {
		super.setPan(pan);
		int len = pan.length();
		tm.getIsomsg().addDE(new DataElement(2, getPan(), len).setL2(EncodeType.BCD).setLnVal(len));
	}
	
	@Override
	public void setProcessingCode(String processingCode) {
		super.setProcessingCode(processingCode);
		this.tm.getIsomsg().addDE(new DataElement(3, getProcessingCode(), 6));
	}
	
	@Override
	public void setAmount(String amount) {
		super.setAmount(amount);
		tm.getIsomsg().addDE(new DataElement(4, getAmount(), 12));	
	}
	
	@Override
	public void setExpirationDate(String expirationDate) {
		super.setExpirationDate(expirationDate);
		LocalDate ldt = getExpirationDate();
		int de14 = (ldt.getYear() - 2000) * 100 + ldt.getMonthValue();
		tm.getIsomsg().addDE(new DataElement(14, de14, 4));
	}
	
	@Override
	public void setEntryMode(String entryMode) {
		super.setEntryMode(entryMode);
		tm.getIsomsg().addDE(new DataElement(22, getEntryMode(), 3));
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
	
	@Override
	public void setTrack2(String track2) {
		super.setTrack2(track2);
		tm.getIsomsg().addDE((new DataElement(35, getTrack2())).setPacked(true).setL2(EncodeType.BCD).setLnVal(getTrack2Length()));	
	}
	
	@Override
	public void setReferenceNumber(String referenceNumber) {
		super.setReferenceNumber(referenceNumber);
		tm.getIsomsg().addDE(new DataElement(37, referenceNumber));
	}
	
	@Override
	public void setApprovalCode(String approvalCode) {
		super.setApprovalCode(approvalCode);
		tm.getIsomsg().addDE(new DataElement(38, approvalCode));
	}
	
	public void setPrivateData62(String privateData62) {
		if (privateData62.length() != 12)
			throw new IllegalArgumentException("Must be 12 chars PrivateData62: " + privateData62);
		tm.getIsomsg().addDE(new DataElement(62, privateData62).setPacked(true).setL4(EncodeType.BCD).setLnVal(6));	
	}
}

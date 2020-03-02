package id.getmika.ftie.message.bni.debit;

import java.time.ZonedDateTime;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniRequest;

public class BniDebitCashRequest extends BniRequest {

	public BniDebitCashRequest() {
		super(200);
		tm.getIsomsg().addDE(new DataElement(25, 0, 2));
	}
	
	@Override
	public void setProcessingCode(String processingCode) {
		super.setProcessingCode(processingCode);
		if (getProcessingCode() != 11000 && getProcessingCode() != 12000)
			throw new IllegalArgumentException("Invalid processing code");
		this.tm.getIsomsg().addDE(new DataElement(3, getProcessingCode(), 6));
	}
	
	@Override
	public void setAmount(String amount) {
		super.setAmount(amount);
		tm.getIsomsg().addDE(new DataElement(4, getAmount(), 12));	
	}
	
	@Override
	public void setTransmissionDateTime(String strdttm) {
		super.setTransmissionDateTime(strdttm);
		ZonedDateTime zdt = getTransmissionDateTime();
		int time = zdt.getHour() * 10000 + zdt.getMinute() * 100 + zdt.getSecond();
		int date = zdt.getMonthValue() * 100000000 + zdt.getDayOfMonth() * 1000000;
		this.tm.getIsomsg().addDE(new DataElement(7, date + time, 10));
	}
	
	@Override
	public void setTransactionDateTime(String transactionDateTime) {
		super.setTransactionDateTime(transactionDateTime);
		ZonedDateTime zdt = getTransactionDateTime();
		int time = zdt.getHour() * 10000 + zdt.getMinute() * 100 + zdt.getSecond();
		int date = zdt.getMonthValue() * 100 + zdt.getDayOfMonth();
		this.tm.getIsomsg().addDE(new DataElement(12, time, 6));
		this.tm.getIsomsg().addDE(new DataElement(13, date, 4));		
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
	public void setPinBlock(String pinBlock) {
		super.setPinBlock(pinBlock);
		tm.getIsomsg().addDE(new DataElement(52, pinBlock).setPacked(true));		
	}
	
	@Override
	public void setEmvData(String emvData) {
		super.setEmvData(emvData);
		tm.getIsomsg().addDE(new DataElement(55, emvData).setPacked(true).setL3(EncodeType.BCD));
	}
}

package id.getmika.ftie.message.bni.debit;

import java.time.ZonedDateTime;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniRequest;

public class BniDebitChannelRegistrationRequest extends BniRequest {
	
	public BniDebitChannelRegistrationRequest() {
		super(200);
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
	
	public void setPrivateData48(String data) {
		if (data.length() != 62)
			throw new IllegalArgumentException("Must be 62 chars PrivateData48: " + data);
		tm.getIsomsg().addDE((new DataElement(48, data)).setPacked(true).setL4(EncodeType.BCD).setLnVal(31));
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

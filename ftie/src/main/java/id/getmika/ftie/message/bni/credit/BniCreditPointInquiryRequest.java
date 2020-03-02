package id.getmika.ftie.message.bni.credit;

import java.time.ZonedDateTime;

import id.getmika.ftie.message.DataElement;

public class BniCreditPointInquiryRequest extends BniCreditPointRequest {

	public BniCreditPointInquiryRequest() {
		super();
		tm.getIsomsg().addDE(new DataElement(3, 380000, 6));
		tm.getIsomsg().addDE(new DataElement(4, 0, 12));
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
}

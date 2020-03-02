package id.getmika.ftie.message.bni.credit;

import id.getmika.ftie.message.DataElement;

public class BniCreditRedeemRequest extends BniCreditPointRequest {

	public BniCreditRedeemRequest() {
		super();
		tm.getIsomsg().addDE(new DataElement(3, 0, 6));
		this.tm.getIsomsg().addDE(new DataElement(23, 0, 3));
	}
	
	@Override
	public void setAmount(String amount) {
		super.setAmount(amount);
		tm.getIsomsg().addDE(new DataElement(4, getAmount(), 12));	
	}
}

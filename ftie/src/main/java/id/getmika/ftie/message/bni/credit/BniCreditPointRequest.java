package id.getmika.ftie.message.bni.credit;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniRequest;

public class BniCreditPointRequest extends BniRequest {

	public BniCreditPointRequest() {
		super(200);
		tm.getIsomsg().addDE(new DataElement(25, 0, 2));
	}
	
	@Override
	public void setEntryMode(String entryMode) {
		super.setEntryMode(entryMode);
		tm.getIsomsg().addDE(new DataElement(22, getEntryMode(), 3));
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
	
	public void setPrivateData61(String privateData61) {
		tm.getIsomsg().addDE(new DataElement(61, privateData61).setPacked(true).setL3(EncodeType.BCD));
	}
	
	public void setPrivateData62(String privateData62) {
		tm.getIsomsg().addDE(new DataElement(62, privateData62).setPacked(true).setL3(EncodeType.BCD));
	}
	
}

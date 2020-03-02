package id.getmika.ftie.message.bni.tle;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniResponse;

public class BniTleResponse extends BniResponse {

	public BniTleResponse() {
		super();
		tm.getIsomsg().addDE(new DataElement(62, DataType.ALPHANUMERIC, 1).setL3(EncodeType.BCD));
	}
	
	public String getPrivateData62() {
		if (!isBeenParsed())
			return null;
		DataElement de = this.tm.getIsomsg().getDE(62);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData62 - DE 62");
			return null;
		}
		return CommonUtil.bytesToHexString(de.getBytes());
	}
}

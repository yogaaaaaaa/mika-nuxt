package id.getmika.ftie.message.bni.credit;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.bni.BniResponse;

public class BniCreditLoadKeyResponse extends BniResponse {

	private String ltwkDEK;
	
	public BniCreditLoadKeyResponse(String key) {
		super();
		this.ltwkDEK = key;
		tm.getIsomsg().addDE(new DataElement(58, DataType.ALPHANUMERIC, 1).setL3(EncodeType.BCD));
	}
	
	public String getPrivateData58() {
	    if (!isBeenParsed())
	      return null; 
	    DataElement de = this.tm.getIsomsg().getDE(57);
	    if (de == null) {
	      getMeta().setStatus("01");
	      getMeta().setReason("missing PrivateData57 - DE 57");
	      return null;
	    } 
	    byte[] enctext = new byte[24];
	    System.arraycopy(de.getBytes(), 38, enctext, 0, 24);
	    
	    byte[] key = CommonUtil.hexStringToBytes(this.ltwkDEK);
	    try {
	      byte[] data58 = new byte[21];
	      System.arraycopy(decrypt3DES(enctext, key, new byte[8]), 4, data58, 0, 19);
	      return CommonUtil.bytesToHexString(data58);
	    } catch (Exception e) {
	      return e.getMessage();
	    } 
	  }

	  
	  private byte[] decrypt3DES(byte[] enctext, byte[] tdesKeyData, byte[] initVector) throws Exception {
	    byte[] key;
	    if (tdesKeyData.length == 16) {
	      key = new byte[24];
	      System.arraycopy(tdesKeyData, 0, key, 0, 16);
	      System.arraycopy(tdesKeyData, 0, key, 16, 8);
	    } else {
	      
	      key = tdesKeyData;
	    } 
	    
	    Cipher c3des = Cipher.getInstance("DESede/CBC/NoPadding");
	    SecretKeySpec myKey = new SecretKeySpec(key, "DESede");
	    IvParameterSpec ivspec = new IvParameterSpec(initVector);
	    c3des.init(2, myKey, ivspec);
	    return c3des.doFinal(enctext);
	  }
}

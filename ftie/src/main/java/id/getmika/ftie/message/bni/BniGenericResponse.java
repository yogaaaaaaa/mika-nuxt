package id.getmika.ftie.message.bni;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.FtieResponse;
import id.getmika.ftie.message.TLV;
import id.getmika.ftie.message.TransactionMessage;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "De57"})
public class BniGenericResponse extends FtieResponse {
	protected TransactionMessage tm;
	private boolean beenParsed;
	private byte[] ltwkDEK;
	 
	Logger logger = LoggerFactory.getLogger(getClass());
	
	public BniGenericResponse(String key) {
		super();
		beenParsed = false;
		tm = new TransactionMessage();
		//2,3,4,7,11,12,13,14,22,23,24,25,35,37,38,39,41,42,44,52,55,60,61,62,63,64
		tm.getIsomsg().addDE(new DataElement(2, DataType.NUMERIC, 19));
		tm.getIsomsg().addDE(new DataElement(3, DataType.NUMERIC, 6));
		tm.getIsomsg().addDE(new DataElement(4, DataType.NUMERIC, 12));		
		tm.getIsomsg().addDE(new DataElement(11, DataType.NUMERIC, 6));
		tm.getIsomsg().addDE(new DataElement(12, DataType.NUMERIC, 6)); 
		tm.getIsomsg().addDE(new DataElement(13, DataType.NUMERIC, 4));		
		tm.getIsomsg().addDE(new DataElement(24, DataType.NUMERIC, 3));		
		tm.getIsomsg().addDE(new DataElement(37, DataType.ALPHANUMERIC, 12));
		tm.getIsomsg().addDE(new DataElement(38, DataType.ALPHANUMERIC, 6));
		tm.getIsomsg().addDE(new DataElement(39, DataType.ALPHANUMERIC, 2));
		tm.getIsomsg().addDE(new DataElement(41, DataType.ALPHANUMERIC, 8));
		tm.getIsomsg().addDE(new DataElement(44, DataType.NUMERIC, 1).setL2(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(48, DataType.NUMERIC, 1).setL4(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(55, DataType.ALPHANUMERIC, 1).setL3(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(57, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(58, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(60, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(61, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(62, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(63, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(64, DataType.BINARY, 64));
		
		if (key != null)
			ltwkDEK = CommonUtil.hexStringToBytes(key);
		
		compose();
	}
	
	public void compose() {
		this.tm.compose();
	}
	
	public void parse(byte[] data) {
		beenParsed = true;
		this.tm.parse(data, 0);
	}
	
	@JsonIgnore
	public TransactionMessage getTm() {
		return tm;
	}
	
	public String getMti() {
		if (!beenParsed) return null;
		return tm.getIsomsg().getMti();
	}
	
	public String getPan() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(2);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing Pan - DE 2");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return de.toString();
	}
	
	public String getProcessingCode() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(3);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing ProcessingCode - DE 3");
			return null;
		}
			
		//return Integer.toString(de.toInt());
		return CommonUtil.bytesToHexString(de.getValueBytes());
	}
	
	public String getAmount() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(4);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing Amount - DE 4");
			return null;
		}
		if (!de.isBeenParsed())
			return null;	
		return BigDecimal.valueOf((double) de.toLong() / 100).setScale(2).toString();
	}
	
	public String getTraceNumber() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(11);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing TraceNumber - DE 11");
			return null;
		}
		//return Integer.toString(de.toInt());
		return CommonUtil.bytesToHexString(de.getValueBytes());
	}
	
	public String getTransactionDateTime() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(12);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing Time - DE 12");
			return null;
		}
		
		byte[] bufTime = de.getBytes();		
		if (bufTime.length != 3) {
			getMeta().setStatus("01");
			getMeta().setReason("Invalid Time - DE 12");
			return null;
		}
		int hour = (bufTime[0] >> 4) * 10 + (bufTime[0] & 0x0f);
		int minute = (bufTime[1] >> 4) * 10 + (bufTime[1] & 0x0f);
		int second = (bufTime[2] >> 4) * 10 + (bufTime[2] & 0x0f);
		
		ZonedDateTime zdt = ZonedDateTime.now(ZoneId.of("Asia/Jakarta")).withHour(hour).withMinute(minute).withSecond(second);
		
		de = this.tm.getIsomsg().getDE(13);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing Date - DE 13");
			return null;
		}
		
		byte[] bufDate = de.getBytes();
		if (bufDate.length != 2) {
			getMeta().setStatus("01");
			getMeta().setReason("Invalid Date - DE 13");
			return null;
		}
		
		int month = (bufDate[0] >> 4) * 10 + (bufDate[0] & 0x0f);
		int day = (bufDate[1] >> 4) * 10 + (bufDate[1] & 0x0f);
		
		if (month < 1 || month > 13) {
			getMeta().setStatus("01");
			getMeta().setReason("Invalid Date - DE 13");
			return null;
		}
		
		zdt.withMonth(month).withDayOfMonth(day);
		return zdt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
	}
	
	public String getNii() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(24);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing Nii - DE 24");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		//return Integer.toString(de.toInt());
		return CommonUtil.bytesToHexString(de.getValueBytes()).substring(1);
	}
		
	public String getReferenceNumber() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(37);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing ReferenceNumber - DE 37");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return de.toString();
	}
	
	public String getApprovalCode() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(38);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing ApprovalCode - DE 38");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return de.toString();
	}
	
	public String getResponseCode() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(39);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing ResponseCode - DE 39");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return de.toString();
	}
	
	public String getTerminalID() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(41);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing TerminalID - DE 41");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return de.toString();
	}
	
	public String getPrivateData44() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(44);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData44 - DE 44");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return CommonUtil.bytesToHexString(de.getValueBytes());
	}
	
	public String getPrivateData48() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(48);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData48 - DE 48");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
	}
	
	public String getEmvData() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(55);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData55 - DE 55");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
	}
	
	public void decomposeTle() {
		if (!beenParsed) return;

		DataElement de = this.tm.getIsomsg().getDE(57);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("TLE decompose error - missing DE 57");
			return;
		}
		if (!de.isBeenParsed()) return;

		int lenDe57 = de.getLengthElement().toInt();
		if (lenDe57 - 36 < 1) return;
		
		byte[] buffEncrypt = new byte[lenDe57 - 36];
		byte[] buffDecrypt;
		System.arraycopy(de.getValueBytes(), 36, buffEncrypt, 0, lenDe57 - 36);

		try {
			buffDecrypt = decrypt3DES(buffEncrypt, ltwkDEK, new byte[8]);
		} catch (Exception e) {
			getMeta().setStatus("01");
			getMeta().setReason("TLE decryption error");
			return;
		}

		TLV tlv = new TLV();
		tlv.parse(buffDecrypt, 0);
			
		DataElement dex = tm.getIsomsg().getDE(tlv.getType());	
		if (dex == null) {
			getMeta().setStatus("01");
			getMeta().setReason("TLE decompose error. unknown DE " + tlv.getType());
			return;
		}
		
		tm.getIsomsg().addDE(dex);
		dex.compose();
		dex.parse(tlv.getBytes(), 0);
	}
	
	public String getPrivateData58() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(58);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData58 - DE 58");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
	}
	
	public String getPrivateData60() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(60);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData60 - DE 60");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
	}
	
	public String getPrivateData61() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(61);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData61 - DE 61");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return CommonUtil.bytesToHexString(de.getValueBytes());
	}
	
	public String getPrivateData62() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(62);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData62 - DE 62");
			return null;
		}
		//return CommonUtil.bytesToHexString(de.getValueElement().getBytes());
		if (!de.isBeenParsed())
			return null;
		return CommonUtil.bytesToHexString(de.getValueBytes());
	}
	
	public String getPrivateData63() {
		if (!beenParsed)
			return null;
		DataElement de = this.tm.getIsomsg().getDE(63);
		if (de == null) {
			getMeta().setStatus("01");
			getMeta().setReason("missing PrivateData63 - DE 63");
			return null;
		}
		if (!de.isBeenParsed())
			return null;
		return CommonUtil.bytesToHexString(de.getValueBytes());
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

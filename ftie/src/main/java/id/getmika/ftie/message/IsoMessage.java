package id.getmika.ftie.message;

import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collections;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import id.getmika.ftie.CommonUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class IsoMessage {

	private Element mti;
	private Element bitmap;
	private ArrayList<DataElement> dataElements;
	
	private byte[] ltwkDEK;
	private byte[] ltwkMAK;
	private int[] encDElist;
	private String acquirerId;
	private String terminalId;
	private String ltwkId;
	
	private final Logger logger = LoggerFactory.getLogger(getClass());
	
	public IsoMessage() {
		this.mti = new Element(DataType.NUMERIC, 4);
		this.mti.compose();
		this.bitmap = new Element(DataType.BINARY, 64);
		this.bitmap.compose();
		this.dataElements = new ArrayList<DataElement>();
	}
	
	public IsoMessage(int mti) {
		this.mti = new Element(mti, 4);
		this.mti.compose();
		this.bitmap = new Element(0, 64);
		this.bitmap.setDataType(DataType.BINARY);
		this.bitmap.compose();		
		this.dataElements = new ArrayList<DataElement>();
	}
	
	public void setLtwkDEK(String ltwkDEK) {
		this.ltwkDEK = CommonUtil.hexStringToBytes(ltwkDEK);
	}

	public void setLtwkMAK(String ltwkMAK) {
		this.ltwkMAK = CommonUtil.hexStringToBytes(ltwkMAK);
	}
	
	public void setEncryptedDEList(int[] encDElist) {
		this.encDElist = encDElist;
	}

	public void setAcquirerId(String acquirerId) {
		this.acquirerId = acquirerId;
	}
	
	public void setTerminalId(String terminalId) {
		this.terminalId = terminalId;
	}

	public void setLtwkId(String ltwkId) {
		this.ltwkId = ltwkId;
	}
	
	public void setMti(int val) {
		mti.setValue(val);
		mti.compose();
	}
	
	public String getMti() {
		return mti.toString();
	}
	
	public ArrayList<DataElement> getDataElements() {
		return this.dataElements;
	}
	
	public void compose() {
		// mti and bitmap were composed by constructor
		for (DataElement de: this.dataElements)
			de.compose();
	}
	
	public byte[] getBytes() {
		
		int mtilen = this.mti.getDataSize();
		int bitmaplen = this.bitmap.getDataSize();
		
		int delen = 0;
		for (DataElement de: this.dataElements)
			delen += de.getDataSize();
		
		byte[] buf = new byte[mtilen + bitmaplen + delen];
		
		System.arraycopy(this.mti.getBytes(), 0, buf, 0, mtilen);		
		System.arraycopy(this.bitmap.getBytes(), 0, buf, mtilen, bitmaplen);		
				
		int index = mtilen + bitmaplen;
		Collections.sort(this.dataElements);
		for (DataElement de: this.dataElements) {
			System.arraycopy(de.getBytes(), 0, buf, index, de.getDataSize());
			index += de.getDataSize();
		}
		
		return buf;
	}
	
	public int parse(byte[] data, int pos) {
		
		pos = this.mti.parse(data, pos);
		pos = this.bitmap.parse(data, pos);
		Collections.sort(this.dataElements);
		byte[] bufbitmap = this.bitmap.getBytes();
		int base = 0;
		
		int[] arrMask = new int[]{128, 64, 32, 16, 8, 4, 2, 1};
		for (int index = 0; index < 8; index++) {
			
			byte b = bufbitmap[index];	
			
			for (int idxMask = 0; idxMask < 8; idxMask++) {
				if ((b & arrMask[idxMask]) == arrMask[idxMask]) {
					DataElement de = getDE(idxMask + 1 + base);
					if (de == null)
						throw new IllegalArgumentException("parse error. missing DE" + Integer.toString(idxMask + 1 + base));
					pos = de.parse(data, pos);
				}
			}
			
			base += 8;
		}
		return pos;
	}
	
	public void addDE(DataElement de) {
		this.dataElements.add(de);
		this.bitmap.setBit(de.getNumber());
	}
	
	public void removeDE(int num) {
		int index = 0;
		boolean found = false;
		for (DataElement de: this.dataElements) {
			if (de.getNumber() == num) {
				found = true;
				break;
			}				
			index++;
		}
		if (found) {
			this.dataElements.remove(index);
			this.bitmap.unsetBit(num);
		}
	}
	
	public DataElement getDE(int num) {
		for (DataElement de: this.dataElements) {
			if (de.getNumber() == num)
				return de;
		}
		return null;
	}
	
	public int getDataSize() {
		int len = 10;
		for (DataElement de: this.dataElements)
			len += de.getDataSize();
		return len;
	}
	
	public void composeTLE() throws Exception {		
		compose();
		this.logger.info("Iso Msg: " + CommonUtil.bytesToHexString(getBytes()));
		this.bitmap.setBit(64);
		
		byte[] de64MAC = MACSHA1(getBytes(), this.ltwkMAK);		
		
		int tlv_len = 0;
		ArrayList<TLV> arrTLV = new ArrayList<TLV>();
		for(int index = 0; index < this.encDElist.length; index++) {
			DataElement de = this.getDE(this.encDElist[index]);
			if (de == null)
				continue;
			TLV tlv = new TLV(this.encDElist[index], de.getDataSize(), de.getBytes());
			tlv.compose();
			arrTLV.add(tlv);
			tlv_len += tlv.getBytes().length;
			removeDE(de.getNumber());
		}		

		int tlv_wpad_len;		
		if (tlv_len % 8 > 0)
			tlv_wpad_len = 8 * (tlv_len / 8 + 1);
		else 
			tlv_wpad_len = tlv_len;
		
		byte[] TLVbuf = new byte[tlv_wpad_len];
		int idx = 0;
		for (int i = 0; i < arrTLV.size(); i++) {
			byte[] src = arrTLV.get(i).getBytes();
			System.arraycopy(src, 0, TLVbuf, idx, src.length);
			idx += src.length;
		}
		
		logger.info("ProtText: " + CommonUtil.bytesToHexString(TLVbuf));
		
		byte[] encTLV = null;
	    if (TLVbuf.length > 0)
	    	encTLV = this.encrypt3DES(TLVbuf, this.ltwkDEK, new byte[8]);
		byte[] bufTLEHeader = new byte[36];
		System.arraycopy("HTLE03".getBytes("US-ASCII"), 0, bufTLEHeader, 0, 6);
		System.arraycopy(this.acquirerId.getBytes("US-ASCII"), 0, bufTLEHeader, 6, 3);
		System.arraycopy(this.terminalId.getBytes("US-ASCII"), 0, bufTLEHeader, 9, 8);
		// 3DES CBC, Unique Key per terminal, SHA-1
		System.arraycopy("201".getBytes("US-ASCII"), 0, bufTLEHeader, 17, 3);
		System.arraycopy(this.ltwkId.getBytes("US-ASCII"), 0, bufTLEHeader, 20, 4);
		//encryption counter
		System.arraycopy("0000".getBytes("US-ASCII"), 0, bufTLEHeader, 24, 4);
		System.arraycopy(String.format("%03d", tlv_len).getBytes("US-ASCII"), 0, bufTLEHeader, 28, 3);
		
		byte[] bufTLED;
		 if (encTLV != null)
			 bufTLED = new byte[36 + encTLV.length];
		 else
			 bufTLED = new byte[36];
		 System.arraycopy(bufTLEHeader, 0, bufTLED, 0, 36);
		 if (encTLV != null)
			 System.arraycopy(encTLV, 0, bufTLED, 36, encTLV.length);
		 
		addDE(new DataElement(57, bufTLED).setL4(EncodeType.BCD));
		addDE(new DataElement(64, de64MAC));
		compose();
	}

	private byte[] MACSHA1(byte[] data, byte[] key) throws Exception {
		
		MessageDigest md = MessageDigest.getInstance("SHA-1");
		
		byte[] mac24 = new byte[24];
		byte[] sha1 = md.digest(data);		
		System.arraycopy(sha1, 0, mac24, 0, 20);
		mac24[20] = (byte) 0x80;
		byte[] DESede = encrypt3DES(mac24, key, new byte[8]);		
		byte[] MAC = new byte[8];
		// MAB is the last 8 bytes of DESede
		// first 32 bits (4 byte) MAB is MAC
		System.arraycopy(DESede, 16, MAC, 0, 4);
		
		return MAC;
	}


	private byte[] encrypt3DES(byte[] plaintext, byte[] tdesKeyData, byte[] initVector) throws Exception {
		
		byte[] key;
		if (tdesKeyData.length == 16) {
		    key = new byte[24];
		    System.arraycopy(tdesKeyData, 0, key, 0, 16);
		    System.arraycopy(tdesKeyData, 0, key, 16, 8);
		} 
		else
		    key = tdesKeyData;
		
	    Cipher c3des;
	    c3des = Cipher.getInstance("DESede/CBC/PKCS5Padding");
		SecretKeySpec myKey = new SecretKeySpec(key, "DESede");
	    IvParameterSpec ivspec = new IvParameterSpec(initVector);
	    c3des.init(Cipher.ENCRYPT_MODE, myKey, ivspec);
	    return c3des.doFinal(plaintext);
	}
}

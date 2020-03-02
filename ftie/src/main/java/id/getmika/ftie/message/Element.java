package id.getmika.ftie.message;

import java.io.UnsupportedEncodingException;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.ParseBufferException;

public class Element {

	private byte[] bufVal;
	private long longVal;
	private String strVal;
	
	private int length;
	private boolean packed;
	private DataType dataType;
	private EncodeType encoding;
	
	public Element() {}
	
	public Element(int ival, int len) {
		this((long) ival, len);
	}
	
	public Element(long lval, int len) {
		this.longVal = lval;
		this.strVal = null;
		this.bufVal = null;
		this.length = len;
		this.packed = true;
		//this.encoding = EncodeType.BCD;
		this.dataType = DataType.NUMERIC;
	}
	
	public Element(String sval) {
		this.strVal = sval;
		this.longVal = -1;
		this.bufVal = null;
		this.length = sval.length();
		this.packed = false;
		this.encoding = EncodeType.ASCII;
	}
	
	public Element(byte[] buf) {
		this.strVal = null;
		this.longVal = -1;
		this.bufVal = buf;
	}
	
	public Element(DataType dt, int len) {
		this.dataType = dt;
		this.length = len;
		
		switch (this.dataType) {
		case ALPHANUMERIC:
			this.packed = false;
			this.encoding = EncodeType.ASCII;
			break;
		case NUMERIC:
			this.packed = true;
			this.encoding = EncodeType.BCD;
			break;
		default:
			this.packed = true;
			this.encoding = EncodeType.BINARY;
			break;		
		}
		
		this.longVal = -1;
		this.strVal = null;
		this.bufVal = null;
	}
	
	public void setPacked(boolean pack) {
		this.packed = pack;
	}
	
	public void setValue(int val) {
		if (Integer.toString(val).length() > this.length)
			throw new IllegalArgumentException("setValue error. int length not match");
		this.setValue((long) val);
	}
	
	public void setValue(long val) {
		if (Long.toString(val).length() > this.length)
			throw new IllegalArgumentException("setValue error. long length not match");
		this.longVal = val;
		this.strVal = null;
		this.bufVal = null;
	}
	
	public void setValue(String str) {
		if (str.length() != this.length)
			throw new IllegalArgumentException("setValue error. string length not match");
		this.strVal = str;
		this.longVal = -1;
		this.bufVal = null;
	}	
	
	public void setEncoding(EncodeType et) {
		this.encoding = et;
	}
	
	public void setDataType(DataType dt) {
		this.dataType = dt;
	}

	public int getDataSize() {
		
		if (this.bufVal != null)
			return this.bufVal.length;
		
		if (this.length < 1 && this.dataType == null)
			return 0;
		
		int len = 0;
		if (this.dataType == DataType.ALPHANUMERIC) {
			if (this.packed == true)
				len = this.length / 2 + this.length %2;
			else
				len = this.length;
		}
		else if (dataType == DataType.NUMERIC) {
			                                     
			if (this.encoding == EncodeType.ASCII)
				len = this.length;
			else
				len = this.length / 2 + this.length %2;				
		}
		else { // BINARY
			len = this.length / 8 + this.length % 8;
		}
			
		return len;
	}
	
	public void compose() {
		if (this.bufVal != null)
			return;
		
		if (this.bufVal == null && this.longVal < 0 && this.strVal == null && this.dataType == null)
			throw new IllegalArgumentException("compose error. null value");
		
		if (this.longVal >= 0)
			composeLong();
		else if (this.strVal != null)
			composeString();
		else
			allocateBuffer();			
	}
	
	/*public byte[] parse(byte[] buf) {
		if (this.bufVal == null)
			throw new IllegalArgumentException("parse error. bufVal null. have you compose?");
		if (buf == null)
			throw new IllegalArgumentException("parse error. input buf null");
		
		byte[] result;
		int len = getDataSize();
		if (len > buf.length)
			len = buf.length;
		System.arraycopy(buf, 0, this.bufVal, 0, len);
		result = new byte[buf.length - len];
		System.arraycopy(buf, len, result, 0, buf.length - len);
		
		return result;
	}
	
	public byte[] parse(byte[] buf, int len) {
		if (this.bufVal == null)
			throw new IllegalArgumentException("parse error. bufVal null. have you compose?");
		if (buf == null)
			throw new IllegalArgumentException("parse error. input buf null");
		byte[] result;
		int copylen;
		if (this.dataType == DataType.ALPHANUMERIC && !this.packed)
			copylen = len;
		else
			copylen = len / 2;
		
		this.bufVal = new byte[copylen];
		System.arraycopy(buf, 0, this.bufVal, 0, copylen);
		result = new byte[buf.length - copylen];
		System.arraycopy(buf, len, result, 0, buf.length - copylen);
		
		return result;
	}*/
	
	public int parse(byte[] buf, int pos) {
		if (this.bufVal == null)
			throw new IllegalArgumentException("parse error. bufVal null. have you compose?");
		if (buf == null)
			throw new ParseBufferException("parse error. input buf null");
		
		int len = getDataSize();
		if (len > buf.length)
			len = buf.length;
		System.arraycopy(buf, pos, this.bufVal, 0, len);
		
		return pos + len;
	}
	
	public int parse(byte[] buf, int pos, int len) {
		if (this.bufVal == null)
			throw new IllegalArgumentException("parse error. bufVal null. have you compose?");
		if (buf == null)
			throw new IllegalArgumentException("parse error. input buf null");
		
		int copylen;
		if (this.dataType == DataType.ALPHANUMERIC && !this.packed)
			copylen = len;
		else
			copylen = len / 2;
		
		this.bufVal = new byte[copylen];
		System.arraycopy(buf, pos, this.bufVal, 0, copylen);
		
		return pos + len;
	}
	
	public byte[] getBytes() {
		return this.bufVal;
	}
	
	public void setBit(int number) {
		int index = number % 8;
		int byteth = number / 8;
		if (index == 0)
			--byteth;
		byte bitset = (byte) (1 << (8 - index));
		if (index == 0)
			bitset = (byte) 1;
		this.bufVal[byteth] = (byte) (this.bufVal[byteth] | bitset);
	}
	
	public void unsetBit(int number) {
		int index = number % 8;
		int byteth = number / 8;
		if (index == 0)
			--byteth;
		byte bitset = (byte) ~(1 << (8 - index));
		if (index == 0)
			bitset = (byte) ~1;
		this.bufVal[byteth] = (byte) (this.bufVal[byteth] & bitset);
	}
	
	public String toString() {
		if (this.bufVal == null)
			return null;
		
		boolean all0 = true;
		for (byte b : this.bufVal) {
		    if (b != 0) {
		        all0 = false;
		        break;
		    }
		}
		if (all0)
			return "";
		if (this.dataType == DataType.ALPHANUMERIC && this.packed == false) {
			try {
				return new String(this.bufVal, "US-ASCII");
			} catch (UnsupportedEncodingException e) {
				return CommonUtil.bytesToHexString(this.bufVal);
			}
		}
		return CommonUtil.bytesToHexString(this.bufVal);
	}
	
	public Long toLong() {
		if (this.bufVal == null || this.dataType != DataType.NUMERIC)
			return null;
		long result = 0;
		int cnt = 1;
		for (int index = this.bufVal.length - 1; index >= 0; index--) {
			int val = bufVal[index] & 0xff;
			int tens = val >> 4; 
			int units = val & 0x0F;
			
			if (cnt == 1)
				result += tens * 10 + units;
			else if (cnt == 2)
				result += tens * 1000 + units * 100;
			else if (cnt == 3)
				result += tens * 100000 + units * 10000;
			else if (cnt == 4)
				result += tens * 10000000 + units * 1000000;
			else if (cnt == 5)
				result += tens * 1000000000 + units * 100000000;
			else if (cnt == 6)
				result += tens * 100000000000L + units * 10000000000L;
			else
				break;
			
			cnt++;
		}
		return result;
	}
	
	public Integer toInt() {
		Long result = toLong();
		if (result == null)
			return null;
		return result.intValue();
	}
	
	private void composeLong() {
		this.bufVal = new byte[this.getDataSize()];
		if (this.encoding == EncodeType.BINARY)
			toBinary(this.longVal);
		// 11 Nov 2019
		else if (this.encoding == EncodeType.ASCII) {
			String strformat = "%0" + this.length + "d";
			String strlong = String.format(strformat, this.longVal); //Long.toString(this.longVal);
			try {
				System.arraycopy(strlong.getBytes("US-ASCII"), 0, this.bufVal, 0, strlong.length());
			} catch (UnsupportedEncodingException e) {
				System.arraycopy(strlong.getBytes(), 0, this.bufVal, 0, strlong.length());
			}
		}
		/*else if (this.packed == false)
			toBCD(this.longVal);*/
		else
			toPackedBCD(this.longVal);
	}
	
	private void composeString() {
		if (this.packed) {
			this.bufVal = new byte[this.strVal.length() / 2 + this.strVal.length() % 2];
			toBinary(this.strVal);
			return;
		}
		this.bufVal = new byte[this.strVal.length()];
		String strEncode;
		if (this.encoding == EncodeType.EBCDIC)
			strEncode = "IBM037";
		else
			strEncode = "US-ASCII";
		try {
			System.arraycopy(this.strVal.getBytes(strEncode), 0, this.bufVal, 0, this.strVal.length());
		} catch (UnsupportedEncodingException e) {
			System.arraycopy(this.strVal.getBytes(), 0, this.bufVal, 0, this.strVal.length());
		}
		
	}
	
	private void allocateBuffer() {
		
		int buflen;
		
		switch (this.dataType) {
		case BINARY:
			buflen = this.length / 8 + this.length % 8;
			break;
		case NUMERIC:
			if (this.encoding == EncodeType.ASCII)
				buflen = this.length;
			else
				buflen = this.length / 2 + this.length % 2;
			break;
		case ALPHANUMERIC:
			if (this.packed)
				buflen = this.length / 2 + this.length % 2;
			else
				buflen = this.length;
			break;
		default:
			throw new IllegalArgumentException("allocateBuffer error. null data type");
		}
		
		this.bufVal = new byte[buflen];
	}
	
	private void toBinary(long value) {
	    for(int index = this.bufVal.length - 1; index >= 0; index--) {
	        this.bufVal[index] = (byte) value;
	        value = value >> 8;
	    };
	};
	
	private void toBinary(String str) {
		int len = str.length();
	    for (int index = 0; index < len; index += 2) {
	    	int temp =  Character.digit(str.charAt(index), 16) << 4;
	    	if (index + 1 < len)
	    		temp += Character.digit(str.charAt(index + 1), 16);
	    	this.bufVal[index / 2] = (byte) temp;
	        /*this.bufVal[index / 2] = (byte) ((Character.digit(str.charAt(index), 16) << 4)
	                             + Character.digit(str.charAt(index + 1), 16));*/
	    }
	}
	
	private void toPackedBCD(long val) {
		for (int index = this.bufVal.length - 1; index >= 0; index--) {
			if (val == 0)
				break;
			this.bufVal[index] = (byte) (val % 10);
			val /= 10;				
			this.bufVal[index] |= (byte) ((val % 10) << 4);
			val /= 10;
		}
	}
	
	/*private void toBCD(long val) {
		for (int index = this.bufVal.length - 1; index >= 0; index--) {
			if (val == 0)
				break;
			this.bufVal[index] = (byte) (val % 10);
			val /= 10;
		}
	}*/
}

package id.getmika.ftie.message;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TLV {

	Logger logger = LoggerFactory.getLogger(getClass());

	private byte[] buffer;
	
	private int type;
	private int length;
	private byte[] value;
	
	public TLV() {}
	
	public TLV(int t, int l, byte[] b) {
		this.setType(t);
		this.setLength(l);
		this.setValue(b);
	}
	
	public int getType() {
		return type;
	}
	
	public void setType(int t) {
		String strOctal = Integer.toOctalString(t);
		this.type = Integer.parseInt(strOctal);
	}
	
	public void setLength(int t) {
		this.length = t;
	}
	
	public void setValue(byte[] b) {
		this.value = b;
	}
	
	public void compose() {
		
		int buflen = 1; // type
		
		int ll = 0;
		if (this.length > 127) {
			ll = getByteLength(this.length);
			buflen += ll + 1; // +1 for 0x80;
		}
		else 
			buflen++; // length
		buflen += this.value.length; // value
		
		this.buffer = new byte[buflen];
		
		
		this.buffer[0] = (byte) (this.type % 10);
		this.type /= 10;				
		this.buffer[0] |= (byte) ((this.type % 10) << 4);
		
		if (this.length > 127) {
			this.buffer[1] = (byte) (0x80 + ll);
			byte[] tmp = new byte[ll];
			for (int i = 0; i < ll; i++)
			    tmp[i] = (byte)(this.length >>> (i * 8));
			System.arraycopy(tmp, 0, this.buffer, 2, ll);
		}
		else
			this.buffer[1] = (byte) this.length;
		
		System.arraycopy(this.value, 0, this.buffer, 2 + ll, this.value.length);		
	}
	

	public byte[] getBytes() {
		return this.buffer;
	}
	
	private int getByteLength(int value) {
		String str = Integer.toHexString(value);
		if (str.length() % 2 == 1)
			return str.length() / 2 + 1;
		return str.length() / 2;
	}
	
	public int parse(byte[] buf, int pos) {
		if (buf == null)
			throw new IllegalArgumentException("parse error. input buf null");
		
		type = Integer.parseInt(Integer.toHexString(buf[0]), 8);
		int len = buf[1];
		int nread = 2;
		if (len > 127) {
			int bytenum = len & 0x7f;
			byte[] bufvallen = new byte[bytenum];
			System.arraycopy(buf, 2, bufvallen, 0, bytenum);
			len = 0;
			for (int i = 0; i < bytenum; i++)
				len |= bufvallen[i + 2] << (8 * i);
			nread = 2 + bytenum;
		}
		buffer = new byte[len];
		System.arraycopy(buf, nread, buffer, 0, len);
		
		return pos + nread + len;
	}
}

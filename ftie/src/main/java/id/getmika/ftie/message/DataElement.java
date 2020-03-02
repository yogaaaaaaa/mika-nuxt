package id.getmika.ftie.message;

public class DataElement implements Comparable<DataElement> {

	private Integer number;
	private int lenval;
	private Element elmValue;
	private Element elmLength;
	private boolean beenParsed;

	@Override
	public int compareTo(DataElement arg0) {
		return this.getNumber().compareTo(arg0.getNumber());
	}
	
	//////////////////////////////////////////
	

	public DataElement() {
		beenParsed = false;
	}
	
	public DataElement(int num, int ival, int len) {
		this(num, (long) ival, len);
	}
	
	public DataElement(int num, long lval, int len) {
		this.number = num;
		this.elmValue = new Element(lval, len);
	}
	
	public DataElement(int num, String sval) {
		this.number = num;
		this.elmValue = new Element(sval);
	}
	
	public DataElement(int num, byte[] buf) {
		this.number = num;
		this.elmValue = new Element(buf); 
	}
	
	public DataElement(int num, DataType dt, int len) {
		this.number = num;
		this.elmValue = new Element(dt, len);
	}	
	
	public DataElement setPacked(boolean pack) {
		this.elmValue.setPacked(pack);
		return this;
	}
	
	public void setValue(int val) {
		this.elmValue.setValue(val);
	}
	
	public void setValue(String str) {
		this.elmValue.setValue(str);
	}	
	
	public DataElement setL2(EncodeType et) {
		this.elmLength = new Element(DataType.NUMERIC, 2);
		this.elmLength.setEncoding(et);
		return this;
	}
	
	public DataElement setL3(EncodeType et) {
		this.elmLength = new Element(DataType.NUMERIC, 3);
		this.elmLength.setEncoding(et);
		return this;
	}
	
	public DataElement setL4(EncodeType et) {
		this.elmLength = new Element(DataType.NUMERIC, 4);
		this.elmLength.setEncoding(et);
		return this;
	}
	
	public DataElement setLnVal(int val) {
		this.lenval = val;
		return this;
	}
	
	public void compose() {
		this.elmValue.compose();
		if (this.elmLength != null) {
			this.elmLength.compose();
			if (this.lenval > 0)
				this.elmLength.setValue(this.lenval);
			else
				this.elmLength.setValue(this.elmValue.getDataSize());
			this.elmLength.compose();
		}
		
	}
	
	/*public byte[] parse(byte[] data) {
		byte[] buf;
		if (this.elmLength != null) {
			buf = this.elmLength.parse(data);
			return this.elmValue.parse(buf, this.elmLength.toInt());
		}
		else {
			buf = data;
			return this.elmValue.parse(buf);
		}
	}*/
	
	public int parse(byte[] data, int pos) {
		beenParsed = true;
		if (this.elmLength != null) {
			pos = this.elmLength.parse(data, pos);
			return this.elmValue.parse(data, pos, this.elmLength.toInt());
		}
		return this.elmValue.parse(data, pos);		
	}
	
	public byte[] getBytes() {
		int len = 0;
		if (this.elmLength != null)
			len = this.elmLength.getDataSize();
		len += this.elmValue.getDataSize();
		
		byte[] buf = new byte[len];
		int index = 0;
		if (this.elmLength != null) {
			if (elmLength.toInt() == 0)
				return null;
			index = this.elmLength.getDataSize();
			System.arraycopy(this.elmLength.getBytes(), 0, buf, 0, index);
		}
		System.arraycopy(this.elmValue.getBytes(), 0, buf, index, this.elmValue.getDataSize());
		return buf;
	}
	
	public int getDataSize() {
		int len = 0;
		if (this.elmLength != null)
			len = this.elmLength.getDataSize();
		len += this.elmValue.getDataSize();
		
		return len;
	}
	
	public String toString() {
		return this.elmValue.toString();
	}
	
	public long toLong() {
		return this.elmValue.toLong();
	}
	
	public int toInt() {
		return this.elmValue.toInt();
	}
	//////////////////////////////////////////
	
	public Integer getNumber() {
		return number;
	}

	public void setNumber(int number) {
		this.number = number;
	}

	public Element getValueElement() {
		return elmValue;
	}

	public Element getLengthElement() {
		return elmLength;
	}
	
	public byte[] getValueBytes() {
		if (this.elmLength != null) {
			if (this.elmLength.toInt() == null || this.elmLength.toInt() == 0)
				return null;
		}
		return this.elmValue.getBytes();
	}

	public boolean isBeenParsed() {
		return beenParsed;
	}
	
}

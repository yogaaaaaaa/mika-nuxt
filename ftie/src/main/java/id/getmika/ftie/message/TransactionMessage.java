package id.getmika.ftie.message;

public class TransactionMessage {

	private Element msglen;
	private byte protoId;
	private Element source;
	private Element dest;
	private IsoMessage isomsg;

	public TransactionMessage() {
		this.msglen = new Element(DataType.NUMERIC, 4);
		this.msglen.compose();
		this.source = new Element(DataType.NUMERIC, 4);
		this.source.compose();
		this.dest = new Element(DataType.NUMERIC, 4);
		this.dest.compose();
		this.isomsg = new IsoMessage();
	}
	
	public TransactionMessage(int mti) {
		this.isomsg = new IsoMessage(mti);
	}
	
	public IsoMessage getIsomsg() {
		return isomsg;
	}

	public void setProtoId(int protoId) {
		this.protoId = (byte) protoId;
	}

	public void setSource(int val) {
		this.source = new Element(val, 4);
		this.source.compose();
	}

	public void setDest(int val) {
		this.dest = new Element(val, 4);
		this.dest.compose();
	}
	
	public void compose() {
		this.isomsg.compose();
	}
	
	public void composeTLE() throws Exception {
		this.isomsg.composeTLE();
	}
	
	public byte[] getBytes() {
		
		int isomsglen = this.isomsg.getDataSize();
		
		this.msglen = new Element(5 + isomsglen, 4);
		this.msglen.setEncoding(EncodeType.BINARY);
		this.msglen.compose();
		
		byte[] buf = new byte[7 + isomsglen];
		
		System.arraycopy(this.msglen.getBytes(), 0, buf, 0, 2);
		buf[2] = this.protoId;
		System.arraycopy(this.source.getBytes(), 0, buf, 3, 2);
		System.arraycopy(this.dest.getBytes(), 0, buf, 5, 2);
		System.arraycopy(this.isomsg.getBytes(), 0, buf, 7, isomsglen);
		
		return buf;
	}
	
	public int parse(byte[] data, int pos) {
		pos = this.msglen.parse(data, pos);
		this.protoId = data[pos++];				
		pos = this.source.parse(data, pos);
		pos = this.dest.parse(data, pos);
		
		return this.isomsg.parse(data, pos);
	}

}

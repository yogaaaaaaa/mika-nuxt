package id.getmika.ftie.message.bni;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.FtieResponse;
import id.getmika.ftie.message.TransactionMessage;

public abstract class BniResponse extends FtieResponse {
	
	protected TransactionMessage tm;
	private boolean beenParsed;
	
	public BniResponse() {
		super();
		beenParsed = false;
		tm = new TransactionMessage();
		tm.getIsomsg().addDE(new DataElement(3, DataType.NUMERIC, 6));
		tm.getIsomsg().addDE(new DataElement(11, DataType.NUMERIC, 6));
		tm.getIsomsg().addDE(new DataElement(12, DataType.NUMERIC, 6));
		tm.getIsomsg().addDE(new DataElement(13, DataType.NUMERIC, 4));
		tm.getIsomsg().addDE(new DataElement(24, DataType.NUMERIC, 3));
		tm.getIsomsg().addDE(new DataElement(39, DataType.ALPHANUMERIC, 2));
		tm.getIsomsg().addDE(new DataElement(41, DataType.ALPHANUMERIC, 8));
		tm.getIsomsg().addDE(new DataElement(57, DataType.ALPHANUMERIC, 1).setL4(EncodeType.BCD));
		tm.getIsomsg().addDE(new DataElement(64, DataType.BINARY, 64));
	}
	
	public void compose() {
		this.tm.compose();
	}
	
	public void parse(byte[] data) {
		beenParsed = true;
		this.tm.parse(data, 0);
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
			
		return Integer.toString(de.toInt());
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
		return Integer.toString(de.toInt());
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
		return Integer.toString(de.toInt());
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
		return de.toString();
	}

	protected boolean isBeenParsed() {
		return beenParsed;
	}

	/*public void setBeenParsed(boolean beenParsed) {
		this.beenParsed = beenParsed;
	}*/
}

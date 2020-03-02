package id.getmika.ftie.message.bni;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.RequestOption;
import id.getmika.ftie.message.RequestTLEOption;
import id.getmika.ftie.message.TransactionMessage;

public class BniGenericRequest {

	private int[] encDElist = new int[] {2, 14, 35, 42, 55, 63};

	private TransactionMessage tm;
	private RequestOption options;
	private RequestTLEOption TleOptions;
	
	private int _mti;
	private int _track2len;
	private int _proccode;
	private int _entrymode;	
	private int _poscode;
	private int _apppan;
	private long _pan;
	private long _amount;
	private String _track2;
	//private LocalDate _ldtExpired;
	private ZonedDateTime _zdtTransmit;
	private ZonedDateTime _zdtTransact;
			
	public BniGenericRequest() {
		tm = new TransactionMessage();
		tm.getIsomsg().setEncryptedDEList(encDElist);
		options = new RequestOption();
		TleOptions = new RequestTLEOption();
		tm.setProtoId(0x60);
		tm.setDest(1);
	}
	
	public TransactionMessage getTm() {
		return tm;
	}
	
	public void compose() {
		this.tm.compose();
	}
	
	public void composeTLE() throws Exception {
		this.tm.composeTLE();
	}
		
	public byte[] getBytes() {
		return this.tm.getBytes();
	}
	
	public RequestTLEOption getTleOptions() {
		return TleOptions;
	}

	public void setTleOptions(RequestTLEOption tleOptions) {
		TleOptions = tleOptions;
		if (tleOptions.getLtwkDEK() == null)
			throw new IllegalArgumentException("Missing LtwkDEK");
		if (tleOptions.getLtwkMAK() == null)
			throw new IllegalArgumentException("Missing LtwkMAK");
		if (tleOptions.getTleAcquirerID() == null)
			throw new IllegalArgumentException("Missing TleAcquirerID");
		if (tleOptions.getLtwkID() == null)
			throw new IllegalArgumentException("Missing LtwkID");
		tm.getIsomsg().setLtwkDEK(tleOptions.getLtwkDEK());
		tm.getIsomsg().setLtwkMAK(tleOptions.getLtwkMAK());
		tm.getIsomsg().setAcquirerId(tleOptions.getTleAcquirerID());
		tm.getIsomsg().setLtwkId(tleOptions.getLtwkID());
	}

	public RequestOption getOptions() {
		return options;
	}

	public void setOptions(RequestOption options) {
		this.options = options;
		tm.setSource(options.getTpduNii());
	}	
	
	// ==========  TPDU
	
	public void setTpduProtoId(int val) {
		this.tm.setProtoId(val);
	}
	
	public void setTpduSource(int val) {
		this.tm.setSource(val);
	}
	
	public void setTpduDest(int val) {
		this.tm.setDest(val);
	}

	public int getMti() {
		return _mti;
	}
	
	public void setMti(int mti) {
		_mti = mti;
		tm.getIsomsg().setMti(mti);
	}
	
	// ========== Data Element
	
	public void setPan(String pan) {
		try {
			_pan = Long.parseLong(pan);
			if (_pan < 0)
				throw new IllegalArgumentException("Invalid Pan: " + pan);
			int len = pan.length();
			tm.getIsomsg().addDE(new DataElement(2, _pan, len).setL2(EncodeType.BCD).setLnVal(len));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid Pan: " + pan);
		}		
	}
	
	public void setProcessingCode(String processingCode) {
		try {
			_proccode = Integer.parseInt(processingCode);
			if (_proccode < 0)
				throw new IllegalArgumentException("Negative value is not allowed - ProcessingCode: " + processingCode);
			else if (_proccode > 999999)
				throw new IllegalArgumentException("Max 999999 - ProcessingCode: " + processingCode);
			tm.getIsomsg().addDE(new DataElement(3, _proccode, 6));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid ProcessingCode: " + processingCode);
		}
	}
	
	public void setAmount(String amount) {
		try {
			_amount = (long) (Double.parseDouble(amount) * 100);
			if (_amount < 0)
				throw new IllegalArgumentException("Invalid Amount: " + amount);
			tm.getIsomsg().addDE(new DataElement(4, _amount, 12));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid Amount: " + amount);
		}		
	}
	
	public void setTransmissionDateTime(String strdttm) {
		try {
			_zdtTransmit = ZonedDateTime.parse(strdttm, DateTimeFormatter.ISO_DATE_TIME);			
			int time = _zdtTransmit.getHour() * 10000 + _zdtTransmit.getMinute() * 100 + _zdtTransmit.getSecond();
			int date = _zdtTransmit.getMonthValue() * 100000000 + _zdtTransmit.getDayOfMonth() * 1000000;
			this.tm.getIsomsg().addDE(new DataElement(7, date + time, 10));
		}
		catch (DateTimeParseException dtpe) {
			throw new IllegalArgumentException("Invalid TransactionDateTime: " + strdttm);
		}
	}

	public void setTraceNumber(String traceNumber) {
		try {
			int number = Integer.parseInt(traceNumber);			
			if (number < 0)
				throw new IllegalArgumentException("Negative value is not allowed - TraceNumber: " + traceNumber);
			else if (number > 999999)
				throw new IllegalArgumentException("Max 999999 - TraceNumber: " + traceNumber);
			tm.getIsomsg().addDE(new DataElement(11, number, 6));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid TraceNumber: " + traceNumber);
		}		
	}
	
	public void setTransactionDateTime(String transactionDateTime) {
		try {
			_zdtTransact = ZonedDateTime.parse(transactionDateTime, DateTimeFormatter.ISO_DATE_TIME);
			int time = _zdtTransact.getHour() * 10000 + _zdtTransact.getMinute() * 100 + _zdtTransact.getSecond();
			int date = _zdtTransact.getMonthValue() * 100 + _zdtTransact.getDayOfMonth();
			tm.getIsomsg().addDE(new DataElement(12, time, 6));
			tm.getIsomsg().addDE(new DataElement(13, date, 4));
		}
		catch (DateTimeParseException dtpe) {
			throw new IllegalArgumentException("Invalid TransactionDateTime: " + transactionDateTime);
		}
	}
	
	public void setExpirationDate(String expirationDate) {
		try {
			/*_ldtExpired = LocalDate.parse(expirationDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
			int de14 = (_ldtExpired.getYear() - 2000) * 100 + _ldtExpired.getMonthValue();*/
			int de14 = Integer.parseInt(expirationDate);
			tm.getIsomsg().addDE(new DataElement(14, de14, 4));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid ExpirationDate: " + expirationDate);
		}		
		/*catch (DateTimeParseException dtpe) {
			throw new IllegalArgumentException("Invalid ExpirationDate: " + expirationDate);
		}*/
	}
	
	public void setEntryMode(String entryMode) {
		try {
			_entrymode = Integer.parseInt(entryMode);
			if (_entrymode < 0)
				throw new IllegalArgumentException("Negative value is not allowed - EntryMode: " + entryMode);
			else if (_entrymode > 999)
				throw new IllegalArgumentException("Max 3 digits - EntryMode: " + entryMode);
			tm.getIsomsg().addDE(new DataElement(22, _entrymode, 3));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid EntryMode: " + entryMode);
		}
	}	
	
	public void setAppPan(String appPan) {
		try {
			_apppan = Integer.parseInt(appPan);
			if (_apppan < 0)
				throw new IllegalArgumentException("Negative value is not allowed - AppPan: " + appPan);
			else if (_apppan > 999)
				throw new IllegalArgumentException("Max 2 digits - AppPan: " + appPan);
			tm.getIsomsg().addDE(new DataElement(23, _apppan, 3));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid AppPan: " + appPan);
		}
		
	}

	public void setNii(String nii) {
		try {
			int number = Integer.parseInt(nii);
			
			if (number < 0)
				throw new IllegalArgumentException("Negative value is not allowed - Nii: " + nii);
			else if (number > 999)
				throw new IllegalArgumentException("Max 3 digits - Nii: " + nii);
			
			tm.getIsomsg().addDE(new DataElement(24, number, 3));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid Nii: " + nii);
		}
	}
	
	public void setPosCode(String posCode) {
		try {
			_poscode = Integer.parseInt(posCode);
			if (_poscode < 0)
				throw new IllegalArgumentException("Negative value is not allowed - PosCode: " + posCode);
			else if (_poscode > 99)
				throw new IllegalArgumentException("Max 2 digits - PosCode: " + posCode);
			tm.getIsomsg().addDE(new DataElement(25, _poscode, 2));
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid PosCode: " + posCode);
		}
	}
	
	public void setTrack2(String track2) {
		int lastpos;
	    String str = track2.toUpperCase();
	    this._track2 = str;
	    int pos = str.length();
	    this._track2len = pos;
	    
	    do {
	    	lastpos = str.lastIndexOf('F', pos - 1);
	    	if (lastpos > -1) {
	    		if (lastpos < pos - 1)
	    			throw new IllegalArgumentException("Invalid F chars - Track2: " + track2);
	    		this._track2len = lastpos;
	    	}
	    	
	    	pos--;	    	
	    } while (lastpos > -1);
	    
	    if (track2.length() % 2 == 1)
	    	this._track2 = str + "F";
	    
	    tm.getIsomsg().addDE((new DataElement(35, _track2)).setPacked(true).setL2(EncodeType.BCD).setLnVal(_track2len));
	}

	public void setReferenceNumber(String referenceNumber) {
		if (referenceNumber.length() != 12)
			throw new IllegalArgumentException("Must be 12 chars - ReferenceNumber: " + referenceNumber);
		tm.getIsomsg().addDE(new DataElement(37, referenceNumber));
	}

	public void setApprovalCode(String approvalCode) {
		if (approvalCode.length() != 6)
			throw new IllegalArgumentException("Must be 6 chars - ApprovalCode: " + approvalCode);
		tm.getIsomsg().addDE(new DataElement(38, approvalCode));
	}

	public void setResponseCode(String responseCode) {
		if (responseCode.length() != 2)
			throw new IllegalArgumentException("Must be 2 chars - ResponseCode: " + responseCode);
		this.tm.getIsomsg().addDE(new DataElement(39, responseCode));
	}

	public void setTerminalID(String terminalID) {
		
		if (terminalID.length() != 8)
			throw new IllegalArgumentException("Must be 8 chars - TerminalID: " + terminalID);
		
		tm.getIsomsg().addDE(new DataElement(41, terminalID));
		tm.getIsomsg().setTerminalId(terminalID);	
	}

	public void setMerchantID(String merchantID) {		
		if (merchantID.length() != 15)
			throw new IllegalArgumentException("Must be 15 chars - TerminalID: " + merchantID);

		tm.getIsomsg().addDE(new DataElement(42, merchantID));
	}
	
	public void setPrivateData44(String data) {
		tm.getIsomsg().addDE(new DataElement(44, data).setPacked(true).setL2(EncodeType.BCD));
	}

	public void setPinBlock(String pinBlock) {
		if (pinBlock.length() != 16)
			throw new IllegalArgumentException("Must be 16 chars - PinBlock: " + pinBlock);
		tm.getIsomsg().addDE(new DataElement(52, pinBlock).setPacked(true));
	}

	public void setEmvData(String emvData) {
		if (emvData.length() > 765)
			throw new IllegalArgumentException("Max 765 chars - EmvData: " + emvData);
		tm.getIsomsg().addDE(new DataElement(55, emvData).setPacked(true).setL3(EncodeType.BCD));
	}
	
	public void setPrivateData60(String data) {
		tm.getIsomsg().addDE(new DataElement(60, data).setPacked(true).setL4(EncodeType.BCD));	
	}
	
	public void setPrivateData61(String data) {
		tm.getIsomsg().addDE(new DataElement(61, data).setPacked(true).setL4(EncodeType.BCD));	
	}
	
	public void setPrivateData62(String data) {
		tm.getIsomsg().addDE(new DataElement(62, data).setPacked(true).setL4(EncodeType.BCD));	
	}
	
	public void setPrivateData63(String data) {
		tm.getIsomsg().addDE(new DataElement(63, data).setPacked(true).setL4(EncodeType.BCD));	
	}
}

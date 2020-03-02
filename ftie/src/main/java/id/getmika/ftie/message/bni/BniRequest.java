package id.getmika.ftie.message.bni;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.RequestOption;
import id.getmika.ftie.message.RequestTLEOption;
import id.getmika.ftie.message.TransactionMessage;

public class BniRequest {
	
	private int[] encDElist = new int[] {2, 14, 35, 42, 55, 63};

	protected TransactionMessage tm;
	private RequestOption options;
	private RequestTLEOption TleOptions;
	
	private int _track2len;
	private int _proccode;
	private int _entrymode;	
	private int _poscode;
	private int _apppan;
	private long _pan;
	private long _amount;
	private String _track2;
	private LocalDate _ldtExpired;
	private ZonedDateTime _zdtTransmit;
	private ZonedDateTime _zdtTransact;
	
	public BniRequest(int mti) {
		tm = new TransactionMessage(mti);
		tm.getIsomsg().setEncryptedDEList(encDElist);
		options = new RequestOption();
		TleOptions = new RequestTLEOption();
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

	// ========== Data Element
	
	public long getPan() {
		return _pan;
	}
	
	public void setPan(String pan) {
		try {
			_pan = Long.parseLong(pan);
			if (_pan < 0)
				throw new IllegalArgumentException("Invalid Pan: " + pan);
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid Pan: " + pan);
		}		
	}

	public int getProcessingCode() {
		return _proccode;
	}
	
	public void setProcessingCode(String processingCode) {
		try {
			_proccode = Integer.parseInt(processingCode);
			if (_proccode < 0)
				throw new IllegalArgumentException("Negative value is not allowed - ProcessingCode: " + processingCode);
			else if (_proccode > 999999)
				throw new IllegalArgumentException("Max 999999 - ProcessingCode: " + processingCode);
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid ProcessingCode: " + processingCode);
		}
	}

	public long getAmount() {
		return _amount;
	}
	
	public void setAmount(String amount) {
		try {
			_amount = Long.parseLong(amount);
			if (_amount < 0)
				throw new IllegalArgumentException("Invalid Amount: " + amount);
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid Amount: " + amount);
		}		
	}
	
	public ZonedDateTime getTransmissionDateTime() {
		return _zdtTransmit;
	}
	
	public void setTransmissionDateTime(String strdttm) {
		try {
			_zdtTransmit = ZonedDateTime.parse(strdttm, DateTimeFormatter.ISO_DATE_TIME);
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

	public ZonedDateTime getTransactionDateTime() {
		return _zdtTransact;
	}
	
	public void setTransactionDateTime(String transactionDateTime) {
		try {
			_zdtTransact = ZonedDateTime.parse(transactionDateTime, DateTimeFormatter.ISO_DATE_TIME);
		}
		catch (DateTimeParseException dtpe) {
			throw new IllegalArgumentException("Invalid TransactionDateTime: " + transactionDateTime);
		}
	}

	public LocalDate getExpirationDate() {
		return _ldtExpired;
	}
	
	public void setExpirationDate(String expirationDate) {
		try {
			_ldtExpired = LocalDate.parse(expirationDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		}
		catch (DateTimeParseException dtpe) {
			throw new IllegalArgumentException("Invalid ExpirationDate: " + expirationDate);
		}
	}

	public int getEntryMode() {
		return _entrymode;
	}
	
	public void setEntryMode(String entryMode) {
		try {
			_entrymode = Integer.parseInt(entryMode);
			if (_entrymode < 0)
				throw new IllegalArgumentException("Negative value is not allowed - EntryMode: " + entryMode);
			else if (_entrymode > 999)
				throw new IllegalArgumentException("Max 3 digits - EntryMode: " + entryMode);
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid EntryMode: " + entryMode);
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

	public String getTrack2() {
		return _track2;
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
	}

	public void setReferenceNumber(String referenceNumber) {
		if (referenceNumber.length() != 12)
			throw new IllegalArgumentException("Must be 12 chars - ReferenceNumber: " + referenceNumber);
	}

	public void setApprovalCode(String approvalCode) {
		if (approvalCode.length() != 6)
			throw new IllegalArgumentException("Must be 6 chars - ApprovalCode: " + approvalCode);
	}

	public void setResponseCode(String responseCode) {
		if (responseCode.length() != 2)
			throw new IllegalArgumentException("Must be 2 chars - ResponseCode: " + responseCode);
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

	public void setPinBlock(String pinBlock) {
		if (pinBlock.length() != 16)
			throw new IllegalArgumentException("Must be 16 chars - PinBlock: " + pinBlock);
	}

	public void setEmvData(String emvData) {
		if (emvData.length() > 765)
			throw new IllegalArgumentException("Max 765 chars - EmvData: " + emvData);
	}
	
	public int getPosCode() {
		return _poscode;
	}

	public void setPosCode(String posCode) {
		try {
			_poscode = Integer.parseInt(posCode);
			if (_poscode < 0)
				throw new IllegalArgumentException("Negative value is not allowed - PosCode: " + posCode);
			else if (_poscode > 99)
				throw new IllegalArgumentException("Max 2 digits - PosCode: " + posCode);
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid PosCode: " + posCode);
		}
	}

	public int getAppPan() {
		return _apppan;
	}
	
	public void setAppPan(String appPan) {
		try {
			_apppan = Integer.parseInt(appPan);
			if (_apppan < 0)
				throw new IllegalArgumentException("Negative value is not allowed - AppPan: " + appPan);
			else if (_apppan > 999)
				throw new IllegalArgumentException("Max 2 digits - AppPan: " + appPan);
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid AppPan: " + appPan);
		}
		
	}
	
	protected int getTrack2Length() {
		return _track2len;
	}
		
}

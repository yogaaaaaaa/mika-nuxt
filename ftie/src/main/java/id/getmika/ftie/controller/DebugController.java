package id.getmika.ftie.controller;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.ParseBufferException;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.DataType;
import id.getmika.ftie.message.Element;
import id.getmika.ftie.message.EncodeType;
import id.getmika.ftie.message.IsoMessage;
import id.getmika.ftie.message.TLV;
import id.getmika.ftie.message.bni.BniGenericResponse;

@RestController
public class DebugController extends BaseController {

	private int tpdusrc = 82;
	
	@GetMapping("/debug_response")
	public BniGenericResponse debugResponse() {
		//testBinary();
		//testNumeric();
		//testAlphaNumeric();
		//testAlphaNumericPacked();
		//testDataTypeWithValue();
		//testParse();
		//testDataElement();
		//testIsoMessage();
		//testCreditSaleRequest();
		//testParseCreditSaleRequest();
		//testParseDate();
		//getLogger().info("tpdusrc: " + tpdusrc);
		//testEmv();
		//return new BniResponse();
		//testPAN();
		//testBatchNumber();
		//testToInt();
		//testZonedDateTime();
		//testTLV();
		//return testLTMK();
		return testLoadKey();
	}

	@GetMapping("/debug_trigger")
	public void debugTrigger() {
		//testBinary();
		//testNumeric();
		//testAlphaNumeric();
		//testAlphaNumericPacked();
		//testDataTypeWithValue();
		//testParse();
		//testDataElement();
		//testIsoMessage();
		//testCreditSaleRequest();
		//testParseCreditSaleRequest();
		//testParseDate();
		//getLogger().info("tpdusrc: " + tpdusrc);
		//testEmv();
		//return new BniResponse();
		//testPAN();
		//testBatchNumber();
		//testToInt();
		//testZonedDateTime();
		//testTLV();
		//return testLTMK();
		//return testLoadKey();
	}
	
	public BniGenericResponse testLoadKey() {
		//String respstr = "006C6000010080011020380100028000818700009990821056451206008030303132313934363230006048544C45303330303131323139343632303230313030353630303030303233000000000091D82C5509691AF565F7BC0BDE12E7BF4743991CF1538882B759204400000000";
		String respstr =  "007C60000100800210303801000E8000810000000000000001000125111454581206008030303030313130313235313120202020202035353132313934363230005248544C4530333030313132313934363230323031303035363030303030303900000000007D6D1EF1348AE2E526CF2F299798F7861801463300000000";
		byte[] respbuf = CommonUtil.hexStringToBytes(respstr);
		if (respbuf.length > 0)
			throw new ParseBufferException("woi");
		BniGenericResponse response = new BniGenericResponse("37383123AD4CFDF43492A45D2CB93437");
		response.compose();
		response.parse(respbuf);
		return response;
	}
	
	public BniGenericResponse testLTMK() {
		String respstr = "00576000010080081020380100028000049700009990771858591205008030303132313934363230004748544C453033303030353798CEED61B0CFE04835B52162BB1AFBEAFC28E3BCA9CF69E931EF24AF3BF9C9ADB479CC5F";
		byte[] respbuf = CommonUtil.hexStringToBytes(respstr);
		BniGenericResponse response = new BniGenericResponse("37383123AD4CFDF43492A45D2CB93437");
		response.compose();
		response.parse(respbuf);
		return response;
	}
	
	public void testTLV() {
		String data = "570E5178631000000049D2307221041F82021800950580000480009A031911289C01005F2A0203609F02060000000000019F03060000000000009F090200029F10120110A00001220000000000000000000000FF9F1A0203609F1E0830303030303930359F26082338CF0616A6AF139F2701809F3303E0F8C89F34034203009F3501229F360201669F370475FC5DEB9F4104000016635F340100";
		byte[] buf = CommonUtil.hexStringToBytes(data);
		
		TLV tlv = new TLV(55, data.length() / 2, buf);
		tlv.compose();
		getLogger().info(CommonUtil.bytesToHexString(tlv.getBytes()));
		data = "570E51786310";
		buf = CommonUtil.hexStringToBytes(data);
		tlv = new TLV(55, data.length() / 2, buf);
		tlv.compose();
		getLogger().info(CommonUtil.bytesToHexString(tlv.getBytes()));
	}
	
	public void testZonedDateTime() {
		String transactionDateTime = "2019-11-13T10:49:53.183Z";
		ZonedDateTime zdt = ZonedDateTime.parse(transactionDateTime, DateTimeFormatter.ISO_DATE_TIME);
		int time = zdt.getHour() * 10000 + zdt.getMinute() * 100 + zdt.getSecond();
		int date = zdt.getMonthValue() * 100 + zdt.getDayOfMonth();
		getLogger().info("time: " + time + " - date: " + date);
	}

	public void testParseDate() {
		/*String strTime = "180634";
		String strDate = "20191104";*/
		//LocalDateTime foo = LocalDateTime.now().withMonth(month)
		String strYearMonth = "2019-11-07";
		LocalDate ld = LocalDate.parse(strYearMonth, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		int de14 = (ld.getYear() - 2000) * 100 + ld.getMonthValue();
		
		//LocalDateTime ldt = LocalDateTime.parse(strDate + " " + strTime, DateTimeFormatter.ofPattern("yyyyMMdd HHmmss"));
		
		//getLogger().info(ldt.format(DateTimeFormatter.ofPattern("MMdd")));
		getLogger().info("Year month: " + Integer.toString(de14));
	}
	
	public void testBinary() {
		Element elm = new Element(0, 64);
		elm.setDataType(DataType.BINARY);
		elm.compose();
		getLogger().info("testBinary: " + CommonUtil.bytesToHexString(elm.getBytes()));
	}
	
	public void testNumeric() {
		Element elm = new Element(1500, 12);
		elm.setEncoding(EncodeType.BINARY);
		elm.compose();
		getLogger().info("testNumeric: " + CommonUtil.bytesToHexString(elm.getBytes()));
	}
	
	public void testAlphaNumeric() {
		Element elm = new Element("1234");
		elm.compose();
		getLogger().info("testAlphaNumeric: " + CommonUtil.bytesToHexString(elm.getBytes()));
	}
	
	public void testAlphaNumericPacked() {
		Element elm = new Element("1234");
		elm.setPacked(true);		
		elm.compose();
		getLogger().info("testAlphaNumericPacked: " + CommonUtil.bytesToHexString(elm.getBytes()));
	}
	
	public void testDataTypeWithValue() {
		Element elm = new Element(DataType.NUMERIC, 7);
		elm.compose();
		elm.setValue(92);		
		elm.compose();
		getLogger().info("testDataTypeWithValue: " + CommonUtil.bytesToHexString(elm.getBytes()));
	}

	public void testParse() {
		String strhex = "224300102931393436";
		byte[] data = CommonUtil.hexStringToBytes(strhex);
		getLogger().info("data: " + CommonUtil.bytesToHexString(data));
		Element elm12 = new Element(DataType.NUMERIC, 6);
		elm12.compose();
		Element elm13 = new Element(DataType.NUMERIC, 4);
		elm13.compose();
		Element elm14 = new Element(DataType.ALPHANUMERIC, 4);
		elm14.compose();
		/*byte[] buf = elm12.parse(data);
		getLogger().info("testParse elm12: " + CommonUtil.bytesToHexString(elm12.getBytes()));
		buf = elm13.parse(buf);
		getLogger().info("testParse elm13: " + CommonUtil.bytesToHexString(elm13.getBytes()));
		buf = elm14.parse(buf);
		getLogger().info("testParse elm14: " + CommonUtil.bytesToHexString(elm14.getBytes()));*/
	}
	
	public void testDataElement() {
		String str = "6010047180002475d2105101";
		DataElement de35 = new DataElement(35, str);
		de35.setPacked(true);
		de35.setL2(EncodeType.BCD);
		de35.setLnVal(24);
		de35.compose();
		getLogger().info("testDataElement de35: " + CommonUtil.bytesToHexString(de35.getBytes()));
	}
	
	public void testIsoMessage() {
		String str = "6010047180002475d2105101";
		IsoMessage im = new IsoMessage(200);
		im.addDE(new DataElement(35, str).setPacked(true).setL2(EncodeType.BINARY).setLnVal(24));		
		im.compose();
		getLogger().info("testIsoMessage: " + CommonUtil.bytesToHexString(im.getBytes()));
	}
	
	public void testEmv() {
		String emv = "71a8bcd898db92d3";
		DataElement de = new DataElement(55, emv).setPacked(true).setL3(EncodeType.ASCII);
		de.compose();
		getLogger().info("Emv: " + CommonUtil.bytesToHexString(de.getBytes()));
	}
	
	public void testPAN() {
		String strpan = "4192";
		DataElement de = new DataElement(2, strpan).setPacked(true).setL2(EncodeType.BCD);
		de.compose();
		getLogger().info("Pan: " + CommonUtil.bytesToHexString(de.getBytes()));
	}
	
	public void testBatchNumber() {
		DataElement de = new DataElement(60, 9, 6).setL4(EncodeType.BCD).setLnVal(6);
		de.compose();
		getLogger().info("Batch Number: " + CommonUtil.bytesToHexString(de.getBytes()));
	}
	
	public void testToInt() {
		byte[] bufVal = new byte[] {(byte) 153, (byte) 153, (byte) 153};
	/*	byte a = (byte) 153;
		int c = a & 0xff;
		int td = c >> 4;
		int tu = c & 0x0f;*/
		long result = 0;
		//result = Long.parseUnsignedLong(CommonUtil.bytesToHexString(bufVal));
		int cnt = 1;
		for (int index = bufVal.length - 1; index >= 0; index--) {
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
		getLogger().info("result: " + Long.toString(result));
	}
}

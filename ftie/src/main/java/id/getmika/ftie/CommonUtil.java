package id.getmika.ftie;

public class CommonUtil {

	private static final char[] HEX_ARRAY = "0123456789ABCDEF".toCharArray();
	
	public static String bytesToHexString(byte[] bytes) {
		if (bytes == null) throw new IllegalArgumentException("input bytes null");

		char[] hexChars = new char[bytes.length * 2];
		for (int j = 0; j < bytes.length; j++) {
				int v = bytes[j] & 0xFF;
				hexChars[j * 2] = HEX_ARRAY[v >>> 4];
				hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
		}
		return new String(hexChars);
	}
	
	public static byte[] hexStringToBytes(String s) {
		if (s == null) throw new IllegalArgumentException("input string null");

		int len = s.length();
		byte[] data = new byte[len / 2];
		for (int i = 0; i < len; i += 2) {
				data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
															+ Character.digit(s.charAt(i+1), 16));
		}
		return data;
	}
}

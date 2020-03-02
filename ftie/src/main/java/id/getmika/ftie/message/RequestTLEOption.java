package id.getmika.ftie.message;

public class RequestTLEOption {

	private String LtwkDEK;
	private String LtwkMAK;
	private String TleAcquirerID;
	private String LtwkID;

	public String getLtwkDEK() {
		return LtwkDEK;
	}

	public void setLtwkDEK(String ltwkDEK) {
		LtwkDEK = ltwkDEK;
	}

	public String getLtwkMAK() {
		return LtwkMAK;
	}

	public void setLtwkMAK(String ltwkMAK) {
		LtwkMAK = ltwkMAK;
	}

	public String getTleAcquirerID() {
		return TleAcquirerID;
	}

	public void setTleAcquirerID(String tleAcquirerID) {
		TleAcquirerID = tleAcquirerID;
	}

	public String getLtwkID() {
		return LtwkID;
	}

	public void setLtwkID(String ltwkID) {
		LtwkID = ltwkID;
	}
}

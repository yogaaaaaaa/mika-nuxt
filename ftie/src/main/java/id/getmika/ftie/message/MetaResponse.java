package id.getmika.ftie.message;

public class MetaResponse {

	private String status;
	private String reason;

	public MetaResponse() {
		this.status = "00";
	}
	
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}
}

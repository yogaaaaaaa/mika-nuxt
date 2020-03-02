package id.getmika.ftie.message;

public class RequestOption {

	private String HostTimeout;
	private int timeOut;
	private int tpdunii;
	private String ip;
	private int port;
	
	public RequestOption() {
		timeOut = 10000;
	}
	
	public String getHostTimeout() {
		return HostTimeout;
	}

	public void setHostTimeout(String hostTimeout) {
		HostTimeout = hostTimeout;
		try {
			timeOut = Integer.parseInt(hostTimeout);
			if (timeOut < 1) 
				throw new IllegalArgumentException("Negative value is not allowed - HostTimeout: " + hostTimeout);
			else if (timeOut > 60000)
				throw new IllegalArgumentException("Max 60000 - HostTimeout: " + hostTimeout);
		}
		catch (NumberFormatException nfe) {
			throw new NumberFormatException("Invalid HostTimeout: " + hostTimeout);
		}
	}

	public int getTimeOut() {
		return timeOut;
	}

	public int getTpduNii() {
		return tpdunii;
	}

	public void setTpduNii(int tpdunii) {
		this.tpdunii = tpdunii;
	}

	public String getHostAddress() {
		return ip;
	}

	public void setHostAddress(String ip) {
		this.ip = ip;
	}

	public int getHostPort() {
		return port;
	}

	public void setHostPort(int port) {
		this.port = port;
	}
	
}

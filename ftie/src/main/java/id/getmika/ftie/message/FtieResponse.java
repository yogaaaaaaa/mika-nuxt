package id.getmika.ftie.message;

public class FtieResponse {

	private MetaResponse meta;
	
	public FtieResponse() {
		setMeta(new MetaResponse());
	}

	public MetaResponse getMeta() {
		return meta;
	}

	public void setMeta(MetaResponse meta) {
		this.meta = meta;
	}
}

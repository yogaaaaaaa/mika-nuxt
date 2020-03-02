package id.getmika.ftie.controller;

import java.net.InetSocketAddress;

import org.springframework.beans.factory.annotation.Value;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.bni.BniRequest;
import id.getmika.ftie.message.bni.BniResponse;

public abstract class BniBaseController extends BaseController {

	/*@Qualifier("bniHost")
	@Autowired
	protected InetSocketAddress host;*/
	
	@Value("${bni.tpdu.protoid}")
	private int protoid;
	
	@Value("${bni.tpdu.srccredit}")
	private int tpdusrccredit;
	
	@Value("${bni.tpdu.srcdebit}")
	private int tpdusrcdebit;
	
	@Value("${bni.tpdu.srcnotlecredit}")
	private int tpdusrccnotleredit;
	
	@Value("${bni.tpdu.srcnotledebit}")
	private int tpdusrcnotledebit;
	
	@Value("${bni.tpdu.dest}")
	private int tpdudest;
	
	protected void setCreditTpdu(BniRequest request) {
		request.setTpduProtoId(protoid);
		request.setTpduSource(tpdusrccredit);
		request.setTpduDest(tpdudest);
	}
	
	protected void setDebitTpdu(BniRequest request) {
		request.setTpduProtoId(protoid);
		request.setTpduSource(tpdusrcdebit);
		request.setTpduDest(tpdudest);
	}
	
	protected void setDebitNoTleTpdu(BniRequest request) {
		request.setTpduProtoId(protoid);
		request.setTpduSource(tpdusrcnotledebit);
		request.setTpduDest(tpdudest);
	}
	
	protected void postTransaction(BniRequest request, BniResponse response, String logmsg) {
		response.compose();
		request.compose();
		getLogger().info(CommonUtil.bytesToHexString(request.getBytes()));
		try {
			request.composeTLE();
			processTransaction(request, response, logmsg);
		} catch (Exception e) {
			response.getMeta().setStatus("01");
			response.getMeta().setReason(e.getMessage());
		}
	}
	
	protected void postNonTleTransaction(BniRequest request, BniResponse response, String logmsg) {
		response.compose();
		request.compose();
		getLogger().info(CommonUtil.bytesToHexString(request.getBytes()));
		processTransaction(request, response, logmsg);
	}
	
	private void processTransaction(BniRequest request, BniResponse response, String logmsg) {
		InetSocketAddress host = new InetSocketAddress(request.getOptions().getHostAddress(), request.getOptions().getHostPort());
		byte[] bufReq = request.getBytes();
		byte[] bufResp = sendMessage(host, bufReq, response, request.getOptions().getTimeOut(), logmsg);
		
		if (bufResp == null) {
			response.getMeta().setStatus("01");
			response.getMeta().setReason("input buffer null");
			return;
		}
		if (!response.getMeta().getStatus().equals("00"))
			return;

		response.parse(bufResp);
	}
}

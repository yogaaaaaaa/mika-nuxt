package id.getmika.ftie.controller;

import java.net.InetSocketAddress;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import id.getmika.ftie.CommonUtil;
import id.getmika.ftie.message.DataElement;
import id.getmika.ftie.message.bni.BniGenericRequest;
import id.getmika.ftie.message.bni.BniGenericResponse;

@RestController
public class BniGenericController extends BaseController {

	/*@Qualifier("bniHost")
	@Autowired
	protected InetSocketAddress host;*/
	
	@PostMapping("/bni/tle")
	public BniGenericResponse postTle(@RequestBody BniGenericRequest request) {
		getLogger().info(" ");
		getLogger().info("=======================================================================================");
		BniGenericResponse response = new BniGenericResponse(request.getTleOptions().getLtwkDEK());
		postTleTransaction(request, response, "/bni/tle");
		if (!response.getMeta().getStatus().equals("10"))
			getLogger().info(">>> MTI : " + response.getMti() + " <<<");
		response.printDE(getLogger());
		
		return response;
	}
	
	@PostMapping("/bni/notle")
	public BniGenericResponse postNoTle(@RequestBody BniGenericRequest request) {
		getLogger().info(" ");
		getLogger().info("=======================================================================================");
		BniGenericResponse response = new BniGenericResponse(null);
		postNoTleTransaction(request, response, "/bni/notle");
		if (!response.getMeta().getStatus().equals("10"))
			getLogger().info(">>> MTI : " + response.getMti() + " <<<");
		response.printDE(getLogger());
		return response;
	}
		
	private void postTleTransaction(BniGenericRequest request, BniGenericResponse response, String logmsg) {
		response.compose();
		request.compose();
		
		getLogger().info(">>> TPDU NII: " + request.getOptions().getTpduNii() + " - MTI: " + request.getMti() + " <<<");
		for (DataElement de: request.getTm().getIsomsg().getDataElements())
			getLogger().info("DE " + de.getNumber() + ": " + CommonUtil.bytesToHexString(de.getBytes()));
		
		try {
			request.composeTLE();
			getLogger().info("To Send: " + CommonUtil.bytesToHexString(request.getBytes()));
			processTransaction(request, response, logmsg);
		} catch (Exception e) {
			response.getMeta().setStatus("01");
			response.getMeta().setReason(e.getMessage());
		}
	}
	
	private void postNoTleTransaction(BniGenericRequest request, BniGenericResponse response, String logmsg) {
		response.compose();
		request.compose();
		
		getLogger().info(">>> TPDU NII: " + request.getOptions().getTpduNii() + " - MTI: " + request.getMti() + " <<<");
		for (DataElement de: request.getTm().getIsomsg().getDataElements())
			getLogger().info("DE " + de.getNumber() + ": " + CommonUtil.bytesToHexString(de.getBytes()));
		
		getLogger().info("To Send: " + CommonUtil.bytesToHexString(request.getBytes()));
		processTransaction(request, response, logmsg);
	}

	private void processTransaction(BniGenericRequest request, BniGenericResponse response, String logmsg) {
		
		InetSocketAddress host = new InetSocketAddress(request.getOptions().getHostAddress(), request.getOptions().getHostPort());
		byte[] bufReq = request.getBytes();
		byte[] bufResp = sendMessage(host, bufReq, response, request.getOptions().getTimeOut(), logmsg);
		
		if (!response.getMeta().getStatus().equals("00"))
			return;

		response.parse(bufResp);
	}
	
	
}

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

	@PostMapping("/bni/tle")
	public BniGenericResponse postTle(@RequestBody BniGenericRequest request) {
		long startTime = System.currentTimeMillis();
		BniGenericResponse response = new BniGenericResponse(request.getTleOptions().getLtwkDEK());
		processTransaction(request, response, true);
		long endTime = System.currentTimeMillis();
		long durationMs = (endTime - startTime);

		logRequest("/bni/tle", request, response, durationMs);

		return response;
	}
	
	@PostMapping("/bni/notle")
	public BniGenericResponse postNoTle(@RequestBody BniGenericRequest request) {
		long startTime = System.currentTimeMillis();
		BniGenericResponse response = new BniGenericResponse(null);
		processTransaction(request, response, false);
		long endTime = System.currentTimeMillis();
		long durationMs = (endTime - startTime);

		logRequest("/bni/notle", request, response, durationMs);
		
		return response;
	}

	private void logRequest (String logMessage, BniGenericRequest request, BniGenericResponse response, long durationMs) {
		int tpduNii = request.getOptions().getTpduNii();
		String mti = request.getMti();
		String procCode = request.getProcessingCode();
		String stan = request.getTraceNumber();
		String tid = request.getTerminalID();
		String mid = request.getMerchantID();

		String mtiResponse = response.getMti();
		String responseCode = response.getResponseCode();

		String logSend = "[Send]" + " NII:" + tpduNii + " MTI:" + mti + " PC:" + procCode + " TID:" + tid + " MID:" + mid + " STAN:" + stan;
		String logReceive;
		if(response.getMeta().getStatus().equals("00")) {
			logReceive = "[Receive] " + "MTI:" + mtiResponse + " RC:" + responseCode;
		} else {
			logReceive = "[Error] " + response.getMeta().getStatus() + " - " + response.getMeta().getReason();
		}
		getLogger().info(logMessage + " " + logSend + " " + logReceive + " [" + durationMs + " ms]");
	}

	private void processTransaction(BniGenericRequest request, BniGenericResponse response, boolean isTle) {
		if(getLogger().isDebugEnabled()) {
			request.compose();
			getLogger().debug("");
			getLogger().debug(">>> TPDU NII: " + request.getOptions().getTpduNii() + " - MTI: " + request.getMti() + " <<<");
			for (DataElement de: request.getTm().getIsomsg().getDataElements()) {
				getLogger().debug("DE " + de.getNumber() + ": " + CommonUtil.bytesToHexString(de.getBytes()));
			}
			getLogger().debug("Composed: " + CommonUtil.bytesToHexString(request.getBytes()));
		}

		try {
			if(isTle) {
				request.composeTLE();
			} else {
				request.compose();
			}

			InetSocketAddress host = new InetSocketAddress(request.getOptions().getHostAddress(), request.getOptions().getHostPort());
			byte[] bufferRequest = request.getBytes();
			if(getLogger().isDebugEnabled()) {
				getLogger().debug("Send: " + bufferRequest.length + " bytes > " + CommonUtil.bytesToHexString(bufferRequest));
			}
			byte[] bufferResponse = sendMessage(host, bufferRequest , response, request.getOptions().getTimeOut());

			if (response.getMeta().getStatus().equals("00")) {
				if(getLogger().isDebugEnabled()) {
					getLogger().debug("Receive: " + bufferResponse.length + " bytes < " + CommonUtil.bytesToHexString(bufferResponse));
				}

				response.parse(bufferResponse);
				if(isTle) response.decomposeTle();

				if(getLogger().isDebugEnabled()) {
					getLogger().debug(">>> MTI : " + response.getMti() + " <<<");
					for (DataElement de: response.getTm().getIsomsg().getDataElements()) {
						if (!de.isBeenParsed()) continue;
						getLogger().debug("DE " + de.getNumber() + ": " + CommonUtil.bytesToHexString(de.getBytes()));
					}
				}
			}
		} catch (Exception e) {
			response.getMeta().setStatus("01");
			response.getMeta().setReason(e.getMessage());
		}
	}
}

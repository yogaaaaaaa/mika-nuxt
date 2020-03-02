package id.getmika.ftie.controller;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import com.fasterxml.jackson.core.JsonProcessingException;

import id.getmika.ftie.ParseBufferException;
import id.getmika.ftie.message.FtieResponse;

@ControllerAdvice
public class ExceptionController {
	
	@ExceptionHandler(JsonProcessingException.class)
	@ResponseBody
	public FtieResponse handleJsonProcessingException(JsonProcessingException ex) {
		
		FtieResponse response = new FtieResponse();
		response.getMeta().setStatus("01");
		response.getMeta().setReason(ex.getOriginalMessage());
		
		return response;
	}
	
	@ExceptionHandler(ParseBufferException.class)
	@ResponseBody
	public FtieResponse handleParseBufferException(ParseBufferException ex) {
		
		FtieResponse response = new FtieResponse();
		response.getMeta().setStatus("01");
		response.getMeta().setReason(ex.getMessage());
		
		return response;
	}
}

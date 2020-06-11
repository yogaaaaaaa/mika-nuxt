package id.getmika.ftie.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class BaseController {
	private final Logger logger = LoggerFactory.getLogger(getClass());
	
	protected Logger getLogger() {
		return this.logger;
	}
}

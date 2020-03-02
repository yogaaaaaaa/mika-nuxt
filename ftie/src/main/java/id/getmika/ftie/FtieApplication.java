package id.getmika.ftie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/*import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;*/

@SpringBootApplication
//@EnableAuthorizationServer
//@EnableResourceServer
public class FtieApplication {

	/*@Bean(name="bniTraceNumber")
	public SequenceNumberGenerator getBNITraceNumber() {
		return new SequenceNumberGenerator();
	}*/
	
	/*@Bean(name="bniHost")
	public InetSocketAddress getBniHost() {
		return new InetSocketAddress("10.20.0.250", 2010);
	}*/
	
	public static void main(String[] args) {
		SpringApplication.run(FtieApplication.class, args);
	}
}

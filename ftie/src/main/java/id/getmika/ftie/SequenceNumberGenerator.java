package id.getmika.ftie;

import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

@Component
public class SequenceNumberGenerator {

	private AtomicInteger sequence;
	
	public SequenceNumberGenerator() {
		this.sequence = new AtomicInteger(0);
	}
	
	public int getNextValue() {
		this.sequence.compareAndSet(999999, 0);
		return this.sequence.incrementAndGet();
	}
}

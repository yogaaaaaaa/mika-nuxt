package id.getmika.ftie;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import id.getmika.ftie.message.FtieResponse;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.timeout.ReadTimeoutException;

public class TransactionHandler extends SimpleChannelInboundHandler<ByteBuf> {

	private byte[] bufreq;
	private byte[] bufresp;
	private FtieResponse response;
	private String logmsg;
	
	private final Logger logger = LoggerFactory.getLogger(getClass());
	
	public TransactionHandler(byte[] data, FtieResponse resp, String msg) {
		bufreq = data;
		response = resp;
		logmsg = msg;
	}
	
	@Override
	protected void channelRead0(ChannelHandlerContext ctx, ByteBuf byteBuf) throws Exception {
		this.bufresp = new byte[byteBuf.readableBytes()];
		byteBuf.readBytes(this.bufresp);		
		
		logger.info(logmsg + ": recv < " + CommonUtil.bytesToHexString(this.bufresp));
		ctx.close();
	}
	
	@Override
	public void channelActive(ChannelHandlerContext ctx) {		
		byte[] buffer = this.bufreq;
		ChannelFuture cf = ctx.write(Unpooled.wrappedBuffer(buffer));
		ctx.flush();
		if (cf.isSuccess()) 
			logger.info(logmsg + ": send > " + CommonUtil.bytesToHexString(this.bufreq));
		else {
			logger.error(logmsg +  ": Send failed: " + cf.cause());
			response.getMeta().setStatus("10");
			response.getMeta().setReason("Send failed");
		}
	}
	
	 @Override
     public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
         if (cause instanceof ReadTimeoutException) {
             logger.error(logmsg + ": Receive Timeout");
             response.getMeta().setStatus("10");
             response.getMeta().setReason("Receive Timeout");
         } 
         else {
             super.exceptionCaught(ctx, cause);
         }
     }
	
	public byte[] getBufferResponse() {
		return this.bufresp;
	}
	
	public FtieResponse getResponse() {
		return this.response;
	}
}

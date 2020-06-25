package id.getmika.ftie;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;

public class TransactionHandler extends SimpleChannelInboundHandler<ByteBuf> {
	private byte[] bufferRequest;
	private byte[] bufferResponse;

	private Throwable writeException;
	private Throwable channelException;
	
	public TransactionHandler(byte[] bufferRequest) {
		this.bufferRequest = bufferRequest;
	}

	@Override
	public void channelActive(ChannelHandlerContext ctx) {		
		ChannelFuture writeFuture = ctx.write(Unpooled.wrappedBuffer(this.bufferRequest));
		ctx.flush();
		if(!writeFuture.isSuccess()) this.writeException = writeFuture.cause();
	}
	
	@Override
	protected void channelRead0(ChannelHandlerContext ctx, ByteBuf byteBuf) throws Exception {
		this.bufferResponse = new byte[byteBuf.readableBytes()];
		byteBuf.readBytes(this.bufferResponse);
		ctx.close();
	}
	
	@Override
	public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
		this.channelException = cause;
	}
	
	public byte[] getBufferResponse() {
		return this.bufferResponse;
	}
	
	public Throwable getChannelException() {
		return this.channelException;
	}

	public Throwable getWriteException() {
		return this.writeException;
	}

	public boolean isHandlerFailed() {
		return this.channelException != null || this.writeException != null;
	}
}

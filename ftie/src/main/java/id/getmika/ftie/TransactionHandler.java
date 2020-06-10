package id.getmika.ftie;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.timeout.ReadTimeoutException;

public class TransactionHandler extends SimpleChannelInboundHandler<ByteBuf> {
	private byte[] bufferRequest;
	private byte[] bufferResponse;
	private boolean readTimeout = false;
	private ChannelFuture writeFuture;
	
	public TransactionHandler(byte[] bufferRequest) {
		this.bufferRequest = bufferRequest;
	}

	@Override
	public void channelActive(ChannelHandlerContext ctx) {		
		this.writeFuture = ctx.write(Unpooled.wrappedBuffer(this.bufferRequest));
		ctx.flush();
	}
	
	@Override
	protected void channelRead0(ChannelHandlerContext ctx, ByteBuf byteBuf) throws Exception {
		this.bufferResponse = new byte[byteBuf.readableBytes()];
		byteBuf.readBytes(this.bufferResponse);
		ctx.close();
	}
	
	@Override
	public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
		if(cause instanceof ReadTimeoutException) {
			this.readTimeout = true;
		} else {
			super.exceptionCaught(ctx, cause);
		}
	}
	
	public byte[] getBufferResponse() {
		return this.bufferResponse;
	}

	public ChannelFuture getWriteFuture() {
		return this.writeFuture;
	}

	public boolean isReadTimeout() {
		return this.readTimeout;
	}
}

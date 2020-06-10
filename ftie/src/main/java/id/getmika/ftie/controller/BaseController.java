package id.getmika.ftie.controller;

import java.net.InetSocketAddress;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import id.getmika.ftie.TransactionHandler;
import id.getmika.ftie.message.FtieResponse;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.LengthFieldBasedFrameDecoder;
import io.netty.handler.timeout.ReadTimeoutHandler;

public abstract class BaseController {
	private static final EventLoopGroup eventLoopGroup = new NioEventLoopGroup();
	private final Logger logger = LoggerFactory.getLogger(getClass());
	
	protected Logger getLogger() {
		return this.logger;
	}

	protected byte[] sendMessage(InetSocketAddress addr, byte[] bufferRequest, FtieResponse response, int timeout) {
		TransactionHandler transactionHandler = new TransactionHandler(bufferRequest);
		Bootstrap clientBootstrap = new Bootstrap();
			clientBootstrap
				.group(eventLoopGroup)
				.channel(NioSocketChannel.class)
				.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, timeout)
				.remoteAddress(addr)
				.handler(
					new ChannelInitializer<SocketChannel>() {
						@Override
						protected void initChannel(SocketChannel socketChannel) throws Exception {
							socketChannel.pipeline().addLast(new ReadTimeoutHandler(timeout / 1000));
							socketChannel.pipeline().addLast(new LengthFieldBasedFrameDecoder(4192, 0, 2, 0, 0));
							socketChannel.pipeline().addLast(transactionHandler);							
						}
					}
				);

		try {
			ChannelFuture channelFuture = clientBootstrap.connect().sync();
			channelFuture.channel().closeFuture().sync();

			ChannelFuture writeFuture = transactionHandler.getWriteFuture();
			if(!writeFuture.isSuccess()) {
				response.getMeta().setStatus("10");
				response.getMeta().setReason("Send failed: " + writeFuture.cause());
			} else if(transactionHandler.isReadTimeout()) {
				response.getMeta().setStatus("10");
				response.getMeta().setReason("Receive timeout");
			}
		}
		catch (Exception e) {
			response.getMeta().setStatus("10");
			response.getMeta().setReason(e.getMessage());
		}

		if(!response.getMeta().getStatus().equals("00")){
			logger.debug(response.getMeta().getReason());
		}

		return transactionHandler.getBufferResponse();
	}
}

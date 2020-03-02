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

	private final Logger logger = LoggerFactory.getLogger(getClass());
	
	protected Logger getLogger() {
		return this.logger;
	}

	protected byte[] sendMessage(InetSocketAddress addr, byte[] data, FtieResponse resp, int TimeOut, String logmsg) {
		
		TransactionHandler handler = new TransactionHandler(data, resp, logmsg);
		
		EventLoopGroup group = new NioEventLoopGroup();
		try {			
			
		    Bootstrap clientBootstrap = new Bootstrap();
		    clientBootstrap
		    	.group(group)
		    	.channel(NioSocketChannel.class)
		    	.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, TimeOut) // 10s
		    	.remoteAddress(addr)
		    	.handler(
		    			new ChannelInitializer<SocketChannel>() {
							@Override
							protected void initChannel(SocketChannel socketChannel) throws Exception {
								socketChannel.pipeline().addLast(new ReadTimeoutHandler(TimeOut / 1000));
								socketChannel.pipeline().addLast(new LengthFieldBasedFrameDecoder(4192, 0, 2, 0, 0));
								socketChannel.pipeline().addLast(handler);							
							}		    				
		    			});
		    
		    ChannelFuture channelFuture = clientBootstrap.connect().sync();
		    channelFuture.channel().closeFuture().sync();		    
		}  
		catch (Exception e) {
			resp.getMeta().setStatus("10");
			resp.getMeta().setReason(e.getMessage());
			logger.error(e.getMessage() + " - " + e.getClass().getCanonicalName());
		}
		finally {
			group.shutdownGracefully();	
		}		
		
		return handler.getBufferResponse();
	}
}

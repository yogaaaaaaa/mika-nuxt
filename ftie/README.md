# FTIE - Financial Transaction Interface Engine
Banking host middleware, ISO Message to HTTP JSON translator.

## TLDR; Building application
Make sure `java` version 1.8 and `maven` is installed. To build a JAR file, run
```sh
mvn package
```
The built application file is located in `target` directory.

## Configuration
Default configuration in `src/resources/application.properties` can be overridden
using environment variable or command line argument.
```sh
# Using argument parameter to override 'server.port'
java -jar target/ftie-1.0.0.jar --server.port=8080

# Using environment variable to override 'server.port'
export SERVER_PORT=8080
java -jar target/ftie-1.0.0.jar

# Override root log level
java -jar target/ftie-1.0.0.jar --logging.level.root=INFO

# Override ftie class log level
java -jar target/ftie-1.0.0.jar --logging.level.id.getmika=DEBUG
```

## Development Guides

### Spring Boot Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/docs/2.1.9.RELEASE/maven-plugin/)
* [Spring Web](https://docs.spring.io/spring-boot/docs/2.2.0.RELEASE/reference/htmlsingle/#boot-features-developing-web-applications)

### Spring Boot Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/bookmarks/)


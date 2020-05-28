FROM maven:3.6.0-jdk-8-alpine AS build

# Upgrade Alpine packages and install OpenSSL
RUN apk update && \
    apk upgrade && \
    apk add --no-cache openssl nss-dev nss

COPY src /usr/src/app/src  
COPY pom.xml /usr/src/app

WORKDIR /usr/src/app

ENV MAVEN_OPTS="-XX:+TieredCompilation -XX:TieredStopAtLevel=1"

RUN mvn -T 1C -f /usr/src/app/pom.xml clean package

RUN ls -l /usr/src/app/target
############################################################################

# Base Alpine Linux based image with OpenJDK JRE only
FROM openjdk:8-jdk-alpine

# Project maintainer
LABEL maintainer="cljung@microsoft.com"

# Add a volume pointing to /tmp
VOLUME /tmp

WORKDIR /opt
COPY --from=build /usr/src/app/target/java-rest-api-b2c*.jar /opt/app.jar
RUN ls -l /opt
# Make port 8080 available to the world outside this container
EXPOSE 8081

# Setup application entry point
ENTRYPOINT ["java","-jar","/opt/app.jar"]  

############################################################################
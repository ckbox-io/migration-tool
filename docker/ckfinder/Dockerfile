FROM openjdk:27-ea-jdk-slim-trixie

RUN apt update && apt install -y git
RUN git clone https://github.com/ckfinder/ckfinder-docs-samples-java.git

WORKDIR /ckfinder-docs-samples-java

RUN ./mvnw package
RUN sed 's/enabled: false/enabled: true/' -i ckfinder.yml
RUN sed 's/csrfProtection: true/csrfProtection: false/' -i ckfinder.yml

EXPOSE 8080

CMD ["java", "-jar", "target/ckfinder-docs-samples-java-4.0.1.jar"]

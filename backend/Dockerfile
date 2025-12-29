FROM eclipse-temurin:25.0.1_8-jdk-alpine-3.23 AS build

WORKDIR /build

COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
RUN ./gradlew --no-daemon dependencies

COPY src src
RUN ./gradlew --no-daemon bootJar

FROM eclipse-temurin:25.0.1_8-jre-alpine-3.23

WORKDIR /app
COPY --from=build /build/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# Dockerfile for Jarr Backend — Koyeb Deployment
# Multi-stage build: build with Maven, run with minimal JRE

# Stage 1: Build
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:resolve
COPY src/ src/
RUN ./mvnw package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Koyeb sets PORT env var; Spring Boot reads server.port
# Render free tier provides 512MB RAM, restrict JVM to prevent OOM
ENV SPRING_PROFILES_ACTIVE=production
ENV JAVA_OPTS="-Xmx256m -Xms256m"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

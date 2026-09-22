#  Stage 1 – Build the JAR with Maven
FROM maven:3.9-eclipse-temurin-26 AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .

# Download dependencies without building the whole project
RUN mvn dependency:go-offline -q

# Copy the full source and build
COPY src/ src/
RUN mvn package -DskipTests -q

#  Stage 2 – Minimal runtime image
FROM eclipse-temurin:26-jre-alpine

LABEL maintainer="groupe3"
LABEL description="numero1 – Spring Boot application"

WORKDIR /app

# Create a non-root user for security best-practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the fat JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

RUN chown appuser:appgroup app.jar

USER appuser

# Expose the default Spring Boot port
EXPOSE 8080

# Use exec form so the JVM receives OS signals properly
ENTRYPOINT ["java", "-jar", "app.jar"]

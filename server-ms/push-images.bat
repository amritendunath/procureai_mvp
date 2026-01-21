@echo off
set /p DOCKER_USER="Enter your Docker Hub Username: "

echo Logging in to Docker Hub...
docker login -u %DOCKER_USER%

echo Building and Pushing API Gateway...
docker build -t %DOCKER_USER%/procure-ai-api-gateway ./api-gateway
docker push %DOCKER_USER%/procure-ai-api-gateway

echo Building and Pushing Vendor Service...
docker build -t %DOCKER_USER%/procure-ai-vendor-service ./vendor-service
docker push %DOCKER_USER%/procure-ai-vendor-service

echo Building and Pushing RFP Service...
docker build -t %DOCKER_USER%/procure-ai-rfp-service ./rfp-service
docker push %DOCKER_USER%/procure-ai-rfp-service

echo Building and Pushing AI Service...
docker build -t %DOCKER_USER%/procure-ai-ai-service ./ai-service
docker push %DOCKER_USER%/procure-ai-ai-service

echo Building and Pushing Email Service...
docker build -t %DOCKER_USER%/procure-ai-email-service ./email-service
docker push %DOCKER_USER%/procure-ai-email-service

echo.
echo All images pushed successfully!
pause

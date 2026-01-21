@echo off
cd /d "%~dp0"
echo Starting ProcureAI Microservices...

:: API Gateway (Port 8000)
start "API Gateway" /D "api-gateway" npm run dev

:: Backend Services
start "Vendor Service" /D "vendor-service" npm run dev
start "RFP Service" /D "rfp-service" npm run dev
start "AI Service" /D "ai-service" npm run dev
start "Email Service" /D "email-service" npm run dev

:: Frontend Client
@REM start "ProcureAI Client" /D "client" npm run dev

echo ---------------------------------------------
echo All services are starting in separate windows.
echo API Gateway: http://localhost:8000
echo Client: http://localhost:5173
echo ---------------------------------------------
pause

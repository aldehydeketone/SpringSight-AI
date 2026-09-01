@echo off
echo ========================================================
echo         Starting SpringSight AI (Backend + Frontend)
echo ========================================================

REM Unset conflicting environment variables from other projects
set "SPRING_DATASOURCE_URL="
set "SPRING_DATASOURCE_USERNAME="
set "SPRING_DATASOURCE_PASSWORD="

echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "SpringSight AI - Backend" cmd /k ".\mvnw.cmd spring-boot:run"

echo [2/2] Starting React Frontend (Port 3000)...
start "SpringSight AI - Frontend" cmd /k "cd frontend && npm run dev"

echo ========================================================
echo Project is launching!
echo - Backend:  http://localhost:8080
echo - Frontend: http://localhost:3000
echo ========================================================

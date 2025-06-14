# Script para actualizar y ejecutar el proyecto

Write-Host "===== Actualizando el proyecto... =====" -ForegroundColor Green

# Instalar las dependencias requeridas
Write-Host "`n> Actualizando dependencias npm..." -ForegroundColor Yellow
npm install

# Verificar si hay errores en la base de datos
Write-Host "`n> Sincronizando modelos con la base de datos..." -ForegroundColor Yellow
npm run db:sync

# Iniciar el servidor con base de datos
Write-Host "`n> Iniciando el servidor con base de datos..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "npm run dev:db"

Write-Host "`n===== Proyecto actualizado y ejecutándose =====" -ForegroundColor Green
Write-Host "El servidor está corriendo en http://localhost:3003" -ForegroundColor Cyan
Write-Host "Para detener el servidor, cierra la ventana de PowerShell" -ForegroundColor Cyan

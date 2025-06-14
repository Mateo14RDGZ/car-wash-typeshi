# Script para actualizar y ejecutar el proyecto

Write-Host "===== Actualizando el proyecto... =====" -ForegroundColor Green

# Detener cualquier proceso existente (opcional)
Write-Host "`n> Verificando si hay servidores en ejecución..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Encontrados procesos de Node.js. Intentando detener procesos relacionados con el proyecto..."
    foreach ($process in $nodeProcesses) {
        try {
            $process | Stop-Process -Force -ErrorAction SilentlyContinue
            Write-Host "Detenido proceso con PID $($process.Id)"
        } catch {
            Write-Host "No se pudo detener proceso con PID $($process.Id)" -ForegroundColor Yellow
        }
    }
    # Esperar un momento para que los procesos se detengan
    Start-Sleep -Seconds 2
}

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
Write-Host "Para probar la API de horarios disponibles:" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri 'http://localhost:3003/api/bookings/available-slots?date=2025-06-17' | ConvertTo-Json -Depth 5" -ForegroundColor Yellow
Write-Host "`nPara detener el servidor, cierra la ventana de PowerShell" -ForegroundColor Cyan

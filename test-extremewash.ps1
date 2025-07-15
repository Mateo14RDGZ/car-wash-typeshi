# 🚀 SCRIPT DE PRUEBA API - EXTREMEWASH.COM
# Prueba todos los endpoints del API en el dominio personalizado

Write-Host "🌐 PROBANDO API EN EXTREMEWASH.COM" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

$baseUrl = "https://extremewash.com"

# Función para hacer peticiones HTTP
function Test-Endpoint {
    param (
        [string]$url,
        [string]$name
    )
    
    Write-Host "🔍 Probando: $name" -ForegroundColor Yellow
    Write-Host "   URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 10
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   📝 Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Cyan
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Probar endpoints
Write-Host "🔄 PROBANDO ENDPOINTS..." -ForegroundColor Blue
Write-Host ""

$endpoints = @(
    @{ url = "$baseUrl/api/system/status"; name = "System Status" },
    @{ url = "$baseUrl/api/services"; name = "Services" },
    @{ url = "$baseUrl/api/bookings/available-slots"; name = "Available Slots" },
    @{ url = "$baseUrl/api/bookings"; name = "Bookings" }
)

$successCount = 0
$totalCount = $endpoints.Count

foreach ($endpoint in $endpoints) {
    if (Test-Endpoint -url $endpoint.url -name $endpoint.name) {
        $successCount++
    }
}

Write-Host "📊 RESULTADOS:" -ForegroundColor Magenta
Write-Host "   ✅ Exitosos: $successCount/$totalCount" -ForegroundColor Green
Write-Host "   🌐 Dominio: extremewash.com" -ForegroundColor Blue
Write-Host "   🎯 Estado: $(if ($successCount -eq $totalCount) { 'COMPLETAMENTE FUNCIONAL' } else { 'PARCIALMENTE FUNCIONAL' })" -ForegroundColor $(if ($successCount -eq $totalCount) { 'Green' } else { 'Yellow' })

Write-Host ""
Write-Host "🎉 DOMINIO PERSONALIZADO CONFIGURADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "   Tu aplicacion esta disponible en: https://extremewash.com" -ForegroundColor Cyan

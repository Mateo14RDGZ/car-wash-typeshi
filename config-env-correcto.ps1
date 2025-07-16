# Script para configurar variables de entorno con valores correctos

$env_values = @{
    "DB_HOST" = "roundhouse.proxy.rlwy.net"
    "DB_PORT" = "47292"
    "DB_NAME" = "car_wash_db"
    "DB_PASS" = "Mateo54764325%$"
}

Write-Host "🔧 Configurando variables de entorno en Vercel..."

foreach ($key in $env_values.Keys) {
    $value = $env_values[$key]
    Write-Host "📝 Configurando $key = $value"
    
    # Crear archivo temporal con el valor
    $tempFile = "temp_$key.txt"
    $value | Out-File -FilePath $tempFile -NoNewline -Encoding UTF8
    
    # Configurar en Vercel
    Get-Content $tempFile | vercel env add $key production
    
    # Limpiar archivo temporal
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

Write-Host "✅ Variables configuradas. Haciendo deploy..."
vercel --prod

Write-Host "🎉 Configuración completada!"

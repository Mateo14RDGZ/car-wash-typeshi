# Script PowerShell para configurar variables de entorno en Vercel

Write-Host "🔧 Configurando variables de entorno en Vercel..."

# Crear archivos temporales con los valores
"roundhouse.proxy.rlwy.net" | Out-File -FilePath ".temp_db_host" -NoNewline
"47292" | Out-File -FilePath ".temp_db_port" -NoNewline
"car_wash_db" | Out-File -FilePath ".temp_db_name" -NoNewline

# Configurar variables en Vercel
Write-Host "📝 Configurando DB_HOST..."
Get-Content ".temp_db_host" | vercel env add DB_HOST production

Write-Host "📝 Configurando DB_PORT..."
Get-Content ".temp_db_port" | vercel env add DB_PORT production

Write-Host "📝 Configurando DB_NAME..."
Get-Content ".temp_db_name" | vercel env add DB_NAME production

# Limpiar archivos temporales
Remove-Item ".temp_db_host", ".temp_db_port", ".temp_db_name" -ErrorAction SilentlyContinue

Write-Host "✅ Variables configuradas correctamente"
Write-Host "🚀 Haciendo deploy..."

# Deploy
vercel --prod

Write-Host "🎉 Configuración completada!"

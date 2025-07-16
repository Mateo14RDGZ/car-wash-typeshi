#!/bin/bash

# Script para configurar variables de entorno automáticamente en Vercel

# Configurar variables de entorno usando archivo temporal
echo "roundhouse.proxy.rlwy.net" > .temp_db_host
echo "47292" > .temp_db_port
echo "car_wash_db" > .temp_db_name

# Configurar variables en Vercel
vercel env add DB_HOST production < .temp_db_host
vercel env add DB_PORT production < .temp_db_port
vercel env add DB_NAME production < .temp_db_name

# Limpiar archivos temporales
rm .temp_db_host .temp_db_port .temp_db_name

echo "✅ Variables configuradas correctamente"
echo "🚀 Haciendo deploy..."

# Deploy
vercel --prod

echo "🎉 Configuración completada!"

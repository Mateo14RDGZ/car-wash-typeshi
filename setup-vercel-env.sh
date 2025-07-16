#!/bin/bash

# Script para configurar variables de entorno en Vercel
# Ejecutar: vercel env add DB_HOST
# Ejecutar: vercel env add DB_USER  
# Ejecutar: vercel env add DB_PASS
# Ejecutar: vercel env add DB_NAME

echo "🔧 Configurando variables de entorno para Vercel..."

# Configurar variables de entorno una por una
echo "📋 Instrucciones para configurar variables de entorno:"
echo "1. Ejecuta: vercel env add DB_HOST"
echo "   Valor: 127.0.0.1"
echo "2. Ejecuta: vercel env add DB_USER"
echo "   Valor: root"
echo "3. Ejecuta: vercel env add DB_PASS"
echo "   Valor: Mateo54764325%$"
echo "4. Ejecuta: vercel env add DB_NAME"
echo "   Valor: car_wash_db"
echo "5. Ejecuta: vercel env add NODE_ENV"
echo "   Valor: production"

echo ""
echo "🌐 Después de configurar las variables, ejecuta:"
echo "vercel --prod"
echo ""
echo "📱 Tu aplicación estará disponible en:"
echo "https://car-wash-typeshi.vercel.app"

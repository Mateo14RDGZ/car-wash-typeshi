#!/bin/bash

# Script para configurar el despliegue en Vercel

# Asegurarse de que se está usando la versión correcta de Node.js
export NODE_VERSION=18

# Instalar las dependencias necesarias
npm install

# Configurar el entorno de producción
export NODE_ENV=production
export VERCEL_DEPLOYMENT=true

echo "Configuración completada para Vercel"

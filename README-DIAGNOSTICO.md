# 🔍 DIAGNÓSTICO VERCEL - Car Wash Booking

## 🎯 Propósito

Esta es una versión ultra-simplificada del sistema para diagnosticar errores de deployment en Vercel.

## 📋 Estado actual

- **Build local**: ✅ Funcionando (4/4 archivos copiados)
- **Configuración**: Simplificada al máximo
- **Dependencias**: Solo las esenciales (cors, express)

## 🔧 Archivos de diagnóstico

- `diagnostico-vercel.js` - API minimalista sin dependencias complejas
- `build-diagnostic.js` - Build que funciona localmente
- `package-diagnostic.json` - Configuración mínima
- `vercel-diagnostic.json` - Configuración básica de Vercel

## 🚀 Endpoints disponibles

- `/api/api-bridge` → Redirige a diagnóstico
- `/api/diagnostico` → Información del sistema
- Todos los endpoints devuelven JSON con información útil

## 🔍 Información que proporciona

- Versión de Node.js
- Información del sistema
- Estado de dependencias
- Variables de entorno
- Detalles de errores (si ocurren)

## 📝 Próximos pasos

1. Verificar que este deployment funcione
2. Revisar logs de Vercel
3. Identificar el problema específico
4. Restaurar configuración completa una vez solucionado

---

_Este es un deployment temporal para diagnóstico_

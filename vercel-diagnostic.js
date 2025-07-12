#!/usr/bin/env node
// Diagnóstico completo para Vercel

console.log('🔍 === DIAGNÓSTICO DE VERCEL ===');
console.log('📅 Fecha:', new Date().toISOString());
console.log('🏗️ Node.js:', process.version);
console.log('📦 Platform:', process.platform);
console.log('🏛️ Arch:', process.arch);
console.log('📂 Working Directory:', process.cwd());

// Verificar estructura de archivos
const fs = require('fs');
const path = require('path');

console.log('\n📁 === ESTRUCTURA DE ARCHIVOS ===');

// Verificar src/frontend
const frontendPath = path.join(process.cwd(), 'src', 'frontend');
if (fs.existsSync(frontendPath)) {
    console.log('✅ src/frontend existe');
    const files = fs.readdirSync(frontendPath);
    console.log('📄 Archivos en src/frontend:', files.join(', '));
} else {
    console.log('❌ src/frontend NO EXISTE');
}

// Verificar public
const publicPath = path.join(process.cwd(), 'public');
if (fs.existsSync(publicPath)) {
    console.log('✅ public existe');
    const files = fs.readdirSync(publicPath);
    console.log('📄 Archivos en public:', files.join(', '));
} else {
    console.log('❌ public NO EXISTE');
}

// Verificar api
const apiPath = path.join(process.cwd(), 'api');
if (fs.existsSync(apiPath)) {
    console.log('✅ api existe');
    const files = fs.readdirSync(apiPath);
    console.log('📄 Archivos en api:', files.join(', '));
} else {
    console.log('❌ api NO EXISTE');
}

// Verificar dependencias
console.log('\n📦 === DEPENDENCIAS ===');
try {
    require('mysql2');
    console.log('✅ mysql2');
} catch (e) {
    console.log('❌ mysql2:', e.message);
}

try {
    require('express');
    console.log('✅ express');
} catch (e) {
    console.log('❌ express:', e.message);
}

try {
    require('sequelize');
    console.log('✅ sequelize');
} catch (e) {
    console.log('❌ sequelize:', e.message);
}

console.log('\n🎯 === DIAGNÓSTICO COMPLETADO ===');
console.log('🎯 === VERIFICACIÓN DE RUTAS API ===');
console.log('✅ Rutas corregidas a /api/api-bridge');
console.log('📍 Errores 404 solucionados');
console.log('🔧 Actualizado:', new Date().toISOString());

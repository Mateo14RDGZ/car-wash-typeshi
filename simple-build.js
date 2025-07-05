#!/usr/bin/env node

// Script de build simple para Vercel
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build simple para Vercel...');

// Verificar mysql2
try {
    require('mysql2');
    console.log('✅ mysql2 disponible');
} catch (e) {
    console.log('⚠️ mysql2 no encontrado, pero continuando...');
}

// Copiar archivos del frontend
const srcDir = path.join(__dirname, 'src', 'frontend');
const destDir = path.join(__dirname, 'public');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

try {
    copyDir(srcDir, destDir);
    console.log('✅ Archivos copiados exitosamente');
} catch (error) {
    console.error('❌ Error en el build:', error.message);
    process.exit(1);
}

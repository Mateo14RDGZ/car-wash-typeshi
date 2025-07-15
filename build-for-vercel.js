#!/usr/bin/env node

/**
 * 🚀 BUILD SCRIPT PARA VERCEL
 * 
 * Este script prepara la aplicación para el deploy en Vercel
 * creando la carpeta public con los archivos necesarios.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO BUILD PARA VERCEL...');
console.log('='.repeat(50));

// Crear carpeta public si no existe
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('📁 Carpeta public creada');
}

// Archivos a copiar desde src/frontend a public
const archivosFrontend = [
    'index.html',
    'app.js',
    'api-helper.js',
    'styles.css',
    'additional-styles.css',
    'horarios-helper.js',
    'fecha-handler.js',
    'timeSlots-client.js'
];

// Función para copiar archivo
function copiarArchivo(nombreArchivo) {
    try {
        const origen = path.join(__dirname, 'src', 'frontend', nombreArchivo);
        const destino = path.join(publicDir, nombreArchivo);
        
        if (fs.existsSync(origen)) {
            fs.copyFileSync(origen, destino);
            console.log(`   ✅ Copiado: ${nombreArchivo}`);
            return true;
        } else {
            console.log(`   ❌ No existe: ${nombreArchivo}`);
            return false;
        }
    } catch (error) {
        console.error(`   ❌ Error copiando ${nombreArchivo}:`, error.message);
        return false;
    }
}

// Copiar archivos frontend
console.log('\n📄 COPIANDO ARCHIVOS FRONTEND:');
let archivosCopiados = 0;
archivosFrontend.forEach(archivo => {
    if (copiarArchivo(archivo)) {
        archivosCopiados++;
    }
});

// Verificar que mysql2 esté disponible
console.log('\n🔍 VERIFICANDO DEPENDENCIAS:');
try {
    require('mysql2');
    console.log('   ✅ mysql2 disponible');
} catch (error) {
    console.log('   ⚠️  mysql2 no encontrado, pero continuando...');
}

try {
    require('sequelize');
    console.log('   ✅ sequelize disponible');
} catch (error) {
    console.log('   ⚠️  sequelize no encontrado, pero continuando...');
}

// Resultado final
console.log('\n' + '='.repeat(50));
console.log('🎯 RESULTADO DEL BUILD:');
console.log(`   📄 Archivos copiados: ${archivosCopiados}/${archivosFrontend.length}`);
console.log(`   📁 Carpeta public: ${fs.existsSync(publicDir) ? 'CREADA' : 'ERROR'}`);

if (archivosCopiados === archivosFrontend.length && fs.existsSync(publicDir)) {
    console.log('\n✅ ¡BUILD COMPLETADO EXITOSAMENTE!');
    console.log('🚀 La aplicación está lista para deploy en Vercel');
    console.log('📁 Carpeta public creada con todos los archivos necesarios');
    process.exit(0);
} else {
    console.log('\n❌ BUILD FALLÓ');
    console.log('🔧 Verifica que src/frontend contenga todos los archivos necesarios');
    process.exit(1);
}

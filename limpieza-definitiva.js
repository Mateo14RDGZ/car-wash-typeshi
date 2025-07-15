/**
 * 🧹 LIMPIEZA DEFINITIVA DEL WORKSPACE
 * 
 * Script mejorado para eliminar TODOS los archivos innecesarios
 * de forma definitiva.
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPIEZA DEFINITIVA DEL WORKSPACE');
console.log('='.repeat(60));

// ARCHIVOS A ELIMINAR DE FORMA DEFINITIVA
const archivosAEliminar = [
    // Archivos de prueba y testing
    'test-horarios-ocupados.js',
    'test-modal-cliente.js',
    'diagnostico-horarios.js',
    'prueba-post-deploy.js',
    
    // Archivos de verificación 
    'verificar-rutas-api.js',
    'verificar-sistema-mysql.js',
    'verify-mysql.js',
    
    // Archivos temporales MySQL-only
    'api-bridge-mysql-only.js',
    'api-helper-mysql-only.js',
    
    // Archivos de desarrollo
    'copy-frontend-to-public.js',
    'limpiar-workspace.js',
    'fix-horarios-ocupados.js',
    
    // Documentación de desarrollo
    'DIAGNOSTICO-HORARIOS-OCUPADOS.md',
    'SISTEMA-MYSQL-ONLY-FINAL.md',
    'SOLUCION-404-APLICADA.md',
    'LIMPIEZA-WORKSPACE-COMPLETA.md',
    
    // Archivos duplicados (mantener solo src/frontend)
    'app.js',
    'index.html',
    'api-helper.js',
    'styles.css',
    'additional-styles.css',
    'horarios-helper.js',
    'fecha-handler.js',
    'timeSlots-client.js',
];

// CARPETAS A ELIMINAR
const carpetasAEliminar = [
    'public'
];

// Función para eliminar archivo
function eliminarArchivo(archivo) {
    const rutaCompleta = path.join(__dirname, archivo);
    try {
        if (fs.existsSync(rutaCompleta)) {
            fs.unlinkSync(rutaCompleta);
            console.log(`   ✅ ELIMINADO: ${archivo}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`   ❌ ERROR eliminando ${archivo}:`, error.message);
        return false;
    }
}

// Función para eliminar carpeta
function eliminarCarpeta(carpeta) {
    const rutaCompleta = path.join(__dirname, carpeta);
    try {
        if (fs.existsSync(rutaCompleta)) {
            fs.rmSync(rutaCompleta, { recursive: true, force: true });
            console.log(`   ✅ CARPETA ELIMINADA: ${carpeta}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`   ❌ ERROR eliminando carpeta ${carpeta}:`, error.message);
        return false;
    }
}

// Ejecutar limpieza
console.log('\n📄 ELIMINANDO ARCHIVOS:');
let eliminados = 0;
archivosAEliminar.forEach(archivo => {
    if (eliminarArchivo(archivo)) eliminados++;
});

console.log('\n📁 ELIMINANDO CARPETAS:');
let carpetasEliminadas = 0;
carpetasAEliminar.forEach(carpeta => {
    if (eliminarCarpeta(carpeta)) carpetasEliminadas++;
});

// Verificar estructura final
console.log('\n🔍 ESTRUCTURA FINAL:');
const archivosRestantes = fs.readdirSync(__dirname).filter(item => {
    const stat = fs.statSync(path.join(__dirname, item));
    return stat.isFile();
});

console.log('   📄 Archivos en raíz:', archivosRestantes.length);
archivosRestantes.forEach(archivo => {
    console.log(`      - ${archivo}`);
});

console.log('\n' + '='.repeat(60));
console.log('🎯 RESUMEN:');
console.log(`   📄 Archivos eliminados: ${eliminados}`);
console.log(`   📁 Carpetas eliminadas: ${carpetasEliminadas}`);
console.log(`   📄 Archivos restantes: ${archivosRestantes.length}`);

if (archivosRestantes.length <= 12) {
    console.log('\n✅ ¡LIMPIEZA EXITOSA!');
    console.log('🎉 Workspace limpio y optimizado');
} else {
    console.log('\n⚠️  Aún hay archivos que podrían eliminarse');
}

// Auto-eliminarse
setTimeout(() => {
    try {
        fs.unlinkSync(__filename);
        console.log('\n🗑️  Script de limpieza auto-eliminado');
    } catch (e) {
        console.log('\n⚠️  No se pudo auto-eliminar el script');
    }
}, 1000);

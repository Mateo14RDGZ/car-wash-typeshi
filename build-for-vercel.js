#!/usr/bin/env node

/**
 * 🚀 BUILD SCRIPT ROBUSTO PARA VERCEL
 * 
 * Este script prepara la aplicación para el deploy en Vercel
 * con manejo de errores y validaciones completas.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO BUILD PARA VERCEL...');
console.log('='.repeat(60));

// Función para limpiar carpeta
function limpiarCarpeta(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`�️  Carpeta ${dirPath} limpiada`);
    }
}

// Función para crear carpeta
function crearCarpeta(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Carpeta ${dirPath} creada`);
        return true;
    }
    return false;
}

// Función para copiar archivo con validación
function copiarArchivo(origen, destino, nombreArchivo) {
    try {
        if (fs.existsSync(origen)) {
            const contenido = fs.readFileSync(origen, 'utf8');
            fs.writeFileSync(destino, contenido, 'utf8');
            console.log(`   ✅ ${nombreArchivo} copiado (${contenido.length} bytes)`);
            return true;
        } else {
            console.log(`   ❌ ${nombreArchivo} no encontrado en ${origen}`);
            return false;
        }
    } catch (error) {
        console.error(`   ❌ Error copiando ${nombreArchivo}:`, error.message);
        return false;
    }
}

// Verificar directorio fuente
const srcFrontend = path.join(__dirname, 'src', 'frontend');
console.log(`\n🔍 VERIFICANDO DIRECTORIO FUENTE: ${srcFrontend}`);

if (!fs.existsSync(srcFrontend)) {
    console.error('❌ ERROR: No existe src/frontend/');
    process.exit(1);
}

const archivosEnSrc = fs.readdirSync(srcFrontend);
console.log(`   📄 Archivos encontrados: ${archivosEnSrc.join(', ')}`);

// Limpiar y crear carpeta public
const publicDir = path.join(__dirname, 'public');
console.log(`\n📁 PREPARANDO CARPETA PUBLIC: ${publicDir}`);
limpiarCarpeta(publicDir);
crearCarpeta(publicDir);

// Lista de archivos esenciales
const archivosEsenciales = [
    'index.html',
    'app.js',
    'api-helper.js',
    'styles.css',
    'additional-styles.css',
    'horarios-helper.js',
    'fecha-handler.js',
    'timeSlots-client.js'
];

// Copiar archivos
console.log('\n📄 COPIANDO ARCHIVOS FRONTEND:');
let archivosCopiados = 0;
let archivosCriticosFaltantes = [];

archivosEsenciales.forEach(archivo => {
    const origen = path.join(srcFrontend, archivo);
    const destino = path.join(publicDir, archivo);
    
    if (copiarArchivo(origen, destino, archivo)) {
        archivosCopiados++;
    } else {
        if (['index.html', 'app.js', 'api-helper.js', 'styles.css'].includes(archivo)) {
            archivosCriticosFaltantes.push(archivo);
        }
    }
});

// Verificar archivos críticos
if (archivosCriticosFaltantes.length > 0) {
    console.error(`\n❌ ARCHIVOS CRÍTICOS FALTANTES: ${archivosCriticosFaltantes.join(', ')}`);
    process.exit(1);
}

// Crear archivo de índice básico si no existe
const indexPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.log('\n⚠️  Creando index.html básico...');
    const htmlBasico = `<!DOCTYPE html>
<html>
<head>
    <title>Extreme Wash - Cargando...</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>Extreme Wash</h1>
    <p>Cargando aplicación...</p>
    <script>
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    </script>
</body>
</html>`;
    fs.writeFileSync(indexPath, htmlBasico);
    console.log('   ✅ index.html básico creado');
}

// Verificar dependencias
console.log('\n🔍 VERIFICANDO DEPENDENCIAS:');
const dependencias = ['mysql2', 'sequelize', 'express', 'cors'];
dependencias.forEach(dep => {
    try {
        require(dep);
        console.log(`   ✅ ${dep} disponible`);
    } catch (error) {
        console.log(`   ⚠️  ${dep} no encontrado`);
    }
});

// Verificar API
console.log('\n🔍 VERIFICANDO API:');
const apiPath = path.join(__dirname, 'api');
if (fs.existsSync(apiPath)) {
    const apiFiles = fs.readdirSync(apiPath);
    console.log(`   ✅ API disponible: ${apiFiles.join(', ')}`);
} else {
    console.log('   ❌ Carpeta API no encontrada');
}

// Resultado final
console.log('\n' + '='.repeat(60));
console.log('🎯 RESULTADO DEL BUILD:');
console.log(`   📄 Archivos copiados: ${archivosCopiados}/${archivosEsenciales.length}`);
console.log(`   📁 Carpeta public existe: ${fs.existsSync(publicDir)}`);
console.log(`   📄 index.html existe: ${fs.existsSync(indexPath)}`);

const archivosEnPublic = fs.readdirSync(publicDir);
console.log(`   📄 Archivos en public: ${archivosEnPublic.join(', ')}`);

if (archivosCopiados >= 4 && fs.existsSync(publicDir) && fs.existsSync(indexPath)) {
    console.log('\n✅ ¡BUILD COMPLETADO EXITOSAMENTE!');
    console.log('🚀 Aplicación lista para Vercel');
    console.log('📁 Carpeta public con archivos necesarios');
    
    // Crear archivo de verificación
    const verificacionPath = path.join(publicDir, 'build-info.json');
    const buildInfo = {
        timestamp: new Date().toISOString(),
        archivosCopiados,
        totalArchivos: archivosEsenciales.length,
        archivosEnPublic: archivosEnPublic,
        status: 'success'
    };
    fs.writeFileSync(verificacionPath, JSON.stringify(buildInfo, null, 2));
    console.log('📄 Archivo de verificación creado: build-info.json');
    
    process.exit(0);
} else {
    console.log('\n❌ BUILD INCOMPLETO');
    console.log('🔧 Algunos archivos no se copiaron correctamente');
    process.exit(1);
}

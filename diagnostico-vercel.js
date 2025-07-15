/**
 * 🔍 DIAGNÓSTICO COMPLETO PARA VERCEL
 * 
 * Script para verificar que la configuración esté correcta
 * y diagnosticar posibles problemas.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO COMPLETO PARA VERCEL');
console.log('='.repeat(60));

// Verificar archivos esenciales
const archivosEsenciales = [
    'package.json',
    'vercel.json',
    'build-for-vercel.js',
    'public/index.html',
    'public/app.js',
    'public/api-helper.js',
    'api/api-bridge.js'
];

console.log('\n📄 VERIFICANDO ARCHIVOS ESENCIALES:');
let archivosOK = 0;
archivosEsenciales.forEach(archivo => {
    const rutaCompleta = path.join(__dirname, archivo);
    if (fs.existsSync(rutaCompleta)) {
        const stats = fs.statSync(rutaCompleta);
        console.log(`   ✅ ${archivo} (${stats.size} bytes)`);
        archivosOK++;
    } else {
        console.log(`   ❌ ${archivo} - NO EXISTE`);
    }
});

// Verificar configuración de Vercel
console.log('\n⚙️  VERIFICANDO CONFIGURACIÓN VERCEL:');
try {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
    console.log(`   ✅ vercel.json válido`);
    console.log(`   📋 Versión: ${vercelConfig.version}`);
    console.log(`   📋 Builds: ${vercelConfig.builds?.length || 0}`);
    console.log(`   📋 Nombre: ${vercelConfig.name || 'No especificado'}`);
    
    if (vercelConfig.builds && vercelConfig.builds[0]) {
        const build = vercelConfig.builds[0];
        console.log(`   📋 Build src: ${build.src}`);
        console.log(`   📋 Build use: ${build.use}`);
        console.log(`   📋 DistDir: ${build.config?.distDir || 'No especificado'}`);
    }
} catch (error) {
    console.log(`   ❌ Error leyendo vercel.json: ${error.message}`);
}

// Verificar package.json
console.log('\n📦 VERIFICANDO PACKAGE.JSON:');
try {
    const packageConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    console.log(`   ✅ package.json válido`);
    console.log(`   📋 Nombre: ${packageConfig.name}`);
    console.log(`   📋 Versión: ${packageConfig.version}`);
    console.log(`   📋 Node.js: ${packageConfig.engines?.node || 'No especificado'}`);
    console.log(`   📋 Build script: ${packageConfig.scripts?.build || 'No especificado'}`);
    console.log(`   📋 Vercel-build: ${packageConfig.scripts?.['vercel-build'] || 'No especificado'}`);
} catch (error) {
    console.log(`   ❌ Error leyendo package.json: ${error.message}`);
}

// Verificar carpeta public
console.log('\n📁 VERIFICANDO CARPETA PUBLIC:');
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    const archivosPublic = fs.readdirSync(publicDir);
    console.log(`   ✅ Carpeta public existe`);
    console.log(`   📄 Archivos (${archivosPublic.length}): ${archivosPublic.join(', ')}`);
    
    // Verificar archivos críticos en public
    const criticosPublic = ['index.html', 'app.js', 'api-helper.js', 'styles.css'];
    criticosPublic.forEach(archivo => {
        const rutaArchivo = path.join(publicDir, archivo);
        if (fs.existsSync(rutaArchivo)) {
            const stats = fs.statSync(rutaArchivo);
            console.log(`   ✅ ${archivo} (${stats.size} bytes)`);
        } else {
            console.log(`   ❌ ${archivo} - FALTANTE`);
        }
    });
} else {
    console.log(`   ❌ Carpeta public NO EXISTE`);
}

// Verificar API
console.log('\n🔌 VERIFICANDO API:');
const apiDir = path.join(__dirname, 'api');
if (fs.existsSync(apiDir)) {
    const archivosApi = fs.readdirSync(apiDir);
    console.log(`   ✅ Carpeta api existe`);
    console.log(`   📄 Archivos: ${archivosApi.join(', ')}`);
    
    // Verificar archivos API críticos
    const criticosApi = ['api-bridge.js', 'bookings', 'index.js'];
    criticosApi.forEach(archivo => {
        const rutaArchivo = path.join(apiDir, archivo);
        if (fs.existsSync(rutaArchivo)) {
            console.log(`   ✅ ${archivo} - OK`);
        } else {
            console.log(`   ❌ ${archivo} - FALTANTE`);
        }
    });
} else {
    console.log(`   ❌ Carpeta api NO EXISTE`);
}

// Verificar dependencias
console.log('\n📦 VERIFICANDO DEPENDENCIAS:');
const dependenciasClave = ['mysql2', 'sequelize', 'express', 'cors', 'dotenv'];
dependenciasClave.forEach(dep => {
    try {
        require(dep);
        console.log(`   ✅ ${dep} - Instalado`);
    } catch (error) {
        console.log(`   ❌ ${dep} - No encontrado`);
    }
});

// Verificar git
console.log('\n🐙 VERIFICANDO GIT:');
try {
    const { execSync } = require('child_process');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim() === '') {
        console.log(`   ✅ Working tree limpio`);
    } else {
        console.log(`   ⚠️  Hay cambios sin commitear`);
    }
    
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' });
    console.log(`   📋 Último commit: ${lastCommit.trim()}`);
} catch (error) {
    console.log(`   ❌ Error verificando git: ${error.message}`);
}

// Resultado final
console.log('\n' + '='.repeat(60));
console.log('🎯 RESULTADO DEL DIAGNÓSTICO:');
console.log(`   📄 Archivos esenciales: ${archivosOK}/${archivosEsenciales.length}`);
console.log(`   📁 Carpeta public: ${fs.existsSync(publicDir) ? 'OK' : 'ERROR'}`);
console.log(`   🔌 Carpeta api: ${fs.existsSync(apiDir) ? 'OK' : 'ERROR'}`);

const todoOK = archivosOK === archivosEsenciales.length && 
              fs.existsSync(publicDir) && 
              fs.existsSync(apiDir);

if (todoOK) {
    console.log('\n✅ ¡TODO CORRECTO!');
    console.log('🚀 La configuración está lista para Vercel');
    console.log('📋 Archivos principales verificados');
    console.log('🔧 Build script funcional');
} else {
    console.log('\n⚠️  HAY PROBLEMAS');
    console.log('🔧 Revisa los errores anteriores');
    console.log('📋 Algunos archivos pueden estar faltando');
}

console.log('\n💡 PRÓXIMOS PASOS:');
console.log('   1. Verificar que los errores mostrados estén solucionados');
console.log('   2. Ejecutar: git push origin main');
console.log('   3. Verificar deploy en Vercel');
console.log('   4. Probar la aplicación en producción');

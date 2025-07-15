/**
 * 🔧 BUILD SIMPLIFICADO PARA VERCEL
 * 
 * Versión minimalista para diagnosticar problemas de build
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO BUILD DIAGNÓSTICO PARA VERCEL...');

try {
    // Verificar directorio fuente
    const srcFrontend = path.join(__dirname, 'src', 'frontend');
    console.log('🔍 Verificando directorio fuente:', srcFrontend);
    
    if (!fs.existsSync(srcFrontend)) {
        console.error('❌ Directorio src/frontend no existe');
        process.exit(1);
    }
    
    // Crear directorio public
    const publicDir = path.join(__dirname, 'public');
    console.log('📁 Preparando directorio public:', publicDir);
    
    if (fs.existsSync(publicDir)) {
        fs.rmSync(publicDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(publicDir, { recursive: true });
    
    // Copiar archivos básicos
    const filesToCopy = [
        'index.html',
        'app.js',
        'styles.css',
        'api-helper.js'
    ];
    
    let copiedCount = 0;
    
    filesToCopy.forEach(file => {
        const srcFile = path.join(srcFrontend, file);
        const destFile = path.join(publicDir, file);
        
        if (fs.existsSync(srcFile)) {
            try {
                fs.copyFileSync(srcFile, destFile);
                console.log(`   ✅ ${file} copiado`);
                copiedCount++;
            } catch (error) {
                console.log(`   ❌ Error copiando ${file}:`, error.message);
            }
        } else {
            console.log(`   ⚠️  ${file} no encontrado`);
        }
    });
    
    // Crear archivo de información
    const buildInfo = {
        timestamp: new Date().toISOString(),
        copiedFiles: copiedCount,
        totalFiles: filesToCopy.length,
        buildMode: 'diagnostic',
        nodeVersion: process.version,
        platform: process.platform
    };
    
    fs.writeFileSync(
        path.join(publicDir, 'build-info.json'),
        JSON.stringify(buildInfo, null, 2)
    );
    
    console.log('✅ BUILD DIAGNÓSTICO COMPLETADO');
    console.log(`📄 Archivos copiados: ${copiedCount}/${filesToCopy.length}`);
    console.log('🎯 Directorio public creado exitosamente');
    
} catch (error) {
    console.error('❌ ERROR EN BUILD DIAGNÓSTICO:', error);
    process.exit(1);
}

/**
 * 🚀 BUILD SCRIPT PARA PRODUCCIÓN - COMPATIBLE CON WINDOWS
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO BUILD DE PRODUCCIÓN...');

try {
    // Crear directorio public si no existe
    const publicDir = path.join(__dirname, 'public');
    
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log('📁 Directorio public creado');
    } else {
        console.log('📁 Directorio public ya existe');
    }
    
    // Crear archivo build-info.json
    const buildInfo = {
        status: 'build-completed',
        timestamp: new Date().toISOString(),
        environment: 'production',
        version: '1.0.0'
    };
    
    fs.writeFileSync(
        path.join(publicDir, 'build-info.json'),
        JSON.stringify(buildInfo, null, 2)
    );
    
    console.log('✅ BUILD DE PRODUCCIÓN COMPLETADO');
    console.log('📄 Archivo build-info.json creado');
    
} catch (error) {
    console.error('❌ ERROR EN BUILD:', error);
    process.exit(1);
}

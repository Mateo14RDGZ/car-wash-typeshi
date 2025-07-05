const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando proceso de build para Vercel...');

// Verificar Node.js
console.log('📋 Información del entorno:');
console.log(`   - Node.js: ${process.version}`);
console.log(`   - Platform: ${process.platform}`);
console.log(`   - Arch: ${process.arch}`);

// Función para copiar archivos recursivamente
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        // Crear directorio destino si no existe
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        // Copiar todos los archivos del directorio
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        // Crear directorio padre si no existe
        const parentDir = path.dirname(dest);
        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }
        // Copiar archivo individual
        fs.copyFileSync(src, dest);
    }
}

// Rutas
const frontendSrc = path.join(__dirname, 'src', 'frontend');
const publicDest = path.join(__dirname, 'public');

try {
    console.log('🚀 Iniciando copia de archivos del frontend...');
    console.log(`📁 Origen: ${frontendSrc}`);
    console.log(`📁 Destino: ${publicDest}`);
    
    // Verificar que existe el directorio source
    if (!fs.existsSync(frontendSrc)) {
        throw new Error(`❌ El directorio source no existe: ${frontendSrc}`);
    }
    
    // Crear directorio destino si no existe
    if (!fs.existsSync(publicDest)) {
        fs.mkdirSync(publicDest, { recursive: true });
        console.log('✅ Directorio public/ creado');
    }
    
    // Copiar archivos
    copyRecursiveSync(frontendSrc, publicDest);
    
    console.log('✅ Archivos del frontend copiados exitosamente a public/');
    
    // Listar archivos copiados
    const files = fs.readdirSync(publicDest);
    console.log('📄 Archivos en public/:');
    files.forEach(file => {
        const filePath = path.join(publicDest, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${stats.size} bytes)`);
    });
    
    console.log('🎯 Build completado exitosamente');
    
} catch (error) {
    console.error('❌ Error al copiar archivos del frontend:', error.message);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
}

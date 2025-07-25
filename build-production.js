const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO BUILD DE PRODUCCIÓN PARA CAR WASH TYPESHI...');

const publicDir = path.join(__dirname, 'public');
console.log('📂 Verificando directorio:', publicDir);

if (!fs.existsSync(publicDir)) {
    console.error('❌ ERROR: Directorio public no existe');
    process.exit(1);
}

console.log('✅ Directorio public existe');

const requiredFiles = ['index.html', 'styles.css', 'app.js', 'api-helper.js'];

let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ Encontrado: ${file}`);
    } else {
        console.error(`❌ FALTA: ${file}`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.error('❌ FALTAN ARCHIVOS CRÍTICOS');
    process.exit(1);
}

const buildInfo = {
    status: 'build-completed',
    timestamp: new Date().toISOString(),
    environment: 'production',
    version: '1.0.0',
    project: 'car-wash-typeshi',
    files: requiredFiles
};

fs.writeFileSync(path.join(publicDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
console.log('✅ BUILD COMPLETADO EXITOSAMENTE');

/**
 * 🚀 BUILD SCRIPT PARA PRODUCCIÓN - CAR WASH TYPESHI
 * Construye la aplicación para despliegue en Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 INICIANDO BUILD DE PRODUCCIÓN PARA CAR WASH TYPESHI...');

try {
    // Crear directorio public si no existe
    const publicDir = path.join(__dirname, 'public');
    
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log('📁 Directorio public creado');
    } else {
        console.log('📁 Directorio public ya existe');
    }
    
    // Archivos fuente en src/frontend
    const sourceDir = path.join(__dirname, 'src', 'frontend');
    
    // Lista de archivos a copiar
    const filesToCopy = [
        'index.html',
        'styles.css',
        'app.js',
        'api-helper.js',
        'fecha-handler.js',
        'horarios-helper.js',
        'timeSlots-client.js',
        'additional-styles.css'
    ];
    
    // Copiar archivos de frontend a public
    filesToCopy.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(publicDir, file);
        
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ Copiado: ${file}`);
        } else {
            console.log(`⚠️  No encontrado: ${file}`);
        }
    });
    
    // Crear archivo de configuración de build
    const buildInfo = {
        status: 'build-completed',
        timestamp: new Date().toISOString(),
        environment: 'production',
        version: '1.0.0',
        project: 'car-wash-typeshi',
        url: 'https://car-wash-typeshi.vercel.app',
        files: filesToCopy.filter(file => 
            fs.existsSync(path.join(sourceDir, file))
        )
    };
    
    fs.writeFileSync(
        path.join(publicDir, 'build-info.json'),
        JSON.stringify(buildInfo, null, 2)
    );
    
    // Crear archivo package.json para public
    const publicPackageJson = {
        name: 'car-wash-typeshi-frontend',
        version: '1.0.0',
        description: 'Frontend estático para Car Wash Typeshi',
        main: 'index.html'
    };
    
    fs.writeFileSync(
        path.join(publicDir, 'package.json'),
        JSON.stringify(publicPackageJson, null, 2)
    );
    
    // Crear README para public
    const readmeContent = `# Car Wash Typeshi - Frontend

Sistema de reservas para lavado de autos.

## Información del Build
- Construido: ${new Date().toISOString()}
- Ambiente: Producción
- URL: https://car-wash-typeshi.vercel.app

## Archivos incluidos
${buildInfo.files.map(file => `- ${file}`).join('\n')}

## API Endpoints
- GET /api/status - Estado del sistema
- GET /api/services - Servicios disponibles  
- GET /api/available-slots?date=YYYY-MM-DD - Horarios disponibles
- GET /api/bookings - Obtener reservas
- POST /api/bookings - Crear nueva reserva
`;
    
    fs.writeFileSync(
        path.join(publicDir, 'README.md'),
        readmeContent
    );
    
    console.log('✅ BUILD DE PRODUCCIÓN COMPLETADO');
    console.log('📄 Archivos creados:');
    console.log('   - build-info.json');
    console.log('   - package.json');
    console.log('   - README.md');
    console.log(`📁 Directorio de destino: ${publicDir}`);
    console.log('🌐 URL del proyecto: https://car-wash-typeshi.vercel.app');
    
} catch (error) {
    console.error('❌ ERROR EN BUILD:', error);
    process.exit(1);
}

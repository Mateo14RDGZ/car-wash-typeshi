// Verificar instalación de mysql2 en Vercel
console.log('🔍 Verificando instalación de mysql2...');

try {
    const mysql2 = require('mysql2');
    console.log('✅ mysql2 instalado correctamente');
    console.log('📦 Versión de mysql2:', mysql2.version || 'No disponible');
} catch (error) {
    console.error('❌ Error al cargar mysql2:', error.message);
    console.log('🔧 Intentando instalar mysql2...');
    
    const { execSync } = require('child_process');
    try {
        execSync('npm install mysql2@^3.14.1', { stdio: 'inherit' });
        console.log('✅ mysql2 instalado exitosamente');
    } catch (installError) {
        console.error('❌ Error al instalar mysql2:', installError.message);
        process.exit(1);
    }
}

console.log('🔍 Verificando otras dependencias críticas...');

// Verificar sequelize
try {
    require('sequelize');
    console.log('✅ sequelize disponible');
} catch (error) {
    console.error('❌ Error con sequelize:', error.message);
}

// Verificar dotenv
try {
    require('dotenv');
    console.log('✅ dotenv disponible');
} catch (error) {
    console.error('❌ Error con dotenv:', error.message);
}

console.log('🎯 Verificación de dependencias completada');

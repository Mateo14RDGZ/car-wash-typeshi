/**
 * 🔧 SCRIPT DE INSTALACIÓN - CAR WASH TYPESHI
 * Script para configurar el proyecto con MySQL
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CONFIGURANDO CAR WASH TYPESHI...\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ No se encontró el archivo .env');
    console.log('💡 Creando archivo .env de ejemplo...');
    
    const envExample = `# ⚙️ CONFIGURACIÓN DE ENTORNO - CAR WASH TYPESHI
# Configuración para desarrollo local y producción

# Base de datos MySQL
DB_HOST=localhost
DB_NAME=car_wash_db
DB_USER=root
DB_PASS=TU_CONTRASEÑA_AQUÍ
DB_PORT=3306

# Configuración de la aplicación
NODE_ENV=development
PORT=3000

# URL de la aplicación
APP_URL=http://localhost:3000
VERCEL_URL=https://car-wash-typeshi.vercel.app`;

    fs.writeFileSync(envPath, envExample);
    console.log('✅ Archivo .env creado');
    console.log('🔧 EDITA EL ARCHIVO .env CON TU CONTRASEÑA DE MYSQL');
    console.log('📝 Luego ejecuta: node setup.js\n');
    process.exit(0);
}

// Función para ejecutar comandos
function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 Ejecutando: ${command} ${args.join(' ')}`);
        
        const process = spawn(command, args, { 
            stdio: 'inherit',
            shell: true
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

async function setup() {
    try {
        console.log('📦 Instalando dependencias...');
        await runCommand('npm', ['install']);
        
        console.log('\n🗄️ Probando conexión a la base de datos...');
        await runCommand('node', ['test-database.js']);
        
        console.log('\n✅ ¡CONFIGURACIÓN COMPLETADA!');
        console.log('\n📖 PRÓXIMOS PASOS:');
        console.log('1. 🗄️ Ejecuta el archivo database-setup.sql en MySQL Workbench');
        console.log('2. 🚀 Ejecuta: npm run dev para desarrollo');
        console.log('3. 🏗️ Ejecuta: npm run build para producción');
        
        console.log('\n🌐 URLs:');
        console.log('- Local: http://localhost:3000');
        console.log('- Vercel: https://car-wash-typeshi.vercel.app');
        
        console.log('\n🔧 MYSQL WORKBENCH:');
        console.log('- Host: localhost');
        console.log('- Port: 3306');
        console.log('- Database: car_wash_db');
        console.log('- Username: root');
        console.log('- Password: (tu contraseña en .env)');
        
        console.log('\n📊 COMANDOS ÚTILES:');
        console.log('- npm run db:init    # Inicializar base de datos');
        console.log('- npm run db:migrate # Migrar esquema');
        console.log('- npm run db:seed    # Insertar datos iniciales');
        console.log('- node test-database.js  # Probar conexión');
        
    } catch (error) {
        console.error('❌ Error durante la configuración:', error.message);
        
        console.error('\n🔧 POSIBLES SOLUCIONES:');
        console.error('1. Verificar que MySQL esté ejecutándose');
        console.error('2. Verificar credenciales en el archivo .env');
        console.error('3. Ejecutar: npm install');
        console.error('4. Crear la base de datos car_wash_db manualmente');
        
        process.exit(1);
    }
}

setup();

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    console.log('🔧 Configurando base de datos...\n');

    try {
        // Conectar a MySQL sin especificar base de datos
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || ''
        });

        const dbName = process.env.DB_NAME || 'car_wash_db';

        // Crear la base de datos si no existe
        console.log(`📦 Creando base de datos '${dbName}' si no existe...`);
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Base de datos '${dbName}' lista.\n`);

        // Cerrar conexión
        await connection.end();

        // Ahora inicializar las tablas
        console.log('📋 Inicializando tablas...');
        const { initDatabase } = require('./src/database/init');
        const initialized = await initDatabase();

        if (initialized) {
            console.log('\n✅ ¡Base de datos configurada exitosamente!');
            console.log('\n📌 Próximos pasos:');
            console.log('1. Crea un archivo .env basándote en .env.example');
            console.log('2. Configura tus credenciales de base de datos');
            console.log('3. Ejecuta: npm run dev:db para usar el servidor con base de datos');
        } else {
            console.error('\n❌ Error al inicializar las tablas');
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error al configurar la base de datos:', error.message);
        console.error('\n📌 Asegúrate de:');
        console.error('1. Tener MySQL instalado y ejecutándose');
        console.error('2. Las credenciales en el archivo .env sean correctas');
        console.error('3. El usuario tenga permisos para crear bases de datos');
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
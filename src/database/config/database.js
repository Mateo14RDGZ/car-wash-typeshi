/**
 * 🔧 CONFIGURACIÓN DE BASE DE DATOS - CAR WASH TYPESHI
 * Configuración para MySQL local y producción
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Configuración de la conexión
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'car_wash_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '-03:00', // Ajustar según tu zona horaria
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
};

// Crear instancia de Sequelize
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
);

// Función para probar la conexión
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida correctamente');
        console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`🗄️  Base de datos: ${dbConfig.database}`);
        console.log(`👤 Usuario: ${dbConfig.username}`);
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a MySQL:', error.message);
        console.error('🔧 Verificar configuración en .env');
        return false;
    }
}

// Función para sincronizar modelos
async function syncDatabase() {
    try {
        await sequelize.sync({ force: false });
        console.log('✅ Base de datos sincronizada');
    } catch (error) {
        console.error('❌ Error al sincronizar base de datos:', error.message);
    }
}

// Exportar instancia y funciones
module.exports = {
    sequelize,
    testConnection,
    syncDatabase
}; 
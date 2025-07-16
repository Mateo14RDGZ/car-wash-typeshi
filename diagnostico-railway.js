/**
 * 🔍 Script de diagnóstico para conexión a Railway
 * Prueba diferentes configuraciones de conexión
 */

const mysql = require('mysql2/promise');

// Configuraciones posibles de Railway
const configs = [
    {
        name: 'Config 1: Railway Proxy',
        host: 'roundhouse.proxy.rlwy.net',
        port: 47292,
        user: 'root',
        password: 'Mateo54764325%$',
        database: 'car_wash_db'
    },
    {
        name: 'Config 2: Railway Internal',
        host: 'mysql.railway.internal',
        port: 3306,
        user: 'root',
        password: 'Mateo54764325%$',
        database: 'car_wash_db'
    },
    {
        name: 'Config 3: Railway con database "railway"',
        host: 'roundhouse.proxy.rlwy.net',
        port: 47292,
        user: 'root',
        password: 'UVjnBgHKhkQwsdhJLshjXYTmYFfQUaQA',
        database: 'railway'
    }
];

async function testConnection(config) {
    try {
        console.log(`\n🔄 Probando: ${config.name}`);
        console.log(`   Host: ${config.host}:${config.port}`);
        console.log(`   Database: ${config.database}`);
        console.log(`   User: ${config.user}`);
        
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            connectTimeout: 10000, // 10 segundos
            acquireTimeout: 10000,
            timeout: 10000
        });
        
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log(`   ✅ CONEXIÓN EXITOSA - Respuesta: ${JSON.stringify(rows)}`);
        
        // Probar si existen las tablas
        try {
            const [tables] = await connection.execute('SHOW TABLES');
            console.log(`   📋 Tablas encontradas: ${tables.map(t => Object.values(t)[0]).join(', ')}`);
        } catch (e) {
            console.log(`   ⚠️  Error al listar tablas: ${e.message}`);
        }
        
        await connection.end();
        return true;
        
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return false;
    }
}

async function diagnoseRailway() {
    console.log('🚀 DIAGNÓSTICO DE CONEXIÓN A RAILWAY');
    console.log('=====================================');
    
    for (const config of configs) {
        const success = await testConnection(config);
        if (success) {
            console.log(`\n🎯 CONFIGURACIÓN EXITOSA ENCONTRADA: ${config.name}`);
            console.log('📋 Usar estos valores en Vercel:');
            console.log(`   DB_HOST=${config.host}`);
            console.log(`   DB_PORT=${config.port}`);
            console.log(`   DB_USER=${config.user}`);
            console.log(`   DB_PASS=${config.password}`);
            console.log(`   DB_NAME=${config.database}`);
            break;
        }
    }
    
    console.log('\n🏁 Diagnóstico completado');
}

if (require.main === module) {
    diagnoseRailway().catch(console.error);
}

module.exports = { diagnoseRailway };

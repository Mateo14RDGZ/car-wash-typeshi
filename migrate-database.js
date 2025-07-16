/**
 * 🔧 SCRIPT DE MIGRACIÓN - CAR WASH TYPESHI
 * Ejecuta el script SQL para crear la estructura de la base de datos
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

async function runMigration() {
    console.log('🚀 EJECUTANDO MIGRACIÓN DE BASE DE DATOS...\n');
    
    try {
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'database-migration.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Configurar conexión
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });
        
        console.log('✅ Conexión establecida con MySQL');
        
        // Dividir el script en comandos individuales
        const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);
        
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.trim()) {
                try {
                    await connection.execute(command);
                    console.log(`✅ Comando ${i + 1}/${commands.length} ejecutado`);
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.log(`⚠️  Comando ${i + 1}: ${error.message}`);
                    }
                }
            }
        }
        
        console.log('\n✅ Script SQL ejecutado correctamente');
        
        // Verificar tablas creadas
        const [tables] = await connection.execute('SHOW TABLES FROM car_wash_db');
        console.log('\n📊 Tablas creadas:');
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
        // Verificar datos iniciales
        const [services] = await connection.execute('SELECT * FROM car_wash_db.services');
        console.log(`\n🛠️ Servicios insertados: ${services.length}`);
        services.forEach(service => {
            console.log(`   - ${service.name}: $${service.price} (${service.service_type})`);
        });
        
        await connection.end();
        
        console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('\n📖 PRÓXIMOS PASOS:');
        console.log('1. Ejecutar: node test-database.js');
        console.log('2. Abrir MySQL Workbench y conectar a la base de datos');
        console.log('3. Ejecutar: npm run dev para desarrollo');
        
        console.log('\n🔧 CONFIGURACIÓN PARA MYSQL WORKBENCH:');
        console.log('- Host: localhost (o 127.0.0.1)');
        console.log('- Port: 3306');
        console.log('- Username: root');
        console.log('- Password: (tu contraseña del .env)');
        console.log('- Default Schema: car_wash_db');
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n🔧 SOLUCIÓN: Verificar que MySQL esté ejecutándose');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n🔧 SOLUCIÓN: Verificar credenciales en el archivo .env');
        } else {
            console.error('\n🔧 SOLUCIÓN: Verificar configuración de MySQL');
        }
        
        process.exit(1);
    }
}

runMigration();

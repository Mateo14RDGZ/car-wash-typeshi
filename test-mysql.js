const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Probando conexión a MySQL...\n');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || ''
        });
        
        console.log('✅ ¡Conexión exitosa a MySQL!');
        
        // Mostrar versión
        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log('📌 Versión de MySQL:', rows[0].version);
        
        // Mostrar bases de datos
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('\n📁 Bases de datos existentes:');
        databases.forEach(db => console.log('  -', db.Database));
        
        await connection.end();
        
        console.log('\n✅ Todo listo para configurar tu proyecto');
        console.log('👉 Ejecuta: npm run setup:db');
        
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('1. Verifica que MySQL esté ejecutándose');
        console.log('2. Revisa las credenciales en el archivo .env');
        console.log('3. Si usas XAMPP, abre el panel de control y dale Start a MySQL');
        console.log('4. Si instalaste MySQL Server, busca "Services" en Windows y verifica que "MySQL80" esté corriendo');
    }
}

testConnection();
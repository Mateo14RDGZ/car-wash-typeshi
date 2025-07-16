/**
 * Script para crear una base de datos local de prueba
 */

const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Mateo54764325%$',
    port: 3306,
    charset: 'utf8mb4'
};

async function setupLocalDB() {
    try {
        console.log('🔧 Conectando a MySQL local...');
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('📋 Creando base de datos...');
        await connection.execute('CREATE DATABASE IF NOT EXISTS car_wash_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        
        console.log('🔄 Usando base de datos...');
        await connection.execute('USE car_wash_db');
        
        console.log('📝 Creando tabla de servicios...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS services (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                service_type VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                duration INT NOT NULL,
                description TEXT,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('📝 Creando tabla de reservas...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                booking_date DATE NOT NULL,
                time_slot VARCHAR(20) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                service_id INT NOT NULL,
                status VARCHAR(20) DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_booking_date (booking_date),
                INDEX idx_time_slot (time_slot),
                FOREIGN KEY (service_id) REFERENCES services(id)
            )
        `);
        
        console.log('📦 Insertando servicios de prueba...');
        await connection.execute(`
            INSERT INTO services (name, service_type, price, duration, description) VALUES 
            ('Lavado Básico', 'basico', 15.00, 90, 'Lavado exterior e interior básico'),
            ('Lavado Completo', 'completo', 25.00, 120, 'Lavado completo con encerado'),
            ('Lavado Premium', 'premium', 35.00, 150, 'Lavado premium con tratamiento especial')
            ON DUPLICATE KEY UPDATE name = VALUES(name)
        `);
        
        console.log('✅ Base de datos local configurada correctamente!');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error configurando base de datos:', error);
    }
}

if (require.main === module) {
    setupLocalDB();
}

module.exports = { setupLocalDB };

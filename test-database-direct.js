/**
 * 🧪 SCRIPT DE PRUEBA DIRECTO - CAR WASH TYPESHI
 * Prueba la conexión a MySQL usando consultas directas
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

async function testDatabase() {
    console.log('🧪 INICIANDO PRUEBAS DE BASE DE DATOS...\n');
    
    try {
        // Configurar conexión
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306,
            database: 'car_wash_db'
        });
        
        console.log('✅ Conexión establecida con MySQL');
        console.log(`📍 Host: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);
        console.log(`🗄️  Base de datos: car_wash_db`);
        console.log(`👤 Usuario: ${process.env.DB_USER || 'root'}\n`);
        
        // Prueba 1: Verificar tablas
        console.log('📊 VERIFICANDO TABLAS...');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`   - Tablas encontradas: ${tables.length}`);
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
        // Prueba 2: Verificar servicios
        console.log('\n🛠️ PROBANDO SERVICIOS...');
        const [services] = await connection.execute('SELECT * FROM services');
        console.log(`   - Servicios encontrados: ${services.length}`);
        services.forEach(service => {
            console.log(`   - ${service.name}: $${service.price} (${service.service_type})`);
        });
        
        // Prueba 3: Crear usuario de prueba
        console.log('\n👤 PROBANDO USUARIOS...');
        const testUserData = {
            name: 'Juan Pérez',
            email: 'juan.test@email.com',
            phone: '5551234567'
        };
        
        // Eliminar usuario de prueba si existe
        await connection.execute('DELETE FROM users WHERE email = ?', [testUserData.email]);
        
        // Crear usuario
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
            [testUserData.name, testUserData.email, testUserData.phone]
        );
        
        console.log(`   - Usuario creado: ${testUserData.name} (ID: ${userResult.insertId})`);
        
        // Prueba 4: Crear reserva de prueba
        console.log('\n📅 PROBANDO RESERVAS...');
        const testBookingData = {
            user_id: userResult.insertId,
            service_id: services[0].id,
            booking_date: '2025-07-20',
            time_slot: '08:30-10:00',
            start_time: '08:30:00',
            end_time: '10:00:00',
            customer_name: testUserData.name,
            customer_email: testUserData.email,
            customer_phone: testUserData.phone,
            total_price: services[0].price,
            status: 'confirmed'
        };
        
        // Eliminar reserva de prueba si existe
        await connection.execute(
            'DELETE FROM bookings WHERE customer_email = ? AND booking_date = ?',
            [testBookingData.customer_email, testBookingData.booking_date]
        );
        
        // Crear reserva
        const [bookingResult] = await connection.execute(
            `INSERT INTO bookings (user_id, service_id, booking_date, time_slot, start_time, end_time, 
             customer_name, customer_email, customer_phone, total_price, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                testBookingData.user_id,
                testBookingData.service_id,
                testBookingData.booking_date,
                testBookingData.time_slot,
                testBookingData.start_time,
                testBookingData.end_time,
                testBookingData.customer_name,
                testBookingData.customer_email,
                testBookingData.customer_phone,
                testBookingData.total_price,
                testBookingData.status
            ]
        );
        
        console.log(`   - Reserva creada: ID ${bookingResult.insertId} para ${testBookingData.booking_date}`);
        
        // Prueba 5: Verificar disponibilidad
        console.log('\n🔍 PROBANDO DISPONIBILIDAD...');
        const [existingBooking] = await connection.execute(
            'SELECT * FROM bookings WHERE booking_date = ? AND time_slot = ? AND status != ?',
            ['2025-07-20', '08:30-10:00', 'cancelled']
        );
        
        console.log(`   - Horario 08:30-10:00 disponible: ${existingBooking.length === 0 ? 'SÍ' : 'NO'}`);
        
        const [freeSlot] = await connection.execute(
            'SELECT * FROM bookings WHERE booking_date = ? AND time_slot = ? AND status != ?',
            ['2025-07-20', '10:00-11:30', 'cancelled']
        );
        
        console.log(`   - Horario 10:00-11:30 disponible: ${freeSlot.length === 0 ? 'SÍ' : 'NO'}`);
        
        // Prueba 6: Consultas avanzadas
        console.log('\n📊 CONSULTAS AVANZADAS...');
        
        // Reservas por fecha
        const [bookingsByDate] = await connection.execute(
            'SELECT * FROM bookings WHERE booking_date = ? ORDER BY start_time',
            ['2025-07-20']
        );
        console.log(`   - Reservas para 2025-07-20: ${bookingsByDate.length}`);
        
        // Reservas por estado
        const [bookingsByStatus] = await connection.execute(
            'SELECT * FROM bookings WHERE status = ? ORDER BY booking_date, start_time',
            ['confirmed']
        );
        console.log(`   - Reservas confirmadas: ${bookingsByStatus.length}`);
        
        // Reservas por cliente
        const [userBookings] = await connection.execute(
            'SELECT * FROM bookings WHERE customer_email = ? ORDER BY booking_date DESC',
            [testUserData.email]
        );
        console.log(`   - Reservas del usuario: ${userBookings.length}`);
        
        // Estadísticas generales
        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_reservas,
                SUM(total_price) as ingresos_totales,
                AVG(total_price) as promedio_por_reserva
            FROM bookings 
            WHERE status = 'confirmed'
        `);
        
        console.log(`   - Total reservas: ${stats[0].total_reservas}`);
        console.log(`   - Ingresos totales: $${stats[0].ingresos_totales || 0}`);
        console.log(`   - Promedio por reserva: $${stats[0].promedio_por_reserva || 0}`);
        
        // Limpiar datos de prueba
        console.log('\n🧹 LIMPIANDO DATOS DE PRUEBA...');
        await connection.execute('DELETE FROM bookings WHERE customer_email = ?', [testUserData.email]);
        await connection.execute('DELETE FROM users WHERE email = ?', [testUserData.email]);
        console.log('   - Datos de prueba eliminados');
        
        await connection.end();
        
        console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
        console.log('\n📖 INSTRUCCIONES PARA MYSQL WORKBENCH:');
        console.log('1. Abrir MySQL Workbench');
        console.log('2. Crear nueva conexión:');
        console.log('   - Connection Name: Car Wash Typeshi');
        console.log('   - Hostname: localhost (o 127.0.0.1)');
        console.log('   - Port: 3306');
        console.log('   - Username: root');
        console.log('   - Password: (tu contraseña del .env)');
        console.log('   - Default Schema: car_wash_db');
        console.log('3. Probar conexión y explorar las tablas');
        
        console.log('\n📊 CONSULTAS ÚTILES PARA WORKBENCH:');
        console.log('-- Ver todas las reservas');
        console.log('SELECT b.*, s.name as service_name FROM bookings b JOIN services s ON b.service_id = s.id;');
        console.log('');
        console.log('-- Ver reservas por fecha');
        console.log("SELECT * FROM bookings WHERE booking_date = '2025-07-20';");
        console.log('');
        console.log('-- Ver estadísticas');
        console.log('SELECT COUNT(*) as total, SUM(total_price) as ingresos FROM bookings WHERE status = "confirmed";');
        
    } catch (error) {
        console.error('❌ ERROR EN LAS PRUEBAS:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n🔧 SOLUCIÓN: Verificar que MySQL esté ejecutándose');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n🔧 SOLUCIÓN: Verificar credenciales en el archivo .env');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n🔧 SOLUCIÓN: Ejecutar primero node migrate-database.js');
        } else {
            console.error('\n🔧 SOLUCIÓN: Verificar configuración de MySQL');
        }
        
        process.exit(1);
    }
}

// Ejecutar pruebas
testDatabase();

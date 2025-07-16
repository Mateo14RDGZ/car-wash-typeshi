/**
 * 🧪 SCRIPT DE PRUEBA - CAR WASH TYPESHI
 * Prueba la conexión a MySQL y las operaciones básicas
 */

async function testDatabase() {
    console.log('🧪 INICIANDO PRUEBAS DE BASE DE DATOS...\n');
    
    try {
        // Importar configuración
        const { initializeDatabase, models } = require('./src/database/init-database');
        
        // Inicializar base de datos
        const result = await initializeDatabase();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        console.log('✅ Base de datos inicializada correctamente\n');
        
        // Pruebas de servicios
        console.log('🛠️ PROBANDO SERVICIOS...');
        const services = await models.Service.findAll();
        console.log(`   - Servicios encontrados: ${services.length}`);
        
        services.forEach(service => {
            console.log(`   - ${service.name}: $${service.price} (${service.service_type})`);
        });
        
        // Pruebas de usuarios
        console.log('\n👤 PROBANDO USUARIOS...');
        const testUser = await models.User.create({
            name: 'Juan Pérez',
            email: 'juan.test@email.com',
            phone: '5551234567'
        });
        console.log(`   - Usuario creado: ${testUser.name} (${testUser.email})`);
        
        // Pruebas de reservas
        console.log('\n📅 PROBANDO RESERVAS...');
        const testBooking = await models.Booking.create({
            user_id: testUser.id,
            service_id: services[0].id,
            booking_date: '2025-07-20',
            time_slot: '08:30-10:00',
            start_time: '08:30:00',
            end_time: '10:00:00',
            customer_name: 'Juan Pérez',
            customer_email: 'juan.test@email.com',
            customer_phone: '5551234567',
            total_price: services[0].price
        });
        console.log(`   - Reserva creada: ${testBooking.id} para ${testBooking.booking_date}`);
        
        // Verificar disponibilidad
        console.log('\n🔍 PROBANDO DISPONIBILIDAD...');
        const isAvailable = await models.Booking.isTimeSlotAvailable('2025-07-20', '08:30-10:00');
        console.log(`   - Horario 08:30-10:00 disponible: ${!isAvailable ? 'NO' : 'SÍ'}`);
        
        const isAvailable2 = await models.Booking.isTimeSlotAvailable('2025-07-20', '10:00-11:30');
        console.log(`   - Horario 10:00-11:30 disponible: ${isAvailable2 ? 'SÍ' : 'NO'}`);
        
        // Consultas avanzadas
        console.log('\n📊 CONSULTAS AVANZADAS...');
        const bookingsByDate = await models.Booking.findByDate('2025-07-20');
        console.log(`   - Reservas para 2025-07-20: ${bookingsByDate.length}`);
        
        const bookingsByStatus = await models.Booking.findByStatus('confirmed');
        console.log(`   - Reservas confirmadas: ${bookingsByStatus.length}`);
        
        const userBookings = await models.Booking.findByCustomer('juan.test@email.com');
        console.log(`   - Reservas del usuario: ${userBookings.length}`);
        
        // Limpiar datos de prueba
        console.log('\n🧹 LIMPIANDO DATOS DE PRUEBA...');
        await models.Booking.destroy({ where: { customer_email: 'juan.test@email.com' } });
        await models.User.destroy({ where: { email: 'juan.test@email.com' } });
        console.log('   - Datos de prueba eliminados');
        
        console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
        console.log('\n📖 INSTRUCCIONES PARA MYSQL WORKBENCH:');
        console.log('1. Abrir MySQL Workbench');
        console.log('2. Crear nueva conexión:');
        console.log('   - Host: localhost');
        console.log('   - Port: 3306');
        console.log('   - Username: root');
        console.log('   - Password: (tu contraseña del .env)');
        console.log('   - Default Schema: car_wash_db');
        console.log('3. Ejecutar consultas SQL para ver los datos');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ ERROR EN LAS PRUEBAS:', error.message);
        console.error('\n🔧 POSIBLES SOLUCIONES:');
        console.error('1. Verificar que MySQL esté ejecutándose');
        console.error('2. Verificar credenciales en el archivo .env');
        console.error('3. Ejecutar el script database-setup.sql');
        console.error('4. Verificar que la base de datos car_wash_db exista');
        
        process.exit(1);
    }
}

// Ejecutar pruebas
testDatabase();

const { initDatabase, sequelize, Booking } = require('./src/database/init');

async function testDatabase() {
    console.log('🔍 Verificando estado de la base de datos...');
    
    try {
        // Probar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida correctamente');
        
        // Verificar tablas
        const queryInterface = sequelize.getQueryInterface();
        const tables = await queryInterface.showAllTables();
        console.log('📋 Tablas en la base de datos:', tables);
        
        // Si la tabla bookings existe, mostrar estadísticas
        if (tables.includes('bookings')) {
            console.log('\n📊 Estadísticas de la tabla bookings:');
            
            // Contar total de registros
            const totalCount = await Booking.count();
            console.log(`   • Total de reservas: ${totalCount}`);
            
            // Contar por estado
            const confirmedCount = await Booking.count({ where: { status: 'confirmed' } });
            const cancelledCount = await Booking.count({ where: { status: 'cancelled' } });
            console.log(`   • Reservas confirmadas: ${confirmedCount}`);
            console.log(`   • Reservas canceladas: ${cancelledCount}`);
            
            // Mostrar últimas 5 reservas
            const recentBookings = await Booking.findAll({
                order: [['createdAt', 'DESC']],
                limit: 5,
                attributes: ['id', 'clientName', 'clientPhone', 'date', 'status', 'createdAt']
            });
            
            if (recentBookings.length > 0) {
                console.log('\n📋 Últimas 5 reservas:');
                recentBookings.forEach((booking, index) => {
                    const date = new Date(booking.date);
                    const createdAt = new Date(booking.createdAt);
                    console.log(`   ${index + 1}. ID: ${booking.id}`);
                    console.log(`      Cliente: ${booking.clientName}`);
                    console.log(`      Teléfono: ${booking.clientPhone || 'No especificado'}`);
                    console.log(`      Fecha reserva: ${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES')}`);
                    console.log(`      Estado: ${booking.status}`);
                    console.log(`      Creada: ${createdAt.toLocaleDateString('es-ES')} ${createdAt.toLocaleTimeString('es-ES')}`);
                    console.log('   ----');
                });
            } else {
                console.log('   📝 No hay reservas registradas aún');
            }
        } else {
            console.log('❌ La tabla bookings no existe. La base de datos no está inicializada.');
        }
        
    } catch (error) {
        console.error('❌ Error al verificar la base de datos:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Posibles soluciones:');
            console.log('   • Verificar que MySQL esté ejecutándose');
            console.log('   • Verificar la configuración en el archivo .env');
            console.log('   • Verificar que la base de datos "car_wash_db" exista');
        }
    } finally {
        await sequelize.close();
        console.log('\n🔚 Verificación completada');
    }
}

testDatabase();

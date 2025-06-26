// Verificar directamente si hay reservas en la base de datos
const { Sequelize, DataTypes } = require('sequelize');

async function verificarReservas() {
    console.log('🔍 Verificando reservas en base de datos...\n');
    
    try {
        // Conexión a la base de datos
        const sequelize = new Sequelize(
            process.env.DB_NAME || 'car_wash_db',
            process.env.DB_USER || 'root',
            process.env.DB_PASS || 'Mateo54764325%$',
            {
                host: process.env.DB_HOST || '127.0.0.1',
                dialect: 'mysql',
                logging: false
            }
        );

        console.log('🔗 Intentando conectar a MySQL...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa a MySQL\n');
        
        // Consultar todas las reservas
        console.log('📊 Consultando todas las reservas...');
        const [allResults] = await sequelize.query(`
            SELECT id, clientName, date, status, vehicleType, vehiclePlate
            FROM bookings 
            ORDER BY date DESC 
            LIMIT 20
        `);
        
        console.log(`📋 Total de reservas encontradas: ${allResults.length}\n`);
        
        if (allResults.length > 0) {
            console.log('📅 Últimas reservas:');
            allResults.forEach((reserva, index) => {
                const fecha = new Date(reserva.date);
                console.log(`  ${index + 1}. ${reserva.clientName} - ${fecha.toLocaleString()} - ${reserva.status}`);
            });
        } else {
            console.log('⚠️ No hay reservas en la base de datos');
            console.log('🔍 Esto explica por qué todos los horarios aparecen disponibles');
        }
        
        // Consultar reservas futuras específicamente
        console.log('\n📊 Consultando reservas futuras...');
        const [futureResults] = await sequelize.query(`
            SELECT id, clientName, DATE(date) as fecha, TIME(date) as hora, status
            FROM bookings 
            WHERE date >= NOW()
            ORDER BY date
        `);
        
        console.log(`📋 Reservas futuras: ${futureResults.length}`);
        
        if (futureResults.length > 0) {
            console.log('📅 Reservas futuras:');
            futureResults.forEach((reserva, index) => {
                console.log(`  ${index + 1}. ${reserva.fecha} ${reserva.hora} - ${reserva.clientName} (${reserva.status})`);
            });
        } else {
            console.log('⚠️ No hay reservas futuras');
        }
        
        // Consultar reservas para fecha específica de prueba
        console.log('\n📊 Consultando reservas para 2025-06-27...');
        const [specificResults] = await sequelize.query(`
            SELECT id, clientName, DATE(date) as fecha, TIME(date) as hora, status
            FROM bookings 
            WHERE DATE(date) = '2025-06-27'
            ORDER BY date
        `);
        
        console.log(`📋 Reservas para 2025-06-27: ${specificResults.length}`);
        
        if (specificResults.length > 0) {
            console.log('📅 Reservas encontradas:');
            specificResults.forEach((reserva, index) => {
                console.log(`  ${index + 1}. ${reserva.hora} - ${reserva.clientName} (${reserva.status})`);
            });
            
            console.log('\n✅ ¡HAY RESERVAS! Estos horarios deberían aparecer ocupados:');
            specificResults.forEach(reserva => {
                console.log(`  🔒 ${reserva.hora} debería estar OCUPADO`);
            });
        } else {
            console.log('⚠️ No hay reservas para 2025-06-27');
            console.log('💡 Para probar el sistema, crea una reserva para mañana');
        }
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error al verificar reservas:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔧 Error de acceso a la base de datos');
            console.log('   • Verifica las credenciales en el archivo .env');
            console.log('   • Asegúrate de que MySQL esté ejecutándose');
        }
    }
}

verificarReservas()
    .then(() => {
        console.log('\n🎯 Verificación completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error:', error);
        process.exit(1);
    });

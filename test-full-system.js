// Test completo del sistema de reservas y horarios disponibles
console.log('🧪 Iniciando test completo del sistema...');

// Configurar el entorno
process.env.NODE_ENV = 'development';

const BookingModel = require('./src/database/models/BookingSimple');
const { Sequelize } = require('sequelize');

async function testFullSystem() {
    try {
        console.log('📋 PASO 1: Verificar conexión a base de datos...');
        
        // Test de conexión
        const sequelize = BookingModel.sequelize;
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos exitosa');
        
        // Verificar tabla de bookings
        await sequelize.sync();
        console.log('✅ Tabla de bookings sincronizada');
        
        console.log('\n📋 PASO 2: Verificar reservas existentes...');
        
        // Obtener todas las reservas
        const allBookings = await BookingModel.findAll({
            attributes: ['id', 'clientName', 'date', 'status', 'vehicleType', 'serviceType'],
            order: [['id', 'DESC']],
            limit: 10
        });
        
        console.log(`📊 Total de reservas en BD: ${allBookings.length}`);
        
        if (allBookings.length > 0) {
            console.log('📋 Últimas reservas:');
            allBookings.forEach(booking => {
                console.log(`  ID ${booking.id}: ${booking.clientName} - ${booking.date.toISOString()} - ${booking.status}`);
            });
        } else {
            console.log('⚠️ No hay reservas en la base de datos');
        }
        
        console.log('\n📋 PASO 3: Crear reserva de prueba...');
        
        // Crear fecha de mañana a las 08:30
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 30, 0, 0);
        
        const fechaStr = tomorrow.toISOString().split('T')[0];
        console.log(`📅 Creando reserva para: ${fechaStr} a las 08:30`);
        
        // Buscar si ya existe una reserva para ese horario
        const existingBooking = await BookingModel.findOne({
            where: {
                date: tomorrow,
                status: {
                    [Sequelize.Op.ne]: 'cancelled'
                }
            }
        });
        
        if (existingBooking) {
            console.log('✅ Ya existe una reserva para ese horario:', existingBooking.clientName);
        } else {
            // Crear nueva reserva
            const newBooking = await BookingModel.create({
                clientName: 'Cliente Test',
                clientPhone: '123456789',
                date: tomorrow,
                vehicleType: 'auto',
                vehiclePlate: 'TEST123',
                serviceType: 'basico',
                extras: [],
                price: 15000,
                status: 'confirmed'
            });
            
            console.log('✅ Reserva de prueba creada:', newBooking.id);
        }
        
        console.log('\n📋 PASO 4: Verificar horarios disponibles...');
        
        // Simular llamada a la API usando la función del api-bridge
        const api = require('./api-bridge.js');
        
        // Crear mock request y response
        const mockReq = {
            method: 'GET',
            query: { date: fechaStr },
            headers: { host: 'localhost:3001' }
        };
        
        const mockRes = {
            headers: {},
            statusCode: 200,
            data: null,
            
            setHeader(key, value) {
                this.headers[key] = value;
            },
            
            status(code) {
                this.statusCode = code;
                return this;
            },
            
            json(data) {
                this.data = data;
                console.log(`📡 Respuesta API: ${JSON.stringify(data, null, 2)}`);
                return this;
            }
        };
        
        // Simular la llamada a la API
        await api(mockReq, mockRes);
        
        console.log('\n📋 PASO 5: Analizar resultados...');
        
        if (mockRes.data && mockRes.data.data) {
            const slots = mockRes.data.data;
            const bookedSlots = slots.filter(s => s.isBooked);
            const availableSlots = slots.filter(s => !s.isBooked);
            
            console.log(`📊 Resumen de horarios para ${fechaStr}:`);
            console.log(`  Total: ${slots.length}`);
            console.log(`  Disponibles: ${availableSlots.length}`);
            console.log(`  Ocupados: ${bookedSlots.length}`);
            
            if (bookedSlots.length > 0) {
                console.log('🔒 Horarios ocupados:');
                bookedSlots.forEach(slot => {
                    console.log(`  ${slot.time} - OCUPADO`);
                });
                console.log('✅ ¡ÉXITO! El sistema está funcionando correctamente');
            } else {
                console.log('⚠️ No se encontraron horarios ocupados');
                console.log('🔍 Verificando si hay problema en la lógica de marcado...');
            }
            
            console.log('\n📋 Detalle de todos los horarios:');
            slots.forEach(slot => {
                const estado = slot.isBooked ? '🔒 OCUPADO' : '✅ DISPONIBLE';
                console.log(`  ${slot.time} - ${estado}`);
            });
        } else {
            console.log('❌ Error: No se recibieron datos de la API');
        }
        
        console.log('\n🎯 Test completado');
        
    } catch (error) {
        console.error('❌ Error en test:', error);
        console.error('Stack:', error.stack);
    } finally {
        // Cerrar conexión
        try {
            await BookingModel.sequelize.close();
            console.log('🔒 Conexión a base de datos cerrada');
        } catch (closeError) {
            console.error('Error cerrando conexión:', closeError);
        }
    }
}

// Ejecutar test
testFullSystem()
    .then(() => {
        console.log('\n✅ Test completado exitosamente');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test falló:', error);
        process.exit(1);
    });

// Script para probar el sistema de actualización de horarios después de una reserva
const { initDatabase, sequelize, Booking } = require('./src/database/init');

async function testReservationAndTimeSlots() {
    console.log('🧪 Iniciando prueba de reserva y actualización de horarios...');
    
    try {
        // Inicializar conexión a BD
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida');
        
        // Importar servicios
        const bookingService = require('./src/backend/services/bookingsDB');
        
        // 1. Verificar horarios disponibles ANTES de la reserva
        const fechaPrueba = '2025-06-27'; // Mañana
        console.log(`\n📅 1. Verificando horarios disponibles para ${fechaPrueba} ANTES de hacer reserva:`);
        
        const horariosAntes = await bookingService.getAvailableTimeSlots(fechaPrueba);
        console.log(`   Horarios disponibles: ${horariosAntes.length}`);
        horariosAntes.forEach(slot => {
            console.log(`   - ${slot.time} (${slot.start} - ${slot.end})`);
        });
        
        // 2. Hacer una reserva de prueba (usar un horario que esté disponible)
        console.log(`\n🎯 2. Creando reserva de prueba para ${fechaPrueba} 08:30...`);
        
        const reservaData = {
            clientName: 'Cliente Prueba Horarios',
            clientPhone: '099123456',
            date: `${fechaPrueba}T08:30:00`, // 8:30 AM - debería estar disponible
            vehicleType: 'auto',
            vehiclePlate: 'ABC1234',
            serviceType: 'basico',
            price: 600,
            extras: [],
            notes: 'Reserva de prueba para verificar actualización de horarios'
        };
        
        const nuevaReserva = await bookingService.createBooking(reservaData);
        console.log('✅ Reserva creada exitosamente:', {
            id: nuevaReserva.id,
            cliente: nuevaReserva.clientName,
            fecha: nuevaReserva.date,
            estado: nuevaReserva.status
        });
        
        // 3. Verificar horarios disponibles DESPUÉS de la reserva
        console.log(`\n📅 3. Verificando horarios disponibles para ${fechaPrueba} DESPUÉS de hacer reserva:`);
        
        const horariosDespues = await bookingService.getAvailableTimeSlots(fechaPrueba);
        console.log(`   Horarios disponibles: ${horariosDespues.length}`);
        horariosDespues.forEach(slot => {
            console.log(`   - ${slot.time} (${slot.start} - ${slot.end})`);
        });
        
        // 4. Comparar resultados
        console.log(`\n📊 4. Análisis de cambios:`);
        console.log(`   Horarios antes: ${horariosAntes.length}`);
        console.log(`   Horarios después: ${horariosDespues.length}`);
        console.log(`   Diferencia: ${horariosAntes.length - horariosDespues.length} horarios menos`);
        
        // Verificar que el horario 08:30-10:00 ya no esté disponible
        const horario830Antes = horariosAntes.find(slot => slot.start === '08:30');
        const horario830Despues = horariosDespues.find(slot => slot.start === '08:30');
        
        if (horario830Antes && !horario830Despues) {
            console.log('✅ ÉXITO: El horario 08:30-10:00 ya no está disponible después de la reserva');
        } else if (!horario830Antes) {
            console.log('⚠️ INFO: El horario 08:30-10:00 ya estaba ocupado antes de la prueba');
        } else {
            console.log('❌ ERROR: El horario 08:30-10:00 aún aparece como disponible');
        }
        
        // 5. Mostrar reservas para esa fecha
        console.log(`\n📋 5. Reservas confirmadas para ${fechaPrueba}:`);
        const reservasFecha = await bookingService.getBookingsByDate(fechaPrueba);
        reservasFecha.forEach(reserva => {
            const fecha = new Date(reserva.date);
            console.log(`   - ${reserva.clientName} a las ${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')} (ID: ${reserva.id})`);
        });
        
        console.log('\n🎉 Prueba completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
        console.log('🔚 Conexión a BD cerrada');
    }
}

testReservationAndTimeSlots();

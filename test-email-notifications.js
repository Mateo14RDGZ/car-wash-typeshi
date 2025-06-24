// Script de prueba para verificar notificaciones por email
const axios = require('axios');

const SERVER_URL = 'http://localhost:3003';

async function testNotifications() {
    console.log('🧪 INICIANDO PRUEBAS DE NOTIFICACIONES POR EMAIL');
    console.log('=' .repeat(50));
    
    try {
        // Paso 1: Verificar que el servidor esté funcionando
        console.log('1️⃣ Verificando servidor...');
        const serverTest = await axios.get(`${SERVER_URL}/test`);
        console.log('✅ Servidor funcionando:', serverTest.data.message);
        console.log('📊 Base de datos:', serverTest.data.database);
          // Paso 2: Obtener horarios disponibles primero
        console.log('\n2️⃣ Obteniendo horarios disponibles...');
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        const slotsResponse = await axios.get(`${SERVER_URL}/api/bookings/available-slots?date=${dateStr}`);
        const availableSlots = slotsResponse.data.data;
        
        if (!availableSlots || availableSlots.length === 0) {
            throw new Error('No hay horarios disponibles para mañana');
        }
        
        console.log(`✅ Encontrados ${availableSlots.length} horarios disponibles`);
        
        // Usar el primer horario disponible
        const selectedSlot = availableSlots[0];
        const [hours, minutes] = selectedSlot.start.split(':');
        const bookingDateTime = new Date(tomorrow);
        bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        console.log('📅 Horario seleccionado:', selectedSlot.start);
          // Paso 3: Crear una reserva de prueba
        console.log('\n3️⃣ Creando reserva de prueba...');
        const bookingData = {
            clientName: 'Cliente de Prueba',
            clientPhone: '091234567',
            date: bookingDateTime.toISOString(),
            vehicleType: 'auto',
            vehiclePlate: 'ABC1234',
            serviceType: 'premium',
            price: 500,
            notes: 'Reserva de prueba para notificaciones'
        };
          const createResponse = await axios.post(`${SERVER_URL}/api/bookings`, bookingData);
        console.log('✅ Reserva creada:', createResponse.data.message);
        const createdBooking = createResponse.data.data;
        console.log('📧 Debería haber enviado email de confirmación al administrador');
        
        // Paso 4: Esperar un momento y luego cancelar la reserva
        console.log('\n4️⃣ Esperando 2 segundos antes de cancelar...');
        await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('5️⃣ Cancelando reserva de prueba...');
        
        // Verificar las reservas existentes para ese día
        const bookingsResponse = await axios.get(`${SERVER_URL}/api/bookings?date=${dateStr}`);
        const bookings = bookingsResponse.data.data;
        console.log(`📋 Reservas encontradas para el día: ${bookings.length}`);
        
        // Buscar nuestra reserva de prueba
        const testBooking = bookings.find(b => b.clientName === bookingData.clientName);
        if (!testBooking) {
            throw new Error('No se encontró la reserva de prueba creada');
        }
        
        console.log(`🎯 Reserva encontrada - ID: ${testBooking.id}`);
        
        const cancelData = {
            clientName: bookingData.clientName,
            date: dateStr
        };
        
        const cancelResponse = await axios.delete(`${SERVER_URL}/api/bookings`, {
            data: cancelData
        });
        console.log('✅ Reserva cancelada:', cancelResponse.data.message);
        console.log('📧 Debería haber enviado email de cancelación al administrador');
        
        console.log('\n' + '=' .repeat(50));
        console.log('🎉 PRUEBA COMPLETADA EXITOSAMENTE');
        console.log('');
        console.log('📧 Si tienes configurado el email correctamente en .env:');
        console.log('   - Deberías recibir 2 emails en tu bandeja de entrada');
        console.log('   - 1 email de nueva reserva');
        console.log('   - 1 email de cancelación');
        console.log('');
        console.log('⚙️  Para configurar el email:');
        console.log('   1. Edita el archivo .env');
        console.log('   2. Cambia GMAIL_USER por tu email real');
        console.log('   3. Cambia EMAIL_PASSWORD por una contraseña de aplicación de Gmail');
        
    } catch (error) {
        console.error('\n❌ ERROR EN LA PRUEBA:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 SOLUCIÓN:');
            console.log('   - Asegúrate de que el servidor esté ejecutándose');
            console.log('   - Ejecuta: npm run start:db');
        }
    }
}

// Ejecutar la prueba
testNotifications().then(() => {
    console.log('\n🏁 Prueba finalizada');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});

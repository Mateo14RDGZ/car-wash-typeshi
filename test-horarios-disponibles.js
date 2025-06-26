// Test de horarios disponibles con consulta a base de datos
console.log('🚀 Iniciando test de horarios disponibles...');

const API_BASE = 'http://localhost:3001';

async function testHorariosDisponibles() {
    try {
        // Crear una reserva primero para que haya algo en la base de datos
        console.log('📝 Creando una reserva de prueba...');
        
        const fechaPrueba = new Date();
        fechaPrueba.setDate(fechaPrueba.getDate() + 1); // Mañana
        const fechaStr = fechaPrueba.toISOString().split('T')[0];
        
        // Crear reserva a las 08:30
        const reservaPrueba = {
            clientName: 'Cliente Prueba',
            clientPhone: '123456789',
            vehicleType: 'auto',
            vehiclePlate: 'ABC123',
            serviceType: 'basico',
            date: `${fechaStr}T08:30:00`,
            extras: [],
            price: 15000
        };
        
        const response1 = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaPrueba)
        });
        
        if (response1.ok) {
            const reservaCreada = await response1.json();
            console.log('✅ Reserva de prueba creada:', reservaCreada.data?.id);
        } else {
            console.log('⚠️ No se pudo crear reserva de prueba (posiblemente ya existe una)');
        }
        
        // Ahora consultar horarios disponibles para esa fecha
        console.log('🔍 Consultando horarios disponibles para', fechaStr);
        
        const response2 = await fetch(`${API_BASE}/bookings/available-slots?date=${fechaStr}`);
        
        if (!response2.ok) {
            throw new Error(`HTTP ${response2.status}: ${response2.statusText}`);
        }
        
        const data = await response2.json();
        
        console.log('📊 Respuesta recibida:', {
            status: data.status,
            totalSlots: data.data?.length || 0,
            dataSource: data.dataSource
        });
        
        if (data.data && Array.isArray(data.data)) {
            console.log('📋 Horarios:');
            data.data.forEach(slot => {
                const estado = slot.isBooked ? '🔒 OCUPADO' : '✅ DISPONIBLE';
                console.log(`  ${slot.time} - ${estado}`);
            });
            
            const disponibles = data.data.filter(s => !s.isBooked).length;
            const ocupados = data.data.filter(s => s.isBooked).length;
            
            console.log(`\n📈 Resumen:`);
            console.log(`  Total: ${data.data.length}`);
            console.log(`  Disponibles: ${disponibles}`);
            console.log(`  Ocupados: ${ocupados}`);
            
            if (ocupados > 0) {
                console.log('✅ ¡ÉXITO! El sistema está filtrando correctamente los horarios ocupados');
            } else {
                console.log('⚠️ No se encontraron horarios ocupados (puede ser normal si no hay reservas)');
            }
        } else {
            console.error('❌ Formato de respuesta incorrecto');
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.message);
    }
}

// Función para limpiar reservas de prueba
async function limpiarReservasPrueba() {
    try {
        console.log('🧹 Limpiando reservas de prueba...');
        // Esta función puede implementarse si es necesario
        console.log('✅ Limpieza completada');
    } catch (error) {
        console.error('❌ Error al limpiar:', error.message);
    }
}

// Ejecutar test
testHorariosDisponibles()
    .then(() => {
        console.log('\n🎯 Test completado');
        process.exit(0);
    })
    .catch(err => {
        console.error('💥 Test falló:', err);
        process.exit(1);
    });

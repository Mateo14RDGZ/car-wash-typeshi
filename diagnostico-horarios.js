/**
 * 🔍 DIAGNÓSTICO DE HORARIOS OCUPADOS
 * 
 * Script para verificar por qué los horarios ya reservados siguen apareciendo como disponibles
 */

console.log('🔍 INICIANDO DIAGNÓSTICO DE HORARIOS OCUPADOS');
console.log('='.repeat(60));

// Función para probar los horarios disponibles
async function diagnosticarHorarios() {
    try {
        // Usar una fecha específica para pruebas
        const fechaPrueba = '2025-07-17';
        console.log(`\n📅 Probando horarios para fecha: ${fechaPrueba}`);
        
        // Hacer petición a la API
        const endpoint = `/bookings/available-slots?date=${fechaPrueba}`;
        console.log(`🔗 Endpoint: ${endpoint}`);
        
        const response = await fetch(`/api/api-bridge?endpoint=${encodeURIComponent(endpoint)}&_=${Date.now()}`);
        
        if (!response.ok) {
            console.error('❌ Error en la respuesta:', response.status, response.statusText);
            return;
        }
        
        const data = await response.json();
        console.log('📊 Respuesta completa:', JSON.stringify(data, null, 2));
        
        if (data.status === 'SUCCESS' && data.data && Array.isArray(data.data)) {
            const horarios = data.data;
            console.log(`\n📋 ANÁLISIS DE HORARIOS (${horarios.length} total):`);
            
            horarios.forEach((slot, index) => {
                const estado = slot.isBooked ? '🔒 OCUPADO' : '🟢 DISPONIBLE';
                console.log(`  ${index + 1}. ${slot.time} - ${estado}`);
                
                // Verificar propiedades del slot
                if (slot.isBooked) {
                    console.log(`     ⚠️ Este horario debería estar oculto en el frontend`);
                }
            });
            
            // Estadísticas
            const ocupados = horarios.filter(h => h.isBooked).length;
            const disponibles = horarios.filter(h => !h.isBooked).length;
            
            console.log(`\n📊 ESTADÍSTICAS:`);
            console.log(`   🔒 Ocupados: ${ocupados}`);
            console.log(`   🟢 Disponibles: ${disponibles}`);
            console.log(`   📋 Total: ${horarios.length}`);
            
            // Verificar si el problema está en el frontend
            if (ocupados > 0) {
                console.log(`\n🔍 VERIFICANDO FILTRADO EN FRONTEND:`);
                const horariosDisponibles = horarios.filter(slot => !slot.isBooked);
                console.log(`   Horarios después del filtro: ${horariosDisponibles.length}`);
                
                if (horariosDisponibles.length === disponibles) {
                    console.log(`   ✅ El filtrado funciona correctamente`);
                } else {
                    console.log(`   ❌ Error en el filtrado del frontend`);
                }
            }
            
        } else {
            console.error('❌ Formato de respuesta inesperado:', data);
        }
        
    } catch (error) {
        console.error('❌ Error en el diagnóstico:', error);
    }
}

// Función para crear una reserva de prueba
async function crearReservaPrueba() {
    console.log('\n🧪 CREANDO RESERVA DE PRUEBA...');
    
    try {
        const reservaData = {
            clientName: 'TEST DIAGNÓSTICO',
            clientPhone: '099999999',
            date: '2025-07-17T10:00:00',
            vehicleType: 'auto',
            vehiclePlate: 'TEST123',
            serviceType: 'basico',
            price: 600
        };
        
        const response = await fetch('/api/api-bridge?endpoint=' + encodeURIComponent('/bookings'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Reserva de prueba creada:', result);
            return true;
        } else {
            console.error('❌ Error al crear reserva de prueba:', response.status);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error al crear reserva de prueba:', error);
        return false;
    }
}

// Función para verificar reservas existentes
async function verificarReservasExistentes() {
    console.log('\n📋 VERIFICANDO RESERVAS EXISTENTES...');
    
    try {
        const response = await fetch('/api/api-bridge?endpoint=' + encodeURIComponent('/bookings?date=2025-07-17'));
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Reservas existentes:', data);
            
            if (data.data && Array.isArray(data.data)) {
                console.log(`🔍 Encontradas ${data.data.length} reservas para la fecha`);
                
                data.data.forEach((reserva, index) => {
                    const fecha = new Date(reserva.date);
                    const hora = fecha.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
                    console.log(`  ${index + 1}. ${reserva.clientName} - ${hora} - ${reserva.serviceType}`);
                });
            }
        } else {
            console.error('❌ Error al obtener reservas:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error al verificar reservas:', error);
    }
}

// Función principal
async function ejecutarDiagnostico() {
    console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO...');
    
    // 1. Verificar reservas existentes
    await verificarReservasExistentes();
    
    // 2. Diagnosticar horarios disponibles
    await diagnosticarHorarios();
    
    // 3. Crear reserva de prueba si no hay reservas
    // await crearReservaPrueba();
    
    // 4. Volver a verificar horarios después de la reserva
    // await diagnosticarHorarios();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNÓSTICO COMPLETADO');
    console.log('💡 Si los horarios ocupados siguen apareciendo como disponibles,');
    console.log('   el problema está en el backend, no en el frontend.');
}

// Ejecutar solo si estamos en el navegador
if (typeof window !== 'undefined') {
    window.diagnosticarHorarios = ejecutarDiagnostico;
    ejecutarDiagnostico();
} else {
    console.log('📝 Script listo para ejecutar en el navegador');
    console.log('💡 Ejecuta: diagnosticarHorarios() en la consola del navegador');
}

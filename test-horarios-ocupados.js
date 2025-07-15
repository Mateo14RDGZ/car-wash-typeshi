/**
 * 🧪 TEST COMPLETO: VERIFICAR HORARIOS OCUPADOS
 * 
 * Este script simula el flujo completo de creación de reserva
 * y verificación de horarios para identificar dónde está el problema.
 */

console.log('🧪 INICIANDO TEST COMPLETO DE HORARIOS OCUPADOS');
console.log('='.repeat(60));

// Función para crear una reserva de prueba
async function crearReservaPrueba() {
    console.log('\n1️⃣ CREANDO RESERVA DE PRUEBA...');
    
    const reservaData = {
        clientName: 'USUARIO TEST',
        clientPhone: '099123456',
        date: '2025-07-17T10:00:00',
        vehicleType: 'auto',
        vehiclePlate: 'TEST123',
        serviceType: 'basico',
        price: 600
    };
    
    try {
        console.log('📝 Datos de la reserva:', JSON.stringify(reservaData, null, 2));
        
        const response = await fetch('/api/api-bridge?endpoint=' + encodeURIComponent('/bookings'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaData)
        });
        
        const responseText = await response.text();
        console.log('📋 Respuesta completa:', responseText);
        
        if (response.ok) {
            const result = JSON.parse(responseText);
            console.log('✅ Reserva creada exitosamente:', result);
            return result;
        } else {
            console.error('❌ Error al crear reserva:', response.status, responseText);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error en la petición:', error);
        return null;
    }
}

// Función para verificar horarios después de la reserva
async function verificarHorarios() {
    console.log('\n2️⃣ VERIFICANDO HORARIOS DISPONIBLES...');
    
    try {
        const fecha = '2025-07-17';
        const endpoint = `/bookings/available-slots?date=${fecha}`;
        
        console.log('🔗 Consultando:', endpoint);
        
        const response = await fetch('/api/api-bridge?endpoint=' + encodeURIComponent(endpoint) + '&_=' + Date.now());
        
        if (!response.ok) {
            console.error('❌ Error en la respuesta:', response.status);
            return;
        }
        
        const data = await response.json();
        console.log('📊 Respuesta de horarios:', JSON.stringify(data, null, 2));
        
        if (data.status === 'SUCCESS' && data.data && Array.isArray(data.data)) {
            const horarios = data.data;
            
            console.log('\n📋 ANÁLISIS DE HORARIOS:');
            horarios.forEach((slot, index) => {
                const estado = slot.isBooked ? '🔒 OCUPADO' : '🟢 DISPONIBLE';
                console.log(`  ${index + 1}. ${slot.time} (${slot.start}) - ${estado}`);
            });
            
            // Verificar específicamente el horario 10:00
            const slot10 = horarios.find(h => h.start === '10:00');
            if (slot10) {
                console.log(`\n🎯 VERIFICACIÓN ESPECÍFICA DEL HORARIO 10:00:`);
                console.log(`   Tiempo: ${slot10.time}`);
                console.log(`   Start: ${slot10.start}`);
                console.log(`   Estado: ${slot10.isBooked ? '🔒 OCUPADO' : '🟢 DISPONIBLE'}`);
                console.log(`   ⚠️ Este horario ${slot10.isBooked ? 'NO' : 'SÍ'} debería aparecer al usuario`);
            }
            
            // Estadísticas
            const ocupados = horarios.filter(h => h.isBooked).length;
            const disponibles = horarios.filter(h => !h.isBooked).length;
            
            console.log(`\n📊 ESTADÍSTICAS:`);
            console.log(`   🔒 Ocupados: ${ocupados}`);
            console.log(`   🟢 Disponibles: ${disponibles}`);
            console.log(`   📋 Total: ${horarios.length}`);
            
        } else {
            console.error('❌ Formato de respuesta inesperado:', data);
        }
        
    } catch (error) {
        console.error('❌ Error al verificar horarios:', error);
    }
}

// Función para verificar reservas existentes
async function verificarReservasExistentes() {
    console.log('\n3️⃣ VERIFICANDO RESERVAS EXISTENTES...');
    
    try {
        const endpoint = '/bookings?date=2025-07-17';
        const response = await fetch('/api/api-bridge?endpoint=' + encodeURIComponent(endpoint));
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Reservas existentes:', JSON.stringify(data, null, 2));
            
            if (data.data && Array.isArray(data.data)) {
                console.log(`\n📋 RESERVAS ENCONTRADAS (${data.data.length}):`);
                
                data.data.forEach((reserva, index) => {
                    const fecha = new Date(reserva.date);
                    const hora = fecha.toLocaleTimeString('es-UY', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                    });
                    console.log(`  ${index + 1}. ${reserva.clientName} - ${hora} - ${reserva.serviceType} - ${reserva.status}`);
                });
                
                // Verificar si hay reserva para las 10:00
                const reserva10 = data.data.find(r => {
                    const fecha = new Date(r.date);
                    return fecha.getHours() === 10 && fecha.getMinutes() === 0;
                });
                
                if (reserva10) {
                    console.log(`\n🎯 ENCONTRADA RESERVA PARA LAS 10:00:`);
                    console.log(`   Cliente: ${reserva10.clientName}`);
                    console.log(`   Estado: ${reserva10.status}`);
                    console.log(`   Fecha completa: ${reserva10.date}`);
                }
            }
        } else {
            console.error('❌ Error al obtener reservas:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error al verificar reservas existentes:', error);
    }
}

// Función para limpiar reservas de prueba
async function limpiarReservasPrueba() {
    console.log('\n4️⃣ LIMPIANDO RESERVAS DE PRUEBA...');
    
    // Aquí podrías agregar lógica para eliminar las reservas de prueba
    console.log('💡 Nota: Las reservas de prueba se pueden eliminar manualmente desde la base de datos');
}

// Función principal
async function ejecutarTestCompleto() {
    console.log('🚀 EJECUTANDO TEST COMPLETO...');
    
    // Paso 1: Verificar estado inicial
    console.log('\n📋 ESTADO INICIAL:');
    await verificarReservasExistentes();
    await verificarHorarios();
    
    // Paso 2: Crear reserva de prueba
    const reserva = await crearReservaPrueba();
    
    if (reserva) {
        // Paso 3: Verificar estado después de la reserva
        console.log('\n📋 ESTADO DESPUÉS DE LA RESERVA:');
        await verificarReservasExistentes();
        await verificarHorarios();
        
        // Paso 4: Análisis final
        console.log('\n' + '='.repeat(60));
        console.log('🎯 ANÁLISIS FINAL:');
        console.log('Si el horario 10:00 sigue apareciendo como disponible después de crear la reserva,');
        console.log('entonces hay un problema en la verificación de horarios ocupados.');
        console.log('Si aparece como ocupado, entonces el sistema funciona correctamente.');
        
    } else {
        console.log('❌ No se pudo crear la reserva de prueba. Verifica la conexión a la base de datos.');
    }
    
    console.log('\n🔍 TEST COMPLETADO');
}

// Ejecutar solo si estamos en el navegador
if (typeof window !== 'undefined') {
    window.testHorariosOcupados = ejecutarTestCompleto;
    // No ejecutar automáticamente, esperar a que el usuario lo llame
    console.log('📝 Test listo para ejecutar');
    console.log('💡 Ejecuta: testHorariosOcupados() en la consola del navegador');
} else {
    console.log('📝 Script listo para ejecutar en el navegador');
}

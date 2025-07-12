/**
 * Script de diagnóstico para problemas de reserva
 * Ejecutar en la consola del navegador para diagnosticar problemas
 */

// Función de diagnóstico principal
window.diagnosticarReserva = function() {
    console.log('🔍 === DIAGNÓSTICO DE SISTEMA DE RESERVAS ===');
    
    // 1. Verificar que apiRequest esté disponible
    console.log('1. Verificando apiRequest...');
    if (typeof window.apiRequest === 'function') {
        console.log('✅ apiRequest está disponible');
    } else {
        console.error('❌ apiRequest NO está disponible');
        console.log('typeof window.apiRequest:', typeof window.apiRequest);
    }
    
    // 2. Verificar que mostrarReservaConfirmada esté disponible
    console.log('2. Verificando mostrarReservaConfirmada...');
    if (typeof window.mostrarReservaConfirmada === 'function') {
        console.log('✅ mostrarReservaConfirmada está disponible');
    } else if (typeof mostrarReservaConfirmada === 'function') {
        console.log('✅ mostrarReservaConfirmada está disponible (global)');
    } else {
        console.error('❌ mostrarReservaConfirmada NO está disponible');
    }
    
    // 3. Verificar elementos del formulario
    console.log('3. Verificando elementos del formulario...');
    const elementos = {
        reservaForm: document.getElementById('reservaForm'),
        nombre: document.getElementById('nombre'),
        telefono: document.getElementById('telefono'),
        vehiculo: document.getElementById('vehiculo'),
        patente: document.getElementById('patente'),
        fecha: document.getElementById('fecha')
    };
    
    Object.entries(elementos).forEach(([nombre, elemento]) => {
        if (elemento) {
            console.log(`✅ ${nombre} encontrado`);
        } else {
            console.error(`❌ ${nombre} NO encontrado`);
        }
    });
    
    // 4. Verificar variables globales
    console.log('4. Verificando variables globales...');
    console.log('servicioSeleccionado:', window.servicioSeleccionado);
    console.log('horarioSeleccionado:', window.horarioSeleccionado);
    console.log('isSubmitting:', window.isSubmitting);
    
    // 5. Probar apiRequest con un endpoint de prueba
    console.log('5. Probando apiRequest...');
    window.apiRequest('/system/status')
        .then(response => {
            console.log('✅ Respuesta de prueba recibida:', response);
        })
        .catch(error => {
            console.log('⚠️ Error en prueba (normal si no hay conexión):', error.message);
        });
    
    // 6. Verificar estructura de respuesta simulada
    console.log('6. Probando respuesta simulada de reserva...');
    const datosSimulados = {
        clientName: 'Test User',
        clientPhone: '099123456',
        date: '2025-07-12T10:00',
        vehicleType: 'auto',
        vehiclePlate: 'ABC1234',
        serviceType: 'basico',
        price: 600,
        id: 123456,
        status: 'confirmed'
    };
    
    try {
        mostrarReservaConfirmada(datosSimulados);
        console.log('✅ mostrarReservaConfirmada funciona correctamente');
    } catch (error) {
        console.error('❌ Error en mostrarReservaConfirmada:', error);
    }
    
    console.log('🔍 === FIN DEL DIAGNÓSTICO ===');
};

// Función para simular una reserva completa
window.simularReserva = function() {
    console.log('🎭 === SIMULANDO RESERVA COMPLETA ===');
    
    // Datos de prueba
    const datosReserva = {
        clientName: 'Juan Pérez',
        clientPhone: '098385709',
        date: '2025-07-12T14:00',
        vehicleType: 'auto',
        vehiclePlate: 'ABC1234',
        serviceType: 'premium',
        price: 1100,
        extras: ['Limpieza de tapizados']
    };
    
    // Simular la respuesta del servidor
    const respuestaServidor = {
        status: 'SUCCESS',
        data: {
            ...datosReserva,
            id: Math.floor(100000 + Math.random() * 900000),
            status: 'confirmed',
            createdAt: new Date().toISOString()
        },
        message: 'Reserva creada exitosamente'
    };
    
    console.log('📤 Datos enviados:', datosReserva);
    console.log('📨 Respuesta simulada:', respuestaServidor);
    
    // Intentar mostrar el modal
    try {
        mostrarReservaConfirmada(respuestaServidor.data);
        console.log('✅ Modal mostrado exitosamente');
    } catch (error) {
        console.error('❌ Error mostrando modal:', error);
    }
};

// Función para probar el sistema de fallback
window.probarFallback = function() {
    console.log('🛡️ === PROBANDO SISTEMA DE FALLBACK ===');
    
    const formData = {
        clientName: 'María García',
        clientPhone: '099887766',
        date: '2025-07-13T09:30',
        vehicleType: 'camioneta_caja',
        vehiclePlate: 'XYZ9876',
        serviceType: 'detailing',
        price: 3850,
        extras: []
    };
    
    // Simular fallo de API y activación de fallback
    const datosRespaldo = {
        ...formData,
        id: Math.floor(100000 + Math.random() * 900000),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        source: 'offline'
    };
    
    console.log('📝 Datos del formulario:', formData);
    console.log('🔄 Datos de respaldo generados:', datosRespaldo);
    
    try {
        mostrarReservaConfirmada(datosRespaldo);
        console.log('✅ Sistema de fallback funciona correctamente');
    } catch (error) {
        console.error('❌ Error en sistema de fallback:', error);
    }
};

console.log('🔧 Herramientas de diagnóstico cargadas:');
console.log('   - diagnosticarReserva() - Diagnóstico completo del sistema');
console.log('   - simularReserva() - Simular una reserva completa');
console.log('   - probarFallback() - Probar sistema de fallback');

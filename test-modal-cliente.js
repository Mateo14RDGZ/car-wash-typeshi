/**
 * Función de prueba para verificar que el modal se muestre con datos del cliente
 * Ejecutar en la consola del navegador: probarModalConDatosCliente()
 */

window.probarModalConDatosCliente = function() {
    console.log('🧪 === PRUEBA: MODAL CON DATOS DEL CLIENTE ===');
    
    // Datos de ejemplo de un cliente real
    const datosClienteEjemplo = {
        clientName: 'Juan Carlos Pérez',
        clientPhone: '098 123 456',
        date: '2025-07-12T14:30',
        vehicleType: 'auto',
        vehiclePlate: 'ABC1234',
        serviceType: 'premium',
        price: 1100,
        extras: ['Limpieza de tapizados', 'Pulido de ópticas'],
        id: 234567,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    console.log('👤 Datos del cliente de prueba:', datosClienteEjemplo);
    
    try {
        // Llamar directamente a la función del modal
        mostrarReservaConfirmada(datosClienteEjemplo);
        console.log('✅ Modal mostrado correctamente con datos del cliente');
        
        // Verificar que los elementos del modal contengan los datos correctos
        setTimeout(() => {
            console.log('🔍 Verificando contenido del modal...');
            
            const modalContent = document.querySelector('#reservar');
            if (modalContent) {
                const contenidoHTML = modalContent.innerHTML;
                
                // Verificar que los datos del cliente estén presentes
                const verificaciones = [
                    { campo: 'Nombre', valor: datosClienteEjemplo.clientName, presente: contenidoHTML.includes(datosClienteEjemplo.clientName) },
                    { campo: 'Teléfono', valor: datosClienteEjemplo.clientPhone, presente: contenidoHTML.includes(datosClienteEjemplo.clientPhone) },
                    { campo: 'Patente', valor: datosClienteEjemplo.vehiclePlate, presente: contenidoHTML.includes(datosClienteEjemplo.vehiclePlate) },
                    { campo: 'Precio', valor: datosClienteEjemplo.price, presente: contenidoHTML.includes(datosClienteEjemplo.price.toString()) },
                    { campo: 'Código', valor: datosClienteEjemplo.id, presente: contenidoHTML.includes(datosClienteEjemplo.id.toString()) }
                ];
                
                console.log('📊 Resultados de verificación:');
                verificaciones.forEach(v => {
                    if (v.presente) {
                        console.log(`   ✅ ${v.campo}: ${v.valor} - PRESENTE`);
                    } else {
                        console.log(`   ❌ ${v.campo}: ${v.valor} - NO ENCONTRADO`);
                    }
                });
                
                // Verificar extras
                datosClienteEjemplo.extras.forEach(extra => {
                    if (contenidoHTML.includes(extra)) {
                        console.log(`   ✅ Extra: ${extra} - PRESENTE`);
                    } else {
                        console.log(`   ❌ Extra: ${extra} - NO ENCONTRADO`);
                    }
                });
                
                const todosPresentes = verificaciones.every(v => v.presente);
                if (todosPresentes) {
                    console.log('🎉 ¡ÉXITO! Todos los datos del cliente se muestran correctamente en el modal');
                } else {
                    console.log('⚠️ Algunos datos del cliente no se encontraron en el modal');
                }
                
            } else {
                console.log('❌ No se encontró el contenedor del modal');
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Error al mostrar el modal:', error);
    }
};

/**
 * Función para simular una reserva completa con datos del formulario
 */
window.simularReservaCompleta = function() {
    console.log('🎭 === SIMULACIÓN: RESERVA COMPLETA ===');
    
    // Simular llenar el formulario
    const nombre = document.getElementById('nombre');
    const telefono = document.getElementById('telefono');
    const vehiculo = document.getElementById('vehiculo');
    const patente = document.getElementById('patente');
    const fecha = document.getElementById('fecha');
    
    if (nombre) nombre.value = 'María González';
    if (telefono) telefono.value = '099 876 543';
    if (vehiculo) vehiculo.value = 'camioneta_caja';
    if (patente) patente.value = 'XYZ9876';
    if (fecha) fecha.value = '2025-07-13';
    
    // Simular selección de servicio
    window.servicioSeleccionado = 'detailing';
    window.horarioSeleccionado = '09:00 - 10:30';
    
    console.log('📝 Formulario simulado completado');
    console.log('👤 Datos del cliente:', {
        nombre: nombre?.value,
        telefono: telefono?.value,
        vehiculo: vehiculo?.value,
        patente: patente?.value,
        fecha: fecha?.value,
        servicio: window.servicioSeleccionado,
        horario: window.horarioSeleccionado
    });
    
    // Obtener datos del formulario usando la función real
    try {
        const datosFormulario = obtenerDatosDelFormulario();
        console.log('📋 Datos obtenidos del formulario:', datosFormulario);
        
        // Mostrar modal con esos datos
        mostrarReservaConfirmada(datosFormulario);
        console.log('✅ Modal mostrado con datos del formulario simulado');
        
    } catch (error) {
        console.error('❌ Error en simulación:', error);
    }
};

console.log('🧪 Funciones de prueba cargadas:');
console.log('   - probarModalConDatosCliente() - Probar modal con datos específicos');
console.log('   - simularReservaCompleta() - Simular llenado de formulario y mostrar modal');

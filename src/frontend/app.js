// Función para manejar errores de depuración (protegida contra redeclaración)
if (typeof window.debugError === 'undefined') {
    window.debugError = function(...args) {
        if (!window.isProduction) {
            console.error(...args);
        } else {
            // En producción, registrar errores pero sin incluir detalles sensibles
            console.error('Se ha producido un error. Consulta con el administrador si el problema persiste.');
        }
    };
}

// Función para manejar logs de depuración (protegida contra redeclaración)
if (typeof window.debugLog === 'undefined') {
    window.debugLog = function(...args) {
        if (!window.isProduction) {
            console.log(...args);
        }
    };
}

// Variables globales (usar window para evitar conflictos de carga múltiple)
if (typeof window.servicioSeleccionado === 'undefined') {
    window.servicioSeleccionado = null;
}
if (typeof window.horarioSeleccionado === 'undefined') {
    window.horarioSeleccionado = null;
}
if (typeof window.precios === 'undefined') {
    window.precios = {
        basico: 600,
        premium: 1100,
        detailing: 3850
    };
}

// SISTEMA DEFINITIVO: Forzar uso exclusivo del api-bridge
// No hay más intento de múltiples URLs o servidores locales
if (typeof window.isProduction === 'undefined') {
    window.isProduction = true; // Siempre tratar como producción
}
if (typeof window.isSecureContext === 'undefined') {
    window.isSecureContext = true; // Siempre asumir contexto seguro
}

// ELIMINADAS TODAS LAS RUTAS ALTERNATIVAS
// Asegurar que no haya variables globales que puedan interferir
window.API_URL = null;
window.API_URLS_FALLBACK = null;

// Solo mostrar logs de depuración en entorno de desarrollo
window.debugLog('DEBUG - Entorno: Desarrollo', 
               '| Protocolo:', isSecureContext ? 'HTTPS' : 'HTTP',
               '| API principal:', window.API_URL);

// Animación de entrada para elementos
document.addEventListener('DOMContentLoaded', () => {
    // Verificar la conexión a internet
    if (!navigator.onLine) {
        alert('Esta aplicación requiere conexión a internet para funcionar correctamente. Por favor, verifica tu conexión e intenta nuevamente.');
    }
    
    // Animar elementos al cargar la página
    const elementos = document.querySelectorAll('.card, .form-control, .hero-section h1, .hero-section p');
    elementos.forEach((elemento, index) => {
        elemento.style.opacity = '0';
        setTimeout(() => {
            elemento.style.opacity = '1';
            elemento.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Botón de cancelar reserva
    const reservaForm = document.getElementById('reservaForm');
    if (reservaForm) {
    }
});

// Función para seleccionar servicio con animación
// La declaramos como variable global para que sea accesible desde el HTML
window.seleccionarServicio = function(tipo) {
    window.servicioSeleccionado = tipo;
    const botones = document.querySelectorAll('.card button');
    const cards = document.querySelectorAll('.card');

    // Resetear todos los cards y botones
    cards.forEach(card => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });

    botones.forEach(btn => {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-primary');
    });    // Animar el card seleccionado
    // En lugar de usar template strings, usamos concatenación de strings
    const cardSeleccionada = document.querySelector('button[onclick="seleccionarServicio(\'' + tipo + '\')"]').closest('.card');
    const botonSeleccionado = cardSeleccionada.querySelector('button');

    cardSeleccionada.style.transform = 'translateY(-15px)';
    cardSeleccionada.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';

    botonSeleccionado.classList.remove('btn-primary');
    botonSeleccionado.classList.add('btn-success');

    // Scroll suave al formulario con delay
    setTimeout(() => {
        document.querySelector('#reservar').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);

    // Actualizar precio en el formulario
    actualizarPrecioConExtras();
    // Agregar listeners a los checkboxes de extras
    agregarListenersExtras();
}

// Función para actualizar el precio sumando extras
function actualizarPrecioConExtras() {
    if (!window.servicioSeleccionado) return;
    let total = window.precios[window.servicioSeleccionado];
    // Seleccionar los extras visibles del servicio seleccionado
    let extrasChecks = [];
    if (window.servicioSeleccionado === 'basico') {
        extrasChecks = [
            document.getElementById('extra-aroma-basico'),
            document.getElementById('extra-encerado-basico'),
            document.getElementById('extra-tapizado-basico'),
            document.getElementById('extra-opticas-basico')
        ];
    } else if (window.servicioSeleccionado === 'premium') {
        extrasChecks = [
            document.getElementById('extra-tapizado-premium'),
            document.getElementById('extra-opticas-premium')
        ];
    }
    extrasChecks.forEach(chk => {
        if (chk && chk.checked) {
            total += parseInt(chk.getAttribute('data-precio'));
        }
    });
    const formTitle = document.querySelector('#reservar h2');
    formTitle.innerHTML = `Reservar Turno - ${total}`;
    formTitle.style.animation = 'fadeInUp 0.5s ease-out';
}

// Agrega listeners a los checkboxes de extras para actualizar el precio en tiempo real
function agregarListenersExtras() {
    let extrasChecks = [];
    if (window.servicioSeleccionado === 'basico') {
        extrasChecks = [
            document.getElementById('extra-aroma-basico'),
            document.getElementById('extra-encerado-basico'),
            document.getElementById('extra-tapizado-basico'),
            document.getElementById('extra-opticas-basico')
        ];
    } else if (window.servicioSeleccionado === 'premium') {
        extrasChecks = [
            document.getElementById('extra-tapizado-premium'),
            document.getElementById('extra-opticas-premium')
        ];
    }
    extrasChecks.forEach(chk => {
        if (chk) {
            chk.onchange = actualizarPrecioConExtras;
        }
    });
}

// Validación de fecha y obtención de horarios disponibles
document.getElementById('fecha')?.addEventListener('change', async function () {
    try {
        // Asegurarse de que la fecha se maneje en la zona horaria local
        const fechaStr = this.value + 'T00:00:00';
        const fecha = new Date(fechaStr);
        const ahora = new Date();

        window.debugLog('DEBUG - Fecha seleccionada:', fecha.toLocaleDateString());
        window.debugLog('DEBUG - Valor del input:', this.value);
        window.debugLog('DEBUG - Día de la semana:', fecha.getDay());

        // Validar que la fecha sea futura
        if (fecha < ahora) {
            window.debugLog('DEBUG - Fecha rechazada: es pasada');
            mostrarError('Por favor, selecciona una fecha futura');
            this.value = '';
            return;
        }

        // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
        const dia = fecha.getDay();

        // Validar que no sea domingo
        if (dia === 0) {
            window.debugLog('DEBUG - Fecha rechazada: es domingo');
            mostrarError('Lo sentimos, no atendemos los domingos');
            this.value = '';
            return;
        }        const horariosContainer = document.getElementById('horariosContainer');
        if (!horariosContainer) {
            window.debugError('DEBUG - No se encontró el contenedor de horarios con ID "horariosContainer"');
            console.error('❌ CONTENEDOR DE HORARIOS NO ENCONTRADO - Elementos disponibles:', 
                Array.from(document.querySelectorAll('[id*="horario"]')).map(el => el.id));
            return;
        }
        
        console.log('✅ Contenedor de horarios encontrado:', horariosContainer);

        // Formatear la fecha para la API
        const fechaFormateada = fecha.toISOString().split('T')[0];
        
        // Crear un array de horarios predefinidos para mostrar mientras carga
        const horariosRespaldo = dia === 6 ? [
            { start: '08:30', end: '10:00', time: '08:30 - 10:00' },
            { start: '10:00', end: '11:30', time: '10:00 - 11:30' },
            { start: '11:30', end: '13:00', time: '11:30 - 13:00' }
        ] : [
            { start: '08:30', end: '10:00', time: '08:30 - 10:00' },
            { start: '10:00', end: '11:30', time: '10:00 - 11:30' },
            { start: '11:30', end: '13:00', time: '11:30 - 13:00' },
            { start: '14:00', end: '15:30', time: '14:00 - 15:30' },
            { start: '15:30', end: '17:00', time: '15:30 - 17:00' }
        ];
        
        const horarioDia = dia === 6 ? '8:30 a 13:00' : '8:30 a 17:00';
        
        // Primero mostrar los horarios de respaldo (casi instantáneamente)
        horariosContainer.innerHTML = `
            <div class="horarios-container">
                <div class="horarios-header">
                    <h4><i class="fas fa-clock"></i> Horarios Disponibles</h4>
                    <p class="text-muted">Selecciona el horario que prefieras</p>
                </div>
                <div class="horarios-info">
                    <p><i class="fas fa-info-circle"></i> Horario de atención para este día: ${horarioDia}</p>
                    <p class="text-muted" id="carga-info"><small>Verificando disponibilidad...</small></p>
                </div>
                <div class="horarios-grid">
                    ${horariosRespaldo.map(slot => `
                        <div class="horario-slot horario-loading" data-time="${slot.time}">
                            <div class="horario-tiempo">
                                <span class="tiempo-inicio">${slot.start}</span>
                                <span class="tiempo-separador"> - </span>
                                <span class="tiempo-fin">${slot.end}</span>
                            </div>
                            <div class="horario-duracion">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        horariosContainer.style.display = 'block';        // Realizar la petición al backend utilizando el helper
        const endpoint = '/bookings/available-slots?date=' + fechaFormateada;
        console.log('🚀 INICIANDO PETICIÓN DE HORARIOS:', {
            endpoint: endpoint,
            fechaFormateada: fechaFormateada,
            apiRequestDisponible: typeof apiRequest !== 'undefined'
        });
        
        try {
            // Mostrar estado de carga mejorado
            const infoText = document.getElementById('carga-info');
            if (infoText) {
                infoText.innerHTML = '<span class="badge bg-primary"><i class="fas fa-database fa-spin me-1"></i> Consultando base de datos...</span>';
            }

            // Verificar que apiRequest esté disponible
            if (typeof apiRequest === 'undefined') {
                throw new Error('apiRequest no está definida. API Helper no se cargó correctamente.');
            }

            // Usar la función helper para realizar la petición
            console.log('📡 Ejecutando apiRequest...');
            const data = await apiRequest(endpoint);
            console.log('📊 RESPUESTA RECIBIDA:', data);
            window.debugLog('DEBUG - Datos recibidos del servidor:', data);

            // Verificar si los datos vienen de MySQL o generación local
            if (data && data.dataSource) {
                console.log(`Origen de datos: ${data.dataSource}`);
            }
            
            // Cuando lleguen los datos reales, actualizar los horarios
            if (data && data.data && Array.isArray(data.data)) {
                window.debugLog('DEBUG - Cantidad de slots disponibles:', data.data.length);
                  // Usar la nueva función para procesar los horarios
                procesarHorariosDisponibles(data.data);
            } else {
                // Si no hay datos o el formato es incorrecto
                window.debugLog('DEBUG - Los datos recibidos no tienen el formato esperado o están vacíos');
                document.querySelectorAll('.horario-slot').forEach(element => {
                    // Quitar clase de carga
                    element.classList.remove('horario-loading');
                    // Marcar todos como no disponibles
                    element.classList.add('horario-no-disponible');
                    element.onclick = null; // Eliminar evento click
                    // Actualizar contenido
                    const durationDiv = element.querySelector('.horario-duracion');
                    durationDiv.innerHTML = '<i class="fas fa-times"></i>';
                });
                
                // Actualizar mensaje de carga
                const infoText = document.getElementById('carga-info');
                if (infoText) {
                    // Verificar si hay un mensaje personalizado del servidor
                    if (data && data.message) {
                        infoText.innerHTML = `<span class="badge bg-info text-dark"><i class="fas fa-info-circle me-1"></i> ${data.message}</span>`;
                    } else {
                        infoText.innerHTML = '<span class="badge bg-warning text-dark"><i class="fas fa-exclamation-circle me-1"></i> No hay horarios disponibles para esta fecha</span>';
                    }
                }
            }
        } catch (error) {            window.debugError('ERROR al obtener horarios disponibles:', error);
            console.error('INTENTANDO RECUPERACIÓN DE EMERGENCIA...');
            
            // Intentar cargar los horarios de fallback como último recurso
            try {
                console.log('Cargando respaldo de emergencia...');
                fetch('slots-fallback.json?' + new Date().getTime())
                    .then(response => response.json())
                    .then(fallbackData => {
                        console.log('HORARIOS DE EMERGENCIA CARGADOS:', fallbackData);
                        // Procesar los datos del fallback como si fueran datos normales
                        if (fallbackData && fallbackData.data && Array.isArray(fallbackData.data)) {
                            procesarHorariosDisponibles(fallbackData.data);
                            
                            // Mostrar mensaje de advertencia
                            const infoText = document.getElementById('carga-info');
                            if (infoText) {
                                infoText.innerHTML = '<span class="badge bg-warning text-dark"><i class="fas fa-exclamation-triangle me-1"></i> Mostrando horarios de respaldo</span>';
                            }
                            return;
                        }
                    })
                    .catch(fallbackError => {
                        console.error('ERROR EN RESPALDO:', fallbackError);
                        mostrarErrorConexion();
                    });
            } catch (fallbackError) {
                console.error('ERROR AL CARGAR RESPALDO:', fallbackError);
                mostrarErrorConexion();
            }
            
            // Función para mostrar error de conexión
            function mostrarErrorConexion() {
                // En caso de error, marcar todos como no disponibles pero con mensaje de error de conexión
                document.querySelectorAll('.horario-slot').forEach(element => {
                    // Quitar clase de carga
                    element.classList.remove('horario-loading');
                    element.classList.add('horario-no-disponible');
                    element.onclick = null; // Eliminar evento click
                    // Actualizar contenido
                    const durationDiv = element.querySelector('.horario-duracion');
                    durationDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                });
                
                // Actualizar mensaje de carga
                const infoText = document.getElementById('carga-info');
                if (infoText) {
                    infoText.innerHTML = '<span class="badge bg-danger text-white"><i class="fas fa-exclamation-triangle me-1"></i> Error de conexión - No se pudieron cargar los horarios</span>';
                }
                
                // Mostrar notificación de error detallada
                mostrarError('Error de conexión<br><small>No se pudieron cargar los horarios disponibles. Esta aplicación requiere conexión a internet para funcionar correctamente.<br><br>Por favor, verifica tu conexión e intenta nuevamente. Si el problema persiste, comunícate con nosotros al 098 385 709.</small>');
            }
        }
    } catch (error) {
        window.debugError('DEBUG - Error general al procesar la fecha:', error);
        mostrarError('Ocurrió un error al procesar la fecha seleccionada');
    }
});

// Función para mostrar errores
function mostrarError(mensaje) {
    // Crear el elemento de alerta si no existe
    let alertaElement = document.getElementById('alerta-sistema');
    if (!alertaElement) {
        alertaElement = document.createElement('div');
        alertaElement.id = 'alerta-sistema';
        alertaElement.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
        alertaElement.style.zIndex = '9999';
        alertaElement.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        alertaElement.style.maxWidth = '90%';
        document.body.appendChild(alertaElement);
    }

    // Actualizar mensaje y mostrar
    alertaElement.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i> ${mensaje}`;
    alertaElement.style.display = 'block';
    alertaElement.style.opacity = '1';

    // Ocultar después de 5 segundos
    setTimeout(() => {
        alertaElement.style.opacity = '0';
        setTimeout(() => {
            alertaElement.style.display = 'none';
        }, 500);
    }, 5000);
}

// Función para seleccionar horario
// La declaramos como variable global para que sea accesible desde el HTML
window.seleccionarHorario = function(hora, elemento) {
    // Remover selección previa
    document.querySelectorAll('.horario-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Seleccionar nuevo horario
    elemento.classList.add('selected');
    window.horarioSeleccionado = hora;

    // Mostrar confirmación visual
    const confirmacion = document.createElement('div');
    confirmacion.className = 'alert alert-success mt-3 animate__animated animate__fadeIn';
    confirmacion.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        Has seleccionado el horario: <strong>${hora}</strong>
    `;

    // Remover confirmación anterior si existe
    const confirmacionAnterior = document.querySelector('.alert-success');
    if (confirmacionAnterior) {
        confirmacionAnterior.remove();
    }

    // Agregar nueva confirmación
    document.getElementById('horariosContainer').appendChild(confirmacion);

    // Hacer scroll suave hasta el siguiente paso
    setTimeout(() => {
        const siguientePaso = document.getElementById('datosPersonales');
        if (siguientePaso) {
            siguientePaso.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 500);
}

// Actualizar el manejo del formulario
document.getElementById('reservaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!window.servicioSeleccionado) {
        mostrarError('Por favor, selecciona un servicio antes de continuar');
        return;
    }

    if (!window.horarioSeleccionado) {
        mostrarError('Por favor, selecciona un horario');
        return;
    }

    const fecha = document.getElementById('fecha').value;    window.debugLog('DEBUG - Submit - Fecha seleccionada:', fecha);
    window.debugLog('DEBUG - Submit - Horario seleccionado:', window.horarioSeleccionado);    
    // Crear objeto Date para validación
    const [horaInicio] = window.horarioSeleccionado.split(' - ');    const fechaHora = new Date(fecha + 'T' + horaInicio);
    window.debugLog('DEBUG - Submit - Fecha y hora combinadas:', fechaHora.toISOString());
    window.debugLog('DEBUG - Submit - Fecha y hora local:', fechaHora.toLocaleString());
    window.debugLog('DEBUG - Submit - Día de la semana:', fechaHora.getDay());

    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const dia = fechaHora.getDay();

    // Validar que no sea domingo
    if (dia === 0) {
        mostrarError('Lo sentimos, no atendemos los domingos');
        return;
    }

    // Validar que sea un día válido (lunes a sábado)
    if (dia < 1 || dia > 6) {
        mostrarError('Por favor, selecciona un día válido (lunes a sábado)');
        return;
    }

    // Capturar extras seleccionados
    let extrasSeleccionados = [];
    if (window.servicioSeleccionado === 'basico') {
        if (document.getElementById('extra-aroma-basico')?.checked) extrasSeleccionados.push('Aromatización');
        if (document.getElementById('extra-encerado-basico')?.checked) extrasSeleccionados.push('Encerado');
        if (document.getElementById('extra-tapizado-basico')?.checked) extrasSeleccionados.push('Limpieza de tapizados');
        if (document.getElementById('extra-opticas-basico')?.checked) extrasSeleccionados.push('Pulido de ópticas');
    } else if (window.servicioSeleccionado === 'premium') {
        if (document.getElementById('extra-tapizado-premium')?.checked) extrasSeleccionados.push('Limpieza de tapizados');
        if (document.getElementById('extra-opticas-premium')?.checked) extrasSeleccionados.push('Pulido de ópticas');
    }

    // Calcular el precio total con extras seleccionados
    let total = window.precios[window.servicioSeleccionado];
    let extrasChecks = [];
    if (window.servicioSeleccionado === 'basico') {
        extrasChecks = [
            document.getElementById('extra-aroma-basico'),
            document.getElementById('extra-encerado-basico'),
            document.getElementById('extra-tapizado-basico'),
            document.getElementById('extra-opticas-basico')
        ];
    } else if (window.servicioSeleccionado === 'premium') {
        extrasChecks = [
            document.getElementById('extra-tapizado-premium'),
            document.getElementById('extra-opticas-premium')
        ];
    }
    extrasChecks.forEach(chk => {
        if (chk && chk.checked) {
            total += parseInt(chk.getAttribute('data-precio'));
        }
    });    const formData = {
        clientName: document.getElementById('nombre').value,
        clientPhone: document.getElementById('telefono').value,
        date: fecha + 'T' + horaInicio,
        vehicleType: document.getElementById('vehiculo').value,
        vehiclePlate: document.getElementById('patente').value,
        serviceType: window.servicioSeleccionado,
        price: total,
        extras: extrasSeleccionados
    };// Validación de campos
    if (!validarFormulario(formData)) {
        return;
    }
    
    console.log('📤 DATOS ENVIADOS AL SERVIDOR:', formData);
    console.log('📤 JSON stringified:', JSON.stringify(formData));

    try {
        // Enviar la reserva al servidor
        const data = await apiRequest('/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
          console.log('📡 RESPUESTA DEL SERVIDOR AL CREAR RESERVA:', data);
        console.log('📋 data.data:', data.data);
        console.log('📋 Estructura completa de data:', Object.keys(data || {}));
        
        // Actualizar horarios en segundo plano para reflejar la nueva reserva
        console.log('🔄 Actualizando horarios disponibles en segundo plano...');
        // Nota: Esto actualiza los horarios para cuando el usuario haga otra reserva
        
        // Si tiene éxito, mostrar confirmación
        mostrarReservaConfirmada(data.data);
        
    } catch (error) {
        window.debugError('Error al enviar la reserva:', error);
        mostrarError('No se pudo procesar la reserva. Por favor, verifica tu conexión a internet e intenta nuevamente. Si el problema persiste, comunícate con nosotros al 098 385 709.');
    }
});

// Esta función se ha eliminado debido a que la aplicación ahora requiere conexión a internet
// para funcionar correctamente y guardar las reservas directamente en la base de datos MySQL

// Validar los campos del formulario
function validarFormulario(formData) {
    if (!formData.clientName || formData.clientName.trim().length < 3) {
        mostrarError('Por favor, ingresa un nombre válido');
        return false;
    }

    if (!formData.clientPhone || formData.clientPhone.trim().length < 8) {
        mostrarError('Por favor, ingresa un número de teléfono válido (mínimo 8 dígitos)');
        return false;
    }

    if (!formData.vehicleType || formData.vehicleType === '') {
        mostrarError('Por favor, selecciona el tipo de vehículo');
        return false;
    }

    if (!formData.vehiclePlate || formData.vehiclePlate.trim().length < 6) {
        mostrarError('Por favor, ingresa una patente válida');
        return false;
    }

    return true;
}

// Función para mostrar la confirmación de reserva
function mostrarReservaConfirmada(reserva) {
    console.log('🎯 MOSTRAR RESERVA CONFIRMADA - Datos recibidos:', reserva);
    console.log('🔍 Tipo de datos:', typeof reserva);
    console.log('🔍 Estructura de reserva:', Object.keys(reserva || {}));
    
    // Crear los elementos para la confirmación
    const container = document.getElementById('reservar');
    const originalContent = container.innerHTML;
    
    // Guardar el contenido original
    container.dataset.originalContent = originalContent;
    
    const date = new Date(reserva.date);
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const fechaFormateada = date.toLocaleDateString('es-ES', opciones);
    
    // Mapeo de tipos de servicio a nombres legibles
    const serviciosNombres = {
        'basico': 'Lavado Básico',
        'premium': 'Lavado Premium',
        'detailing': 'Detailing Completo'
    };
    
    // Mapeo de tipos de vehículo a nombres legibles
    const vehiculosNombres = {
        'auto': 'Auto',
        'camioneta_caja': 'Camioneta con caja',
        'camioneta_sin_caja': 'Camioneta sin caja'
    };

    container.innerHTML = `
        <div class="container py-5 animate__animated animate__fadeIn">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card shadow-lg border-0">
                        <div class="card-header bg-success text-white text-center py-4">
                            <i class="fas fa-check-circle fa-3x mb-3"></i>
                            <h3 class="mb-0">¡Reserva Confirmada!</h3>
                        </div>
                        <div class="card-body p-5">
                            <div class="confirmation-details">
                                <h5 class="mb-4">Detalles de tu reserva</h5>
                                
                                <div class="mb-4 d-flex align-items-center">
                                    <div class="icon-box me-3">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block">A nombre de</small>
                                        <strong>${reserva.clientName}</strong>
                                    </div>
                                </div>
                                
                                <div class="mb-4 d-flex align-items-center">
                                    <div class="icon-box me-3">
                                        <i class="fas fa-calendar-check"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block">Fecha y hora</small>
                                        <strong>${fechaFormateada}</strong>
                                    </div>
                                </div>
                                
                                <div class="mb-4 d-flex align-items-center">
                                    <div class="icon-box me-3">
                                        <i class="fas fa-shower"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block">Servicio</small>
                                        <strong>${serviciosNombres[reserva.serviceType] || reserva.serviceType}</strong>
                                        ${reserva.extras && reserva.extras.length > 0 ? 
                                        `<div class="mt-2">
                                            <small class="text-muted">Extras:</small>
                                            <ul class="mb-0 ps-3">
                                                ${reserva.extras.map(extra => `<li>${extra}</li>`).join('')}
                                            </ul>
                                        </div>` : ''}
                                    </div>
                                </div>
                                
                                <div class="mb-4 d-flex align-items-center">
                                    <div class="icon-box me-3">
                                        <i class="fas fa-car"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block">Vehículo</small>
                                        <strong>${vehiculosNombres[reserva.vehicleType] || reserva.vehicleType}</strong>
                                        <div class="mt-1">
                                            <span class="badge bg-secondary">Patente: ${reserva.vehiclePlate}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-4 d-flex align-items-center">
                                    <div class="icon-box me-3">
                                        <i class="fas fa-tag"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block">Precio total</small>
                                        <strong class="text-success">$${reserva.price}</strong>
                                    </div>
                                </div>
                                
                                <div class="mb-4 d-flex align-items-center">
                                    <div class="icon-box me-3">
                                        <i class="fas fa-hashtag"></i>
                                    </div>
                                    <div>
                                        <small class="text-muted d-block">Código de reserva</small>
                                        <strong>${reserva.id}</strong>
                                    </div>
                                </div>
                            </div>
                              <hr>
                            <div class="text-center pt-2">
                                <button class="btn btn-primary" id="nuevaReservaBtn">
                                    <i class="fas fa-calendar-plus me-2"></i>Hacer otra reserva
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;      // Añadir listeners a los botones
    document.getElementById('nuevaReservaBtn').addEventListener('click', () => {
        // Recuperar el contenido original
        container.innerHTML = container.dataset.originalContent;
        // Resetear variables globales
        window.servicioSeleccionado = null;
        window.horarioSeleccionado = null;
        // Limpiar campos
        const form = document.getElementById('reservaForm');
        if (form) form.reset();
          // ACTUALIZAR HORARIOS DISPONIBLES
        console.log('🔄 Actualizando horarios después de crear reserva...');
        const fechaActual = document.getElementById('fecha').value;
        if (fechaActual) {
            // Disparar el evento change para recargar los horarios
            const fechaInput = document.getElementById('fecha');
            if (fechaInput) {
                // Simular cambio para recargar horarios
                fechaInput.dispatchEvent(new Event('change'));
            }
        }
    });
}

// Función para mostrar los extras
function mostrarExtras(tipo, btn) {
    const containerId = `extras-${tipo}`;
    const container = document.getElementById(containerId);
    
    if (container.style.display === 'none' || !container.style.display) {
        container.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-minus"></i> Ocultar extras';
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-outline-info');
    } else {
        container.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-plus"></i> Agregar extras';
        btn.classList.remove('btn-outline-info');
        btn.classList.add('btn-outline-secondary');
    }
}

// Función para cancelar la reserva
async function cancelarReserva() {
    console.log('🚫 Iniciando proceso de cancelación de reserva');
    
    // Crear modal de cancelación
    const modalHtml = `
        <div class="modal fade" id="cancelarReservaModal" tabindex="-1" aria-labelledby="cancelarReservaModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="cancelarReservaModalLabel">
                            <i class="fas fa-times-circle me-2"></i>Cancelar Reserva
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="cancelarStep1">
                            <p class="mb-3">Para cancelar tu reserva, necesitamos verificar tu identidad.</p>
                            
                            <div class="mb-3">
                                <label for="telefonoCancelacion" class="form-label">
                                    <i class="fas fa-phone me-1"></i>Número de teléfono registrado:
                                </label>
                                <input type="tel" class="form-control" id="telefonoCancelacion" 
                                       placeholder="Ej: +598 98 123 456" required>
                                <div class="form-text">Ingresa el teléfono que usaste al hacer la reserva</div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="fechaCancelacion" class="form-label">
                                    <i class="fas fa-calendar me-1"></i>Fecha de la reserva:
                                </label>
                                <input type="date" class="form-control" id="fechaCancelacion" required>
                            </div>
                        </div>
                        
                        <div id="cancelarStep2" style="display: none;">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Reserva encontrada</strong>
                            </div>
                            <div id="reservaEncontradaInfo"></div>
                            <div class="alert alert-warning mt-3">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <strong>¿Estás seguro?</strong> Esta acción no se puede deshacer.
                            </div>
                        </div>
                        
                        <div id="cancelarStep3" style="display: none;">
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle me-2"></i>
                                <strong>¡Reserva cancelada exitosamente!</strong>
                            </div>
                            <p>Tu reserva ha sido cancelada. El horario ahora está disponible para otros clientes.</p>
                        </div>
                        
                        <div id="cancelarError" style="display: none;">
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                <strong id="errorMessage"></strong>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="btnCerrarCancelar">Cerrar</button>
                        <button type="button" class="btn btn-primary" id="btnBuscarReserva" onclick="buscarReservaPorTelefono()">
                            <i class="fas fa-search me-1"></i>Buscar Reserva
                        </button>
                        <button type="button" class="btn btn-danger" id="btnConfirmarCancelacion" style="display: none;" onclick="confirmarCancelacionReserva()">
                            <i class="fas fa-times-circle me-1"></i>Confirmar Cancelación
                        </button>
                        <button type="button" class="btn btn-success" id="btnFinalizarCancelacion" style="display: none;" data-bs-dismiss="modal">
                            <i class="fas fa-check me-1"></i>Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar modal en el DOM si no existe
    if (!document.getElementById('cancelarReservaModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('cancelarReservaModal'));
    modal.show();
    
    // Limpiar campos al abrir
    document.getElementById('telefonoCancelacion').value = '';
    document.getElementById('fechaCancelacion').value = '';
    
    // Resetear pasos
    document.getElementById('cancelarStep1').style.display = 'block';
    document.getElementById('cancelarStep2').style.display = 'none';
    document.getElementById('cancelarStep3').style.display = 'none';
    document.getElementById('cancelarError').style.display = 'none';
    
    // Resetear botones
    document.getElementById('btnBuscarReserva').style.display = 'inline-block';
    document.getElementById('btnConfirmarCancelacion').style.display = 'none';
    document.getElementById('btnFinalizarCancelacion').style.display = 'none';
}

// Variable global para almacenar la reserva encontrada (protegida contra redeclaración)
if (typeof window.reservaEncontradaParaCancelar === 'undefined') {
    window.reservaEncontradaParaCancelar = null;
}

// Función para buscar reserva por teléfono y fecha
async function buscarReservaPorTelefono() {
    const telefono = document.getElementById('telefonoCancelacion').value.trim();
    const fecha = document.getElementById('fechaCancelacion').value;
    
    console.log('🔍 Buscando reserva con teléfono:', telefono, 'y fecha:', fecha);
    
    // Validar campos
    if (!telefono || telefono.length < 8) {
        mostrarErrorCancelacion('Por favor, ingresa un número de teléfono válido (mínimo 8 dígitos)');
        return;
    }
    
    if (!fecha) {
        mostrarErrorCancelacion('Por favor, selecciona la fecha de tu reserva');
        return;
    }
    
    // Mostrar loading
    const btnBuscar = document.getElementById('btnBuscarReserva');
    const textoOriginal = btnBuscar.innerHTML;
    btnBuscar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Buscando...';
    btnBuscar.disabled = true;
    
    try {
        // Buscar la reserva en la base de datos
        const response = await apiRequest(`/bookings/search?phone=${encodeURIComponent(telefono)}&date=${fecha}`, {
            method: 'GET'
        });
        
        console.log('📋 Respuesta de búsqueda:', response);
        
        if (response.status === 'SUCCESS' && response.data && response.data.length > 0) {
            // Reserva encontrada            window.reservaEncontradaParaCancelar = response.data[0]; // Tomar la primera reserva encontrada
            mostrarReservaEncontrada(window.reservaEncontradaParaCancelar);
        } else {
            mostrarErrorCancelacion('No se encontró ninguna reserva con ese teléfono y fecha. Verifica los datos ingresados.');
        }
        
    } catch (error) {
        console.error('❌ Error buscando reserva:', error);
        mostrarErrorCancelacion('Error al buscar la reserva. Por favor, intenta nuevamente.');
    } finally {
        // Restaurar botón
        btnBuscar.innerHTML = textoOriginal;
        btnBuscar.disabled = false;
    }
}

// Función para mostrar la reserva encontrada
function mostrarReservaEncontrada(reserva) {
    console.log('✅ Mostrando reserva encontrada:', reserva);
    
    const date = new Date(reserva.date);
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    const fechaFormateada = date.toLocaleDateString('es-ES', opciones);
    
    // Mapeo de tipos de servicio
    const serviciosNombres = {
        'basico': 'Lavado Básico',
        'premium': 'Lavado Premium',
        'detailing': 'Detailing Completo'
    };
    
    // Mapeo de tipos de vehículo
    const vehiculosNombres = {
        'auto': 'Auto',
        'camioneta_caja': 'Camioneta con caja',
        'camioneta_sin_caja': 'Camioneta sin caja'
    };
    
    const infoHtml = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">Detalles de la reserva:</h6>
                <ul class="list-unstyled mb-0">
                    <li><strong>Cliente:</strong> ${reserva.clientName}</li>
                    <li><strong>Fecha y hora:</strong> ${fechaFormateada}</li>
                    <li><strong>Servicio:</strong> ${serviciosNombres[reserva.serviceType] || reserva.serviceType}</li>
                    <li><strong>Vehículo:</strong> ${vehiculosNombres[reserva.vehicleType] || reserva.vehicleType}</li>
                    <li><strong>Patente:</strong> ${reserva.vehiclePlate}</li>
                    <li><strong>Precio:</strong> $${reserva.price}</li>
                    <li><strong>Código de reserva:</strong> #${reserva.id}</li>
                </ul>
            </div>
        </div>
    `;
    
    document.getElementById('reservaEncontradaInfo').innerHTML = infoHtml;
    
    // Cambiar a paso 2
    document.getElementById('cancelarStep1').style.display = 'none';
    document.getElementById('cancelarStep2').style.display = 'block';
    document.getElementById('cancelarError').style.display = 'none';
    
    // Cambiar botones
    document.getElementById('btnBuscarReserva').style.display = 'none';
    document.getElementById('btnConfirmarCancelacion').style.display = 'inline-block';
}

// Función para confirmar la cancelación
async function confirmarCancelacionReserva() {
    if (!window.reservaEncontradaParaCancelar) {
        mostrarErrorCancelacion('Error: No se encontró la reserva a cancelar');
        return;
    }
    
    console.log('❌ Confirmando cancelación de reserva ID:', window.reservaEncontradaParaCancelar.id);
    
    // Mostrar loading
    const btnConfirmar = document.getElementById('btnConfirmarCancelacion');
    const textoOriginal = btnConfirmar.innerHTML;
    btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Cancelando...';
    btnConfirmar.disabled = true;
    
    try {        // Cancelar la reserva en la base de datos
        const response = await apiRequest(`/bookings/${window.reservaEncontradaParaCancelar.id}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cancelReason: 'Cancelado por el cliente via web',
                cancelledAt: new Date().toISOString()
            })
        });
        
        console.log('✅ Respuesta de cancelación:', response);
        
        if (response.status === 'SUCCESS') {
            // Cancelación exitosa
            mostrarCancelacionExitosa();
        } else {
            mostrarErrorCancelacion('Error al cancelar la reserva. Por favor, contacta directamente al establecimiento.');
        }
        
    } catch (error) {
        console.error('❌ Error cancelando reserva:', error);
        mostrarErrorCancelacion('Error al cancelar la reserva. Por favor, intenta nuevamente o contacta directamente al establecimiento.');
    } finally {
        // Restaurar botón
        btnConfirmar.innerHTML = textoOriginal;
        btnConfirmar.disabled = false;
    }
}

// Función para mostrar cancelación exitosa
function mostrarCancelacionExitosa() {
    console.log('🎉 Cancelación completada exitosamente');
    
    // Cambiar a paso 3
    document.getElementById('cancelarStep2').style.display = 'none';
    document.getElementById('cancelarStep3').style.display = 'block';
    document.getElementById('cancelarError').style.display = 'none';
    
    // Cambiar botones
    document.getElementById('btnConfirmarCancelacion').style.display = 'none';
    document.getElementById('btnFinalizarCancelacion').style.display = 'inline-block';
      // Limpiar variable global
    window.reservaEncontradaParaCancelar = null;
}

// Función para mostrar errores de cancelación
function mostrarErrorCancelacion(mensaje) {
    console.error('❌ Error en cancelación:', mensaje);
    
    document.getElementById('errorMessage').textContent = mensaje;
    document.getElementById('cancelarError').style.display = 'block';
    
    // Scroll hacia el error
    setTimeout(() => {
        document.getElementById('cancelarError').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 100);
}

// Mostrar el selector de horario solo si hay una fecha seleccionada
document.getElementById('fecha') && document.getElementById('fecha').addEventListener('change', function() {
    const horarioContainer = document.getElementById('horariosContainer'); // Cambio: 'horario-container' -> 'horariosContainer'
    if (horarioContainer && this.value) {
        horarioContainer.style.display = 'block';
    } else if (horarioContainer) {
        horarioContainer.style.display = 'none';
    }
});

// NUEVA FUNCIÓN PARA MOSTRAR HORARIOS CORRECTAMENTE
function procesarHorariosDisponibles(horarios) {
    console.log('🔄 PROCESANDO HORARIOS RECIBIDOS:', {
        cantidad: horarios.length,
        datos: horarios
    });
    
    // Obtener el contenedor de horarios
    const horariosContainer = document.getElementById('horariosContainer');
    const horariosGrid = horariosContainer ? horariosContainer.querySelector('.horarios-grid') : null;
    
    if (!horariosGrid) {
        console.error('❌ No se encontró .horarios-grid dentro del contenedor');
        return;
    }
    
    // Limpiar contenido anterior
    horariosGrid.innerHTML = '';
    
    // Verificar si hay horarios disponibles
    if (horarios.length === 0) {
        console.log('⚠️ No hay horarios disponibles');
        horariosGrid.innerHTML = '<div class="alert alert-info">No hay horarios disponibles para esta fecha</div>';
        return;
    }
      // Crear botones para cada horario (disponibles y reservados)
    horarios.forEach(slot => {
        if (slot && slot.time) {
            const isReserved = slot.isBooked === true;
            console.log(`${isReserved ? '🔒' : '✅'} Creando botón para horario: ${slot.time} - ${isReserved ? 'RESERVADO' : 'DISPONIBLE'}`);
            
            const horarioBtn = document.createElement('button');
            horarioBtn.type = 'button';
            horarioBtn.textContent = slot.time;
            horarioBtn.value = slot.time;
            
            if (isReserved) {
                // Horario reservado - mostrar pero deshabilitar
                horarioBtn.className = 'btn btn-outline-secondary m-1';
                horarioBtn.disabled = true;
                horarioBtn.innerHTML = `${slot.time} <i class="fas fa-lock ms-1"></i>`;
                horarioBtn.title = 'Este horario ya está reservado';
            } else {
                // Horario disponible - normal
                horarioBtn.className = 'btn btn-outline-primary m-1';
                
                // Evento para seleccionar horario solo si está disponible
                horarioBtn.onclick = function() {
                    // Remover selección anterior
                    document.querySelectorAll('.horarios-grid .btn:not(:disabled)').forEach(btn => {
                        btn.classList.remove('btn-primary');
                        btn.classList.add('btn-outline-primary');
                    });
                    
                    // Marcar como seleccionado
                    this.classList.remove('btn-outline-primary');
                    this.classList.add('btn-primary');
                    
                    // Guardar horario seleccionado
                    window.horarioSeleccionado = slot.time;
                    console.log('⭐ Horario seleccionado:', slot.time);
                      // Crear/actualizar campo oculto para el formulario
                    let horarioInput = document.getElementById('horarioSeleccionado');
                    if (!horarioInput) {
                        horarioInput = document.createElement('input');
                        horarioInput.type = 'hidden';
                        horarioInput.name = 'horario';
                        horarioInput.id = 'horarioSeleccionado';
                        document.getElementById('reservaForm').appendChild(horarioInput);
                    }
                    horarioInput.value = slot.time;
                };
            }
            
            horariosGrid.appendChild(horarioBtn);
        }
    });
    
    // Mostrar mensaje de éxito en el indicador de carga
    const infoText = document.getElementById('carga-info');
    if (infoText) {
        infoText.innerHTML = '<span class="badge bg-success text-white">' +
            '<i class="fas fa-check-circle me-1"></i> ' + horarios.length + ' horarios cargados desde MySQL</span>';
        
        // Desvanecer después de 3 segundos
        setTimeout(() => {
            infoText.style.opacity = '0';
            setTimeout(() => {
                infoText.style.display = 'none';
            }, 500);
        }, 3000);
    }
    
    console.log('✅ Horarios procesados y mostrados correctamente');
}

// Función antigua comentada (mantener como referencia)
/*
function procesarHorariosDisponiblesOld(horarios) {
    // ...existing code...
}
*/

// Verificación de que todos los elementos necesarios existen
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 VERIFICANDO ELEMENTOS NECESARIOS:');
    
    const checks = [
        { id: 'fecha', name: 'Input de fecha' },
        { id: 'horariosContainer', name: 'Contenedor de horarios' },
        { id: 'reservaForm', name: 'Formulario de reserva' },
        { id: 'carga-info', name: 'Indicador de carga' }
    ];
    
    checks.forEach(check => {
        const element = document.getElementById(check.id);
        if (element) {
            console.log(`✅ ${check.name} encontrado`);
        } else {
            console.error(`❌ ${check.name} NO encontrado (ID: ${check.id})`);
        }
    });
    
    // Verificar que .horarios-grid existe dentro del contenedor
    const horariosGrid = document.querySelector('#horariosContainer .horarios-grid');
    if (horariosGrid) {
        console.log('✅ Grid de horarios encontrado');
    } else {
        console.error('❌ Grid de horarios NO encontrado');
    }
    
    // Verificar que apiRequest está disponible
    if (typeof window.apiRequest === 'function') {
        console.log('✅ apiRequest disponible');
    } else {
        console.error('❌ apiRequest NO disponible');
    }
    
    console.log('🎯 VERIFICACIÓN COMPLETADA - La aplicación debería funcionar correctamente');
});

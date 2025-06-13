// Variables globales
let servicioSeleccionado = null;
let horarioSeleccionado = null;
const precios = {
    basico: 600,
    premium: 1100,
    detailing: 3850
};

// Configuración de la API
const API_HOST = 'localhost';
const API_PORT = '3003';
const API_URL = `http://${API_HOST}:${API_PORT}/api`; // URL local
// const API_URL = 'https://car-wash-typeshi.vercel.app/api'; // URL de producción

// Animación de entrada para elementos
document.addEventListener('DOMContentLoaded', () => {
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
function seleccionarServicio(tipo) {
    servicioSeleccionado = tipo;
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
    });

    // Animar el card seleccionado
    const cardSeleccionada = document.querySelector(`button[onclick="seleccionarServicio('${tipo}')"]`).closest('.card');
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
    if (!servicioSeleccionado) return;
    let total = precios[servicioSeleccionado];
    // Seleccionar los extras visibles del servicio seleccionado
    let extrasChecks = [];
    if (servicioSeleccionado === 'basico') {
        extrasChecks = [
            document.getElementById('extra-aroma-basico'),
            document.getElementById('extra-encerado-basico'),
            document.getElementById('extra-tapizado-basico'),
            document.getElementById('extra-opticas-basico')
        ];
    } else if (servicioSeleccionado === 'premium') {
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
    if (servicioSeleccionado === 'basico') {
        extrasChecks = [
            document.getElementById('extra-aroma-basico'),
            document.getElementById('extra-encerado-basico'),
            document.getElementById('extra-tapizado-basico'),
            document.getElementById('extra-opticas-basico')
        ];
    } else if (servicioSeleccionado === 'premium') {
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
    // Asegurarse de que la fecha se maneje en la zona horaria local
    const fechaStr = this.value + 'T00:00:00';
    const fecha = new Date(fechaStr);
    const ahora = new Date();

    console.log('DEBUG - Fecha seleccionada:', fecha.toLocaleDateString());
    console.log('DEBUG - Valor del input:', this.value);
    console.log('DEBUG - Día de la semana:', fecha.getDay());
    console.log('DEBUG - Hora actual:', ahora.toLocaleTimeString());

    // Validar que la fecha sea futura
    if (fecha < ahora) {
        console.log('DEBUG - Fecha rechazada: es pasada');
        mostrarError('Por favor, selecciona una fecha futura');
        this.value = '';
        return;
    }

    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const dia = fecha.getDay();

    // Validar que no sea domingo
    if (dia === 0) {
        console.log('DEBUG - Fecha rechazada: es domingo');
        mostrarError('Lo sentimos, no atendemos los domingos');
        this.value = '';
        return;
    }

    try {
        // Mostrar indicador de carga
        const horariosContainer = document.getElementById('horariosContainer');
        if (!horariosContainer) {
            console.error('DEBUG - No se encontró el contenedor de horarios');
            return;
        }

        horariosContainer.innerHTML = `
            <div class="text-center mb-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Buscando horarios disponibles...</p>
            </div>
        `;
        horariosContainer.style.display = 'block';

        // Formatear la fecha para la API
        const fechaFormateada = fecha.toISOString().split('T')[0];
        console.log('DEBUG - Fecha formateada para API:', fechaFormateada);        // Realizar la petición al backend
        const endpoint = `/bookings/available-slots?date=${fechaFormateada}`;
        const url = `${API_URL}${endpoint}`;
        console.log('DEBUG - Intentando obtener horarios de:', url);

        try {
            // Configuración especial para evitar bloqueos
            const fetchOptions = {
                method: 'GET',
                mode: 'cors',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            };
            
            // Intento con la URL completa
            let response;
            try {
                response = await fetch(url, fetchOptions);
            } catch (fetchError) {
                console.log('DEBUG - Primer intento fallido, probando alternativa:', fetchError);
                
                // Intento alternativo con una URL relativa
                try {
                    response = await fetch(endpoint, fetchOptions);
                } catch (relativeError) {
                    console.log('DEBUG - Intento relativo fallido, probando directamente el host:', relativeError);
                    
                    // Tercer intento con XMLHttpRequest
                    const data = await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.open('GET', url);
                        xhr.setRequestHeader('Accept', 'application/json');
                        xhr.responseType = 'json';
                        
                        xhr.onload = function() {
                            if (this.status >= 200 && this.status < 300) {
                                resolve(xhr.response);
                            } else {
                                reject(new Error(`Error del servidor: ${this.status}`));
                            }
                        };
                        
                        xhr.onerror = function() {
                            reject(new Error('Error de red o bloqueo de la solicitud'));
                        };
                        
                        xhr.send();
                    });
                    
                    console.log('DEBUG - Datos recibidos mediante XMLHttpRequest:', data);
                    return data;
                }
            }
            
            console.log('DEBUG - Status de la respuesta:', response.status);

            if (!response.ok) {
                let errorMsg = `Error del servidor (${response.status})`;
                try {
                    const errorText = await response.text();
                    errorMsg += `: ${errorText.substring(0, 100)}`;
                } catch (e) {
                    // No hacer nada si no se puede obtener el texto
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            console.log('DEBUG - Datos recibidos del servidor:', data);

            // Crear contenedor de horarios
            const horariosGrid = document.createElement('div');
            horariosGrid.className = 'horarios-container';

            if (data.data && data.data.length > 0) {
                console.log('DEBUG - Cantidad de slots disponibles:', data.data.length);

                // Obtener el horario del día
                const horarioDia = dia === 6 ? '8:30 a 12:30' : '8:30 a 17:00';

                horariosGrid.innerHTML = `
                    <div class="horarios-header">
                        <h4><i class="fas fa-clock"></i> Horarios Disponibles</h4>
                        <p class="text-muted">Selecciona el horario que prefieras</p>
                    </div>
                    <div class="horarios-info">
                        <p><i class="fas fa-info-circle"></i> Horario de atención para este día: ${horarioDia}</p>
                    </div>
                    <div class="horarios-grid">
                        ${data.data.map(slot => {
                            if (!slot || !slot.start || !slot.end) {
                                console.error('DEBUG - Slot inválido:', slot);
                                return '';
                            }
                            return `
                                <div class="horario-slot" onclick="seleccionarHorario('${slot.time}', this)">
                                    <div class="horario-tiempo">
                                        <span class="tiempo-inicio">${slot.start}</span>
                                        <span class="tiempo-separador"> - </span>
                                        <span class="tiempo-fin">${slot.end}</span>
                                    </div>
                                    <div class="horario-duracion">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                console.log('DEBUG - No hay slots disponibles para esta fecha');
                const horario = dia === 6 ? '8:30 a 12:30' : '8:30 a 17:00';

                horariosGrid.innerHTML = `
                    <div class="alert alert-info text-center p-4">
                        <i class="fas fa-info-circle fa-2x mb-3"></i>
                        <h5>No hay horarios disponibles</h5>
                        <p class="mb-2">Lo sentimos, no hay horarios disponibles para esta fecha.</p>
                        <p class="mb-0">Recuerda que nuestro horario de atención este día es de ${horario}.</p>
                    </div>
                `;
            }

            // Limpiar y actualizar contenedor
            horariosContainer.innerHTML = '';
            horariosContainer.appendChild(horariosGrid);        } catch (error) {
            console.error('DEBUG - Error al cargar horarios:', error);
            
            // Intentar obtener horarios predefinidos como respaldo
            try {
                // Horarios predefinidos como fallback
                const fallbackHorarios = {
                    data: [
                        { time: '08:30 - 10:00', start: '08:30', end: '10:00', isBooked: false, duration: 90 },
                        { time: '10:00 - 11:30', start: '10:00', end: '11:30', isBooked: false, duration: 90 },
                        { time: '11:30 - 13:00', start: '11:30', end: '13:00', isBooked: false, duration: 90 },
                        { time: '14:00 - 15:30', start: '14:00', end: '15:30', isBooked: false, duration: 90 },
                        { time: '15:30 - 17:00', start: '15:30', end: '17:00', isBooked: false, duration: 90 }
                    ]
                };
                
                if (dia === 6) { // Si es sábado, mostrar horarios de sábado
                    fallbackHorarios.data = fallbackHorarios.data.slice(0, 3); // Solo los 3 primeros horarios
                }
                
                console.log('DEBUG - Usando horarios predefinidos como fallback');
                
                // Crear contenedor de horarios con datos fallback
                const horariosGrid = document.createElement('div');
                horariosGrid.className = 'horarios-container';
                
                // Obtener el horario del día
                const horarioDia = dia === 6 ? '8:30 a 12:30' : '8:30 a 17:00';

                horariosGrid.innerHTML = `
                    <div class="horarios-header">
                        <h4><i class="fas fa-clock"></i> Horarios Disponibles (Modo Sin Conexión)</h4>
                        <p class="text-muted">No pudimos conectar con el servidor. Selecciona un horario tentativo:</p>
                    </div>
                    <div class="horarios-info">
                        <p><i class="fas fa-info-circle"></i> Horario de atención para este día: ${horarioDia}</p>
                        <div class="alert alert-warning">
                            <small>Nota: Estos horarios son orientativos. Por favor, confirma tu reserva por teléfono.</small>
                        </div>
                    </div>
                    <div class="horarios-grid">
                        ${fallbackHorarios.data.map(slot => {
                            return `
                                <div class="horario-slot" onclick="seleccionarHorario('${slot.time}', this)">
                                    <div class="horario-tiempo">
                                        <span class="tiempo-inicio">${slot.start}</span>
                                        <span class="tiempo-separador"> - </span>
                                        <span class="tiempo-fin">${slot.end}</span>
                                    </div>
                                    <div class="horario-duracion">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                
                // Limpiar y actualizar contenedor
                horariosContainer.innerHTML = '';
                horariosContainer.appendChild(horariosGrid);
                
            } catch (fallbackError) {
                // Si todo falla, mostrar mensaje de error
                console.error('DEBUG - Error al usar horarios fallback:', fallbackError);
                horariosContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        Error al cargar los horarios: ${error.message}
                        <hr>
                        <p class="mb-0">Sugerencia: Si estás usando un bloqueador de anuncios, desactívalo para este sitio o llama al 098 385 709 para reservar por teléfono.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('DEBUG - Error general al procesar la fecha:', error);
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
function seleccionarHorario(hora, elemento) {
    // Remover selección previa
    document.querySelectorAll('.horario-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Seleccionar nuevo horario
    elemento.classList.add('selected');
    horarioSeleccionado = hora;

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

    if (!servicioSeleccionado) {
        mostrarError('Por favor, selecciona un servicio antes de continuar');
        return;
    }

    if (!horarioSeleccionado) {
        mostrarError('Por favor, selecciona un horario');
        return;
    }

    const fecha = document.getElementById('fecha').value;
    console.log('DEBUG - Submit - Fecha seleccionada:', fecha);
    console.log('DEBUG - Submit - Horario seleccionado:', horarioSeleccionado);

    // Crear objeto Date para validación
    const [horaInicio] = horarioSeleccionado.split(' - ');
    const fechaHora = new Date(`${fecha}T${horaInicio}`);
    console.log('DEBUG - Submit - Fecha y hora combinadas:', fechaHora.toISOString());
    console.log('DEBUG - Submit - Fecha y hora local:', fechaHora.toLocaleString());
    console.log('DEBUG - Submit - Día de la semana:', fechaHora.getDay());

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
    if (servicioSeleccionado === 'basico') {
        if (document.getElementById('extra-aroma-basico')?.checked) extrasSeleccionados.push('Aromatización');
        if (document.getElementById('extra-encerado-basico')?.checked) extrasSeleccionados.push('Encerado');
        if (document.getElementById('extra-tapizado-basico')?.checked) extrasSeleccionados.push('Limpieza de tapizados');
        if (document.getElementById('extra-opticas-basico')?.checked) extrasSeleccionados.push('Pulido de ópticas');
    } else if (servicioSeleccionado === 'premium') {
        if (document.getElementById('extra-tapizado-premium')?.checked) extrasSeleccionados.push('Limpieza de tapizados');
        if (document.getElementById('extra-opticas-premium')?.checked) extrasSeleccionados.push('Pulido de ópticas');
    }

    // Calcular el precio total con extras seleccionados
    let total = precios[servicioSeleccionado];
    let extrasChecks = [];
    if (servicioSeleccionado === 'basico') {
        extrasChecks = [
            document.getElementById('extra-aroma-basico'),
            document.getElementById('extra-encerado-basico'),
            document.getElementById('extra-tapizado-basico'),
            document.getElementById('extra-opticas-basico')
        ];
    } else if (servicioSeleccionado === 'premium') {
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

    const formData = {
        clientName: document.getElementById('nombre').value,
        date: `${fecha}T${horaInicio}`,
        vehicleType: document.getElementById('vehiculo').value,
        vehiclePlate: document.getElementById('patente').value,
        serviceType: servicioSeleccionado,
        price: total,
        extras: extrasSeleccionados
    };

    // Validación de campos
    if (!validarFormulario(formData)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al crear la reserva');
        }

        // Mostrar confirmación
        mostrarReservaConfirmada(data.data);

    } catch (error) {
        console.error('Error al enviar la reserva:', error);
        mostrarError('No se pudo procesar la reserva: ' + error.message);
    }
});

// Validar los campos del formulario
function validarFormulario(formData) {
    if (!formData.clientName || formData.clientName.trim().length < 3) {
        mostrarError('Por favor, ingresa un nombre válido');
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
                            
                            <div class="border-top pt-4 mt-4">
                                <p class="text-center mb-4">
                                    <i class="fas fa-info-circle me-2 text-info"></i>
                                    Se ha enviado un correo con los detalles de tu reserva.
                                </p>
                            </div>
                            <hr>
                            <div class="text-center pt-2">
                                <button class="btn btn-primary" id="nuevaReservaBtn">
                                    <i class="fas fa-calendar-plus me-2"></i>Hacer otra reserva
                                </button>
                                
                                <button class="btn btn-outline-secondary ms-2" id="imprimirReservaBtn">
                                    <i class="fas fa-print me-2"></i>Imprimir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Añadir listeners a los botones
    document.getElementById('nuevaReservaBtn').addEventListener('click', () => {
        // Recuperar el contenido original
        container.innerHTML = container.dataset.originalContent;
        // Resetear variables globales
        servicioSeleccionado = null;
        horarioSeleccionado = null;
        // Limpiar campos
        const form = document.getElementById('reservaForm');
        if (form) form.reset();
    });
    
    document.getElementById('imprimirReservaBtn').addEventListener('click', () => {
        imprimirReserva(reserva);
    });
}

// Función para imprimir la reserva
function imprimirReserva(reserva) {
    // Implementar la generación de impresión
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
    
    // Crear un elemento para la impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reserva #${reserva.id} - Extreme Wash</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #ddd;
                    padding-bottom: 20px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                }
                .highlight {
                    color: #0d6efd;
                }
                h1 {
                    font-size: 24px;
                    margin: 15px 0;
                }
                .detail-row {
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                .detail-label {
                    font-weight: bold;
                    display: inline-block;
                    width: 150px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
                .footer p {
                    margin: 5px 0;
                }
                .qr {
                    text-align: center;
                    margin: 30px 0;
                }
                .qr-code {
                    border: 1px solid #ddd;
                    padding: 10px;
                    display: inline-block;
                }
                .terms {
                    font-size: 11px;
                    margin-top: 40px;
                }
                .extras {
                    margin-left: 155px;
                    margin-top: 5px;
                }
                .extras ul {
                    margin-top: 5px;
                    margin-bottom: 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">
                    <span class="highlight">EXTREME</span> WASH
                </div>
                <p>Dr. Cipriano Goñi 59, Durazno</p>
            </div>
            
            <h1>Comprobante de Reserva #${reserva.id}</h1>
            
            <div class="detail-row">
                <span class="detail-label">Cliente:</span> ${reserva.clientName}
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Fecha y hora:</span> ${fechaFormateada}
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Servicio:</span> ${serviciosNombres[reserva.serviceType] || reserva.serviceType}
                ${reserva.extras && reserva.extras.length > 0 ? 
                `<div class="extras">
                    <small>Extras:</small>
                    <ul>
                        ${reserva.extras.map(extra => `<li>${extra}</li>`).join('')}
                    </ul>
                </div>` : ''}
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Vehículo:</span> ${vehiculosNombres[reserva.vehicleType] || reserva.vehicleType} (Patente: ${reserva.vehiclePlate})
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Precio total:</span> $${reserva.price}
            </div>
            
            <div class="qr">
                <div class="qr-code">
                    [Código QR: ${reserva.id}]
                </div>
                <p>Presenta este código en tu visita</p>
            </div>
            
            <div class="terms">
                <p><strong>Términos y condiciones:</strong></p>
                <p>Si necesitas cancelar o reprogramar tu reserva, por favor hazlo con al menos 2 horas de anticipación llamando al 098 385 709.</p>
                <p>Se aplica un tiempo de gracia de 15 minutos. Después de este tiempo, podríamos no ser capaces de garantizar el servicio.</p>
            </div>
            
            <div class="footer">
                <p>Extreme Wash - Tu auto merece brillar como nuevo</p>
                <p>Tel: 098 385 709 - Dr Cipriano Goñi 59</p>
                <p>Reserva generada el ${new Date().toLocaleString()}</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
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
function cancelarReserva() {
    // Simplemente recarga la página si no hay más lógica
    location.reload();
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

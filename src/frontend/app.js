// Variables globales
let servicioSeleccionado = null;
let horarioSeleccionado = null;
const precios = {
    basico: 600,
    premium: 900,
    detailing: 2500
};

// Configuración de la API
const API_URL = '/api';

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

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.padding = '0.5rem 1rem';
            navbar.style.background = 'rgba(13, 110, 253, 0.98) !important';
        } else {
            navbar.style.padding = '1rem';
            navbar.style.background = 'rgba(13, 110, 253, 0.95) !important';
        }
    });

    // Smooth scroll para los enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
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
    actualizarPrecio(tipo);
}

// Función para actualizar el precio
function actualizarPrecio(tipo) {
    const precio = precios[tipo];
    const formTitle = document.querySelector('#reservar h2');
    formTitle.innerHTML = `Reservar Turno - $${precio}`;
    formTitle.style.animation = 'fadeInUp 0.5s ease-out';
}

// Validación de fecha y obtención de horarios disponibles
document.getElementById('fecha').addEventListener('change', async function () {
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
        console.log('DEBUG - Fecha formateada para API:', fechaFormateada);

        // Realizar la petición al backend
        const url = `${API_URL}/bookings/available-slots?date=${fechaFormateada}`;
        console.log('DEBUG - Intentando obtener horarios de:', url);

        const response = await fetch(url);
        console.log('DEBUG - Status de la respuesta:', response.status);

        const data = await response.json();
        console.log('DEBUG - Datos recibidos del servidor:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Error del servidor');
        }

        // Verificar si hay horarios disponibles
        if (!Array.isArray(data.data)) {
            console.error('DEBUG - Los datos recibidos no son un array:', data);
            throw new Error('Formato de datos inválido');
        }

        // Crear contenedor de horarios
        const horariosGrid = document.createElement('div');
        horariosGrid.className = 'horarios-container';

        if (data.data.length > 0) {
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
        horariosContainer.appendChild(horariosGrid);

    } catch (error) {
        console.error('DEBUG - Error al cargar horarios:', error);
        const horariosContainer = document.getElementById('horariosContainer');
        horariosContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                Error al cargar los horarios: ${error.message}
            </div>
        `;
    }
});

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
document.getElementById('reservaForm').addEventListener('submit', async (e) => {
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

    const formData = {
        clientName: document.getElementById('nombre').value,
                date: `${fecha}T${horaInicio}`,
        vehicleType: document.getElementById('vehiculo').value,
        vehiclePlate: document.getElementById('patente').value,
        serviceType: servicioSeleccionado,
        price: precios[servicioSeleccionado]
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

        // Mostrar modal de confirmación con los detalles
        mostrarConfirmacion({
            nombre: formData.clientName,
            fecha: fecha,
            hora: horaInicio,
            vehiculo: formData.vehicleType,
            patente: formData.vehiclePlate,
            servicio: formData.serviceType,
            precio: formData.price
        });

        // Limpiar formulario
        document.getElementById('reservaForm').reset();
        document.getElementById('horariosContainer').style.display = 'none';
        servicioSeleccionado = null;
        horarioSeleccionado = null;

        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        mostrarError(error.message);
    }
});

// Función de validación del formulario
function validarFormulario(data) {
    if (!data.clientName || data.clientName.length < 3) {
        mostrarError('El nombre debe tener al menos 3 caracteres');
        return false;
    }

    if (!data.vehicleType) {
        mostrarError('Selecciona un tipo de vehículo');
        return false;
    }

    if (!data.vehiclePlate) {
        mostrarError('Ingresa la patente del vehículo');
        return false;
    }

    return true;
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const form = document.getElementById('reservaForm');
    form.insertBefore(alertDiv, form.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Función para mostrar mensajes de éxito
function mostrarExito(mensaje) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show animate__animated animate__fadeIn';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const form = document.getElementById('reservaForm');
    form.insertBefore(alertDiv, form.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Función para descargar el modal como imagen
async function descargarConfirmacion() {
    console.log('Descargar confirmación clickeado');
    try {
        // Extraer los datos de la reserva del modal visible
        const modalContent = document.querySelector('.modal-content');
        const nombre = modalContent.querySelector('h4.text-center').textContent.replace('¡Gracias ', '').replace(' por tu reserva!', '').trim();
        const servicio = modalContent.querySelector('.badge.bg-primary').textContent.trim();
        const fecha = modalContent.querySelectorAll('.list-group-item')[1].querySelector('span:last-child').textContent.trim();
        const hora = modalContent.querySelectorAll('.list-group-item')[2].querySelector('span:last-child').textContent.trim();
        const vehiculo = modalContent.querySelectorAll('.list-group-item')[3].querySelector('span:last-child').textContent.trim();
        const patente = modalContent.querySelectorAll('.list-group-item')[4].querySelector('span:last-child').textContent.trim();
        const precio = modalContent.querySelectorAll('.list-group-item')[5].querySelector('span:last-child').textContent.trim();

        // Crear PDF prolijo y en una sola página
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        let y = 25;
        // Header verde
        doc.setFillColor(25, 135, 84);
        doc.roundedRect(20, y, 170, 18, 6, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255,255,255);
        doc.setFontSize(16);
        doc.text('✅ Reserva Confirmada', 105, y + 12, { align: 'center' });
        y += 28;
        // Subtítulo
        doc.setFontSize(13);
        doc.setTextColor(33,37,41);
        doc.setFont('helvetica', 'normal');
        doc.text(`¡Gracias ${nombre} por tu reserva!`, 105, y, { align: 'center' });
        y += 12;
        // Recuadro detalles
        doc.setFillColor(248,249,250);
        doc.roundedRect(30, y, 150, 60, 6, 6, 'F');
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalles de tu reserva:', 35, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(13,110,253);
        doc.text(`🚗 Servicio:`, 35, y);
        doc.setTextColor(33,37,41);
        doc.text(servicio, 80, y);
        y += 7;
        doc.setTextColor(13,110,253);
        doc.text(`📅 Fecha:`, 35, y);
        doc.setTextColor(33,37,41);
        doc.text(fecha, 80, y);
        y += 7;
        doc.setTextColor(13,110,253);
        doc.text(`⏰ Hora:`, 35, y);
        doc.setTextColor(33,37,41);
        doc.text(hora, 80, y);
        y += 7;
        doc.setTextColor(13,110,253);
        doc.text(`🚙 Vehículo:`, 35, y);
        doc.setTextColor(33,37,41);
        doc.text(vehiculo, 80, y);
        y += 7;
        doc.setTextColor(13,110,253);
        doc.text(`🔢 Patente:`, 35, y);
        doc.setTextColor(33,37,41);
        doc.text(patente, 80, y);
        y += 7;
        doc.setTextColor(13,110,253);
        doc.text(`💲 Precio:`, 35, y);
        doc.setTextColor(33,37,41);
        doc.text(precio, 80, y);
        y += 18;
        doc.setFontSize(10);
        doc.setTextColor(80,80,80);
        doc.text('Presenta esta confirmación el día de tu turno.', 105, y, { align: 'center' });
        doc.save('confirmacion-reserva.pdf');
    } catch (error) {
        console.error('Error al descargar el PDF:', error);
        mostrarError('No se pudo descargar el PDF. Por favor, intente nuevamente.');
    }
}

// Función para mostrar confirmación mejorada
function mostrarConfirmacion(datos) {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-check-circle me-2"></i>
                        ¡Reserva Confirmada!
                    </h5>
                    <button type="button" class="btn-close btn-close-white" onclick="this.closest('.modal').remove()"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <i class="fas fa-calendar-check text-success" style="font-size: 48px;"></i>
                    </div>
                    <h4 class="text-center mb-4">¡Gracias ${datos.nombre} por tu reserva!</h4>
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Detalles de tu reserva:</h5>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span><i class="fas fa-car"></i> Servicio</span>
                                    <span class="badge bg-primary rounded-pill text-capitalize">${datos.servicio}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span><i class="fas fa-calendar"></i> Fecha</span>
                                    <span>${new Date(datos.fecha).toLocaleDateString('es-UY')}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span><i class="fas fa-clock"></i> Hora</span>
                                    <span>${datos.hora}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span><i class="fas fa-car-side"></i> Vehículo</span>
                                    <span class="text-capitalize">${datos.vehiculo}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span><i class="fas fa-hashtag"></i> Patente</span>
                                    <span class="text-uppercase">${datos.patente}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span><i class="fas fa-tag"></i> Precio</span>
                                    <span class="badge bg-success rounded-pill">${datos.precio}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="alert alert-info mt-4">
                        <i class="fas fa-info-circle"></i>
                        Te recomendamos descargar esta confirmación para presentarla el día de tu turno.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" onclick="descargarConfirmacion()">
                        <i class="fas fa-download me-2"></i>Descargar confirmación
                    </button>
                    <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-check me-2"></i>Entendido
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    // Asignar el event listener al botón de descarga
    const btnDescargar = modal.querySelector('.btn-success');
    if (btnDescargar) {
        btnDescargar.addEventListener('click', descargarConfirmacion);
    }
}

// Función para manejar la selección del método de pago
function seleccionarMetodoPago(metodo, monto) {
    // Remover selección previa
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Seleccionar la opción actual
    const opcionSeleccionada = document.querySelector(`.payment-option[onclick*="${metodo}"]`);
    if (opcionSeleccionada) {
        opcionSeleccionada.classList.add('selected');
    }

    // Manejar cada método de pago
    switch (metodo) {
        case 'credito':
            procesarPagoTarjeta('credito', monto);
            break;
        case 'debito':
            procesarPagoTarjeta('debito', monto);
            break;
        case 'efectivo':
            procesarPagoEfectivo(monto);
            break;
    }
}

// Función para procesar pagos con tarjeta
function procesarPagoTarjeta(tipo, monto) {
    const tipoTarjeta = tipo === 'credito' ? 'crédito' : 'débito';

    // Aquí se integraría con un gateway de pago real
    // Por ahora, mostraremos un mensaje informativo
    const mensaje = `
        <div class="alert alert-info mt-3">
            <h6><i class="fas fa-info-circle"></i> Pago con tarjeta de ${tipoTarjeta}</h6>
            <p class="mb-0">Monto a pagar: $${monto}</p>
            <small>En este momento serías redirigido al gateway de pago seguro para completar la transacción.</small>
        </div>
    `;

    mostrarMensajePago(mensaje);
}

// Función para procesar pagos en efectivo
function procesarPagoEfectivo(monto) {
    const mensaje = `
        <div class="alert alert-success mt-3">
            <h6><i class="fas fa-check-circle"></i> Pago en efectivo</h6>
            <p class="mb-0">Monto a pagar en el local: $${monto}</p>
            <small>Por favor, presenta este comprobante al momento de realizar el pago.</small>
        </div>
    `;

    mostrarMensajePago(mensaje);
}

// Función para mostrar mensajes de pago
function mostrarMensajePago(mensaje) {
    // Remover mensaje anterior si existe
    const mensajeAnterior = document.querySelector('.payment-message');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    // Agregar nuevo mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.className = 'payment-message';
    mensajeElement.innerHTML = mensaje;

    const paymentSection = document.querySelector('.payment-section');
    paymentSection.appendChild(mensajeElement);
}

// Función para validar horarios de atención
function validarHorario(fecha) {
    const date = new Date(fecha);
    const dia = date.getDay(); // 0 es domingo, 1 es lunes, etc.

    console.log('DEBUG - validarHorario - Fecha:', date.toLocaleString());
    console.log('DEBUG - validarHorario - Día:', dia);

    // Domingo (0) - Cerrado
    if (dia === 0) {
        mostrarError('Lo sentimos, no atendemos los domingos');
        return false;
    }

    // Validar horario según el día
    if (dia >= 1 && dia <= 5) { // Lunes a Viernes
        if (!horarioSeleccionado) {
            mostrarError('Por favor, selecciona un horario');
            return false;
        }

        const [horaInicio] = horarioSeleccionado.split(' - ');
        const [hora, minutos] = horaInicio.split(':').map(Number);
        const tiempoEnMinutos = hora * 60 + minutos;

        const apertura = 8 * 60 + 30; // 8:30
        const cierre = 17 * 60;  // 17:00
        const almuerzoInicio = 13 * 60; // 13:00
        const almuerzoFin = 14 * 60; // 14:00

        console.log('DEBUG - validarHorario - Hora inicio:', horaInicio);
        console.log('DEBUG - validarHorario - Tiempo en minutos:', tiempoEnMinutos);
        console.log('DEBUG - validarHorario - Apertura:', apertura);
        console.log('DEBUG - validarHorario - Cierre:', cierre);

        if (tiempoEnMinutos < apertura || tiempoEnMinutos > cierre) {
            mostrarError('De lunes a viernes atendemos de 8:30 a 17:00');
            return false;
        }

        if (tiempoEnMinutos >= almuerzoInicio && tiempoEnMinutos < almuerzoFin) {
            mostrarError('Horario de almuerzo: 13:00 a 14:00');
            return false;
        }

        return true;
    }

    // Sábados
    if (dia === 6) {
        if (!horarioSeleccionado) {
            mostrarError('Por favor, selecciona un horario');
            return false;
        }

        const [horaInicio] = horarioSeleccionado.split(' - ');
        const [hora, minutos] = horaInicio.split(':').map(Number);
        const tiempoEnMinutos = hora * 60 + minutos;

        const apertura = 8 * 60 + 30; // 8:30
        const cierre = 12 * 60 + 30;  // 12:30

        if (tiempoEnMinutos < apertura || tiempoEnMinutos > cierre) {
            mostrarError('Los sábados atendemos de 8:30 a 12:30');
            return false;
        }

        return true;
    }

    return true;
}

// Agregar estilos para los horarios
const styles = document.createElement('style');
styles.textContent = `
    .horarios-container {
        background: white;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin-top: 20px;
    }
    .horarios-header {
        text-align: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f8f9fa;
    }
    .horarios-header h4 {
        color: #2c3e50;
        margin-bottom: 10px;
    }
    .horarios-info {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 20px;
    }
    .horarios-info p {
        margin: 0;
        color: #6c757d;
    }
    .horarios-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
        padding: 10px;
    }
    .horario-slot {
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
    }
    .horario-slot:hover {
        border-color: #0d6efd;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .horario-slot.selected {
        background: #0d6efd;
        border-color: #0d6efd;
        color: white;
    }
    .horario-tiempo {
        font-size: 1.2em;
        font-weight: 600;
        margin-bottom: 8px;
        color: #2c3e50;
    }
    .horario-slot.selected .horario-tiempo {
        color: white;
    }
    .tiempo-inicio, .tiempo-fin {
        display: inline-block;
        font-weight: 600;
    }
    .tiempo-separador {
        color: #6c757d;
        margin: 0 3px;
    }
    .horario-slot.selected .tiempo-separador {
        color: rgba(255,255,255,0.8);
    }
    .horario-duracion {
        font-size: 0.9em;
        color: #6c757d;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    .horario-slot.selected .horario-duracion {
        color: rgba(255,255,255,0.9);
    }
    .horario-duracion i {
        font-size: 0.9em;
    }
`;
document.head.appendChild(styles);
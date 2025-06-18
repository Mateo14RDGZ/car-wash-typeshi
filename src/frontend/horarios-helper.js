/**
 * SISTEMA DE HORARIOS SUPER ROBUSTO
 * Este archivo centraliza toda la lógica de carga y procesamiento de horarios
 * asegurando que siempre se muestren correctamente en la interfaz.
 */

// Variable global para indicar si estamos en modo de emergencia
// Comprobamos que el objeto window esté disponible (para compatibilidad con Vercel)
if (typeof window !== 'undefined') {
    window.horariosEmergencia = false;
}

// Esta función es el punto de entrada principal para cargar horarios
async function cargarHorariosDisponibles(fecha) {
    console.log('🕒 Cargando horarios para fecha:', fecha);
    
    try {
        // Construir el endpoint
        const endpoint = `/bookings/available-slots?date=${fecha}`;
        console.log('📡 Endpoint solicitado:', endpoint);
        
        // Mostrar estado de carga
        mostrarCargandoHorarios();
        
        // Intentar la petición normal
        try {
            // Hacer la petición usando el apiRequest centralizado
            const data = await (typeof window !== 'undefined' && window.apiRequest ? window.apiRequest(endpoint) : { error: 'API request no disponible' });
            console.log('✅ Datos de horarios recibidos:', data);
            
            if (data && data.data && Array.isArray(data.data)) {
                procesarHorariosDisponibles(data.data, false);
                return true;
            } else {
                console.warn('⚠️ Formato de datos incorrecto:', data);
                mostrarErrorFormatoIncorrecto();
                return false;
            }
        } catch (error) {
            console.error('❌ Error en petición principal:', error);
            return await cargarFallbackHorarios(fecha);
        }
    } catch (error) {
        console.error('❌ Error general en carga de horarios:', error);
        mostrarErrorConexion();
        return false;
    }
}

// Esta función intenta cargar los horarios desde el archivo de respaldo
async function cargarFallbackHorarios(fecha) {
    console.log('🛟 Cargando horarios de respaldo');
    
    try {
        // Intentar cargar el archivo local
        const response = await fetch('slots-fallback.json?' + Date.now());
        
        if (!response.ok) {
            throw new Error('No se pudo cargar el fallback');
        }
        
        const fallbackData = await response.json();
        console.log('✅ Horarios de fallback cargados:', fallbackData);
        
        // Marcar que estamos en modo de emergencia
        if (typeof window !== 'undefined') {
            window.horariosEmergencia = true;
        }
        
        // Procesar los horarios
        if (fallbackData && fallbackData.data && Array.isArray(fallbackData.data)) {
            procesarHorariosDisponibles(fallbackData.data, true);
            return true;
        } else {
            mostrarErrorConexion();
            return false;
        }
    } catch (fallbackError) {
        console.error('❌ Error cargando fallback:', fallbackError);
        mostrarErrorConexion();
        return false;
    }
}

// Esta función procesa los horarios disponibles y actualiza la UI
function procesarHorariosDisponibles(horarios, esModoEmergencia) {
    console.log('📋 Procesando ' + horarios.length + ' horarios');
    
    // Crear un mapa de los slots disponibles para búsqueda rápida
    const availableSlotsMap = {};
    if (horarios.length > 0) {
        horarios.forEach(slot => {
            if (slot && slot.start && slot.end) {
                const time = slot.time || `${slot.start} - ${slot.end}`;
                availableSlotsMap[time] = slot;
            }
        });
    }
    
    // Actualizar el estado de los slots en el DOM (disponible/no disponible)
    const slotElements = document.querySelectorAll('.horario-slot');
    slotElements.forEach(element => {
        const time = element.getAttribute('data-time');
        
        // Quitar clase de carga
        element.classList.remove('horario-loading');
        
        // Si está en el mapa, está disponible
        if (availableSlotsMap[time]) {
            // Configurar para selección
            element.onclick = function() {
                seleccionarHorario(time, this);
            };
            
            // Actualizar contenido
            const durationDiv = element.querySelector('.horario-duracion');
            durationDiv.innerHTML = '<i class="fas fa-clock"></i>';
        } else {
            // Marcar como no disponible
            element.classList.add('horario-no-disponible');
            const durationDiv = element.querySelector('.horario-duracion');
            durationDiv.innerHTML = '<i class="fas fa-times"></i>';
        }
    });
    
    // Actualizar mensaje de carga
    const infoText = document.getElementById('carga-info');
    if (infoText) {
        if (Object.keys(availableSlotsMap).length === 0) {
            infoText.innerHTML = '<span class="badge bg-info text-dark"><i class="fas fa-info-circle me-1"></i> No hay horarios disponibles para esta fecha</span>';
        } else if (esModoEmergencia) {
            infoText.innerHTML = '<span class="badge bg-warning text-dark"><i class="fas fa-exclamation-triangle me-1"></i> Modo de respaldo - Horarios generados localmente</span>';
        } else {
            infoText.innerHTML = '<span class="badge bg-success text-white"><i class="fas fa-check-circle me-1"></i> Horarios actualizados</span>';
            // Ocultar después de 3 segundos
            setTimeout(() => {
                if (infoText) infoText.style.display = 'none';
            }, 3000);
        }
    }
}

// Mostrar estado de carga
function mostrarCargandoHorarios() {
    document.querySelectorAll('.horario-slot').forEach(element => {
        element.classList.add('horario-loading');
        element.onclick = null; // Eliminar evento click
        
        // Mostrar spinner
        const durationDiv = element.querySelector('.horario-duracion');
        durationDiv.innerHTML = `
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        `;
    });
    
    // Actualizar mensaje de carga
    const infoText = document.getElementById('carga-info');
    if (infoText) {
        infoText.style.display = 'block';
        infoText.innerHTML = '<span class="badge bg-primary"><i class="fas fa-sync-alt fa-spin me-1"></i> Cargando horarios disponibles...</span>';
    }
}

// Mostrar error de formato incorrecto
function mostrarErrorFormatoIncorrecto() {
    document.querySelectorAll('.horario-slot').forEach(element => {
        // Quitar clase de carga
        element.classList.remove('horario-loading');
        element.classList.add('horario-no-disponible');
        element.onclick = null; // Eliminar evento click
        
        // Actualizar contenido
        const durationDiv = element.querySelector('.horario-duracion');
        durationDiv.innerHTML = '<i class="fas fa-times"></i>';
    });
    
    // Actualizar mensaje de carga
    const infoText = document.getElementById('carga-info');
    if (infoText) {
        infoText.innerHTML = '<span class="badge bg-warning text-dark"><i class="fas fa-exclamation-triangle me-1"></i> Formato de datos incorrecto</span>';
    }
}

// Mostrar error de conexión
function mostrarErrorConexion() {
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
    
    // Mostrar notificación de error detallada usando la función global mostrarError    if (typeof window !== 'undefined' && window.mostrarError) {
        window.mostrarError(`
            <strong>Error de conexión</strong><br>
            <small>
                No se pudieron cargar los horarios disponibles. Esta aplicación requiere conexión a internet para funcionar correctamente.
                <br><br>
                Por favor, verifica tu conexión e intenta nuevamente. Si el problema persiste, comunícate con nosotros al 098 385 709.
            </small>
        `);
    }
}

// Exportar las funciones para que sean accesibles desde fuera
// Exportar las funciones para que sean accesibles desde fuera
if (typeof window !== 'undefined') {
    window.cargarHorariosDisponibles = cargarHorariosDisponibles;
    window.procesarHorariosDisponibles = procesarHorariosDisponibles;
}

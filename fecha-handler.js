/**
 * SOLUCIÓN DEFINITIVA PARA EL PROBLEMA DE HORARIOS
 * 
 * Este archivo reemplaza el comportamiento del cambio de fecha en el calendario
 * y garantiza que siempre se carguen los horarios correctamente.
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    const fechaInput = document.getElementById('fecha');
    if (!fechaInput) return;
    
    console.log('📅 Inicializando sistema de selección de fechas mejorado');
    
    // Eliminar eventos existentes para evitar duplicados
    const nuevoFechaInput = fechaInput.cloneNode(true);
    fechaInput.parentNode.replaceChild(nuevoFechaInput, fechaInput);
    
    // Agregar nuevo evento mejorado
    nuevoFechaInput.addEventListener('change', async function() {
        try {
            const fechaSeleccionada = this.value;
            if (!fechaSeleccionada) return;
            
            console.log('📆 Fecha seleccionada:', fechaSeleccionada);
            
            // Validar la fecha seleccionada
            const fechaHoy = new Date();
            fechaHoy.setHours(0, 0, 0, 0);
            
            const fechaElegida = new Date(fechaSeleccionada);
            fechaElegida.setHours(0, 0, 0, 0);
            
            // No permitir fechas pasadas
            if (fechaElegida < fechaHoy) {
                console.error('❌ Fecha en el pasado');
                if (window.mostrarError) {
                    window.mostrarError('Por favor, selecciona una fecha futura');
                }
                return;
            }
            
            // Detectar domingo (no atendemos)
            const diaSemana = fechaElegida.getDay(); // 0 = domingo, 6 = sábado
            if (diaSemana === 0) {
                console.error('❌ Fecha es domingo - cerrado');
                if (window.mostrarError) {
                    window.mostrarError('Lo sentimos, no atendemos los domingos');
                }
                return;
            }
            
            // Todo OK con la fecha, mostrar UI de horarios
            mostrarContenedorHorarios(fechaSeleccionada);
            
            // Cargar horarios usando el sistema centralizado
            if (window.cargarHorariosDisponibles) {
                await window.cargarHorariosDisponibles(fechaSeleccionada);
            } else {
                console.error('❌ El sistema de horarios no está disponible');
                if (window.mostrarError) {
                    window.mostrarError('Error al cargar el sistema de horarios. Por favor, recarga la página.');
                }
            }
        } catch (error) {
            console.error('❌ Error general en cambio de fecha:', error);
            if (window.mostrarError) {
                window.mostrarError('Ocurrió un error al procesar la fecha seleccionada');
            }
        }
    });
    
    console.log('✅ Sistema de selección de fechas mejorado inicializado');
});

// Función para mostrar el contenedor de horarios
function mostrarContenedorHorarios(fecha) {
    // Actualizar el título con la fecha formateada
    const fechaFormateada = formatearFecha(fecha);
    const horariosTitle = document.getElementById('horarios-title');
    if (horariosTitle) {
        horariosTitle.textContent = 'Horarios disponibles para el ' + fechaFormateada;
    }

    // Configuración para mostrar los horarios
    const horariosContainer = document.getElementById('horarios-container');
    if (!horariosContainer) return;

    // Crear slots de horarios
    horariosContainer.innerHTML = `
        <div class="mb-3" id="carga-info">
            <span class="badge bg-primary">
                <i class="fas fa-sync-alt fa-spin me-1"></i> Cargando horarios disponibles...
            </span>
        </div>
        <div class="row" id="horarios-slots-container">
            <div class="col-md-4 mb-3">
                <div class="horario-slot horario-loading" data-time="08:30 - 10:00">
                    <div class="horario-tiempo">
                        <span class="tiempo-inicio">08:30</span>
                        <span class="tiempo-separador">-</span>
                        <span class="tiempo-fin">10:00</span>
                    </div>
                    <div class="horario-duracion">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="horario-slot horario-loading" data-time="10:00 - 11:30">
                    <div class="horario-tiempo">
                        <span class="tiempo-inicio">10:00</span>
                        <span class="tiempo-separador">-</span>
                        <span class="tiempo-fin">11:30</span>
                    </div>
                    <div class="horario-duracion">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="horario-slot horario-loading" data-time="11:30 - 13:00">
                    <div class="horario-tiempo">
                        <span class="tiempo-inicio">11:30</span>
                        <span class="tiempo-separador">-</span>
                        <span class="tiempo-fin">13:00</span>
                    </div>
                    <div class="horario-duracion">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="horario-slot horario-loading" data-time="14:00 - 15:30">
                    <div class="horario-tiempo">
                        <span class="tiempo-inicio">14:00</span>
                        <span class="tiempo-separador">-</span>
                        <span class="tiempo-fin">15:30</span>
                    </div>
                    <div class="horario-duracion">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="horario-slot horario-loading" data-time="15:30 - 17:00">
                    <div class="horario-tiempo">
                        <span class="tiempo-inicio">15:30</span>
                        <span class="tiempo-separador">-</span>
                        <span class="tiempo-fin">17:00</span>
                    </div>
                    <div class="horario-duracion">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    horariosContainer.style.display = 'block';
}

// Formatea una fecha YYYY-MM-DD a formato localizado
function formatearFecha(fechaStr) {
    try {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-UY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        console.error('Error formateando fecha:', e);
        return fechaStr;
    }
}

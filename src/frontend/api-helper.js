/**
 * 🔧 API Helper - Funciones para comunicación con la API
 * Versión simplificada para conexión directa con MySQL
 */

// Función principal para peticiones a la API
async function apiRequest(endpoint, options = {}) {
    const callId = Math.random().toString(36).substring(2, 8);
    
    console.log(`🔹[${callId}] PETICIÓN A BASE DE DATOS MYSQL`);
    console.log(`🔹[${callId}] Endpoint: ${endpoint}`);
    
    // Verificar que no sea una URL absoluta
    if (endpoint.startsWith('http')) {
        console.error(`❌[${callId}] ERROR: No se permiten URLs absolutas`);
        throw new Error('URL absoluta no permitida');
    }
    
    // Construir URL para la API
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2);
    const url = `/api${endpoint}${endpoint.includes('?') ? '&' : '?'}_=${uniqueId}`;
    console.log(`✅[${callId}] URL: ${url}`);
    
    // Configurar opciones de la petición
    const fetchOptions = {
        method: options.method || 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Request-ID': callId,
            'Pragma': 'no-cache',
            ...(options.headers || {})
        }
    };
    
    // Agregar body si es necesario
    if (options.body) {
        console.log(`📦[${callId}] Body:`, options.body);
        
        if (typeof options.body === 'string') {
            fetchOptions.body = options.body;
        } else if (typeof options.body === 'object') {
            fetchOptions.body = JSON.stringify(options.body);
        }
    }
    
    // Realizar petición con timeout
    try {
        console.log(`🚀[${callId}] Consultando base de datos MySQL...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.error(`⏰[${callId}] TIMEOUT: Base de datos no responde`);
            controller.abort();
        }, 10000); // 10 segundos timeout
        
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`📊[${callId}] Respuesta MySQL - Status: ${response.status}`);
        
        if (response.ok) {
            try {
                const data = await response.json();
                console.log(`✅[${callId}] Datos obtenidos de MySQL:`, data);
                return data;
            } catch (parseError) {
                console.error(`❌[${callId}] Error al parsear respuesta de MySQL:`, parseError);
                throw new Error('Respuesta inválida de la base de datos');
            }
        } else {
            console.error(`❌[${callId}] Error de base de datos MySQL: ${response.status}`);
            
            // Intentar obtener detalles del error
            try {
                const errorData = await response.json();
                console.error(`📋[${callId}] Detalles del error MySQL:`, errorData);
                throw new Error(errorData.message || `Error de base de datos (${response.status})`);
            } catch (e) {
                throw new Error(`Error de comunicación con la base de datos (${response.status})`);
            }
        }
        
    } catch (error) {
        console.error(`❌[${callId}] ERROR EN BASE DE DATOS MYSQL:`, error.message);
        
        // SIN FALLBACKS - Solo mostrar error claro
        if (error.name === 'AbortError') {
            throw new Error('Timeout: La base de datos MySQL no responde');
        }
        
        throw new Error(`Error de base de datos: ${error.message}`);
    }
}

// Función para verificar estado del sistema
async function checkSystemStatus() {
    try {
        const response = await apiRequest('/status');
        return response;
    } catch (error) {
        console.error('Error al verificar estado del sistema:', error);
        throw error;
    }
}

// Función para obtener servicios
async function getServices() {
    try {
        const response = await apiRequest('/services');
        return response;
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        throw error;
    }
}

// Función para obtener slots disponibles
async function getAvailableSlots(date) {
    try {
        const response = await apiRequest(`/available-slots?date=${date}`);
        return response;
    } catch (error) {
        console.error('Error al obtener slots disponibles:', error);
        throw error;
    }
}

// Función para obtener reservas
async function getBookings() {
    try {
        const response = await apiRequest('/bookings');
        return response;
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        throw error;
    }
}

// Función para crear reserva
async function createBooking(bookingData) {
    try {
        const response = await apiRequest('/bookings', {
            method: 'POST',
            body: bookingData
        });
        return response;
    } catch (error) {
        console.error('Error al crear reserva:', error);
        throw error;
    }
}

// Exportar para el navegador
if (typeof window !== 'undefined') {
    window.apiRequest = apiRequest;
    window.checkSystemStatus = checkSystemStatus;
    window.getServices = getServices;
    window.getAvailableSlots = getAvailableSlots;
    window.getBookings = getBookings;
    window.createBooking = createBooking;
    
    console.log('📤 API Helper cargado correctamente');
    console.log('✅ Funciones disponibles: apiRequest, checkSystemStatus, getServices, getAvailableSlots, getBookings, createBooking');
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiRequest,
        checkSystemStatus,
        getServices,
        getAvailableSlots,
        getBookings,
        createBooking
    };
}

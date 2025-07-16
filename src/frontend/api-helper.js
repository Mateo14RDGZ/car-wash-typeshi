/**
 * � API HELPER - CAR WASH TYPESHI
 * Helper para comunicarse con la API de Vercel
 * URL: https://car-wash-typeshi.vercel.app/api/
 */

// Configuración de la API
const API_CONFIG = {
    baseURL: '/api',
    timeout: 30000,
    retries: 3
};

// Anunciar inicialización del sistema
if (typeof window !== 'undefined') {
    console.log('� API HELPER - CAR WASH TYPESHI INICIADO');
    console.log('📌 Timestamp:', new Date().toISOString());
    console.log('🌐 Base URL:', API_CONFIG.baseURL);
    
    // Eliminar posibles implementaciones duplicadas
    if (window.apiRequestInitialized) {
        console.error('🚨 ALERTA: Intento de doble inicialización de apiRequest()');
    } else {
        window.apiRequestInitialized = true;
        console.log('✅ Primera inicialización de apiRequest() - OK');
    }
}

/**
 * Función principal para realizar peticiones HTTP
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones de la petición
 * @returns {Promise} - Promesa con la respuesta
 */
async function apiRequest(endpoint, options = {}) {
    const {
        method = 'GET',
        data = null,
        headers = {},
        retries = API_CONFIG.retries
    } = options;
    
    console.log(`� [API] ${method} ${endpoint}`);
    
    // Construir URL completa
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    // Configurar headers
    const requestHeaders = {
        'Content-Type': 'application/json',
        'X-Request-ID': Math.random().toString(36).substring(7),
        ...headers
    };
    
    // Configurar opciones de fetch
    const fetchOptions = {
        method,
        headers: requestHeaders,
        mode: 'cors',
        credentials: 'same-origin'
    };
    
    // Agregar body si es necesario
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        fetchOptions.body = JSON.stringify(data);
    }
    
    // Función para realizar el fetch con reintentos
    const fetchWithRetry = async (attempt = 1) => {
        try {
            console.log(`🔄 Intento ${attempt}/${retries + 1}: ${url}`);
            
            const response = await fetch(url, fetchOptions);
            
            console.log(`📊 Respuesta: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            console.log('✅ Respuesta exitosa:', result);
            return result;
            
        } catch (error) {
            console.error(`❌ Error en intento ${attempt}:`, error);
            
            if (attempt <= retries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.log(`⏱️ Reintentando en ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithRetry(attempt + 1);
            }
            
            throw error;
        }
    };
    
    return fetchWithRetry();
}

/**
 * Funciones específicas para cada endpoint
 */

// Verificar estado del sistema
async function checkSystemStatus() {
    console.log('🔍 Verificando estado del sistema...');
    return apiRequest('/status');
}

// Obtener servicios disponibles
async function getServices() {
    console.log('🛠️ Obteniendo servicios disponibles...');
    return apiRequest('/services');
}

// Obtener horarios disponibles
async function getAvailableSlots(date) {
    console.log(`📅 Obteniendo horarios para: ${date}`);
    
    if (!date) {
        throw new Error('Fecha requerida');
    }
    
    return apiRequest(`/available-slots?date=${encodeURIComponent(date)}`);
}

// Obtener reservas
async function getBookings() {
    console.log('📋 Obteniendo reservas...');
    return apiRequest('/bookings');
}

// Crear nueva reserva
async function createBooking(bookingData) {
    console.log('📝 Creando nueva reserva:', bookingData);
    
    // Validar datos requeridos
    const required = ['name', 'email', 'phone', 'date', 'timeSlot', 'serviceType'];
    for (const field of required) {
        if (!bookingData[field]) {
            throw new Error(`Campo requerido: ${field}`);
        }
    }
    
    return apiRequest('/bookings', {
        method: 'POST',
        data: bookingData
    });
}

// Verificar conexión inicial
if (typeof window !== 'undefined') {
    // Verificar conexión después de cargar
    setTimeout(() => {
        checkSystemStatus()
            .then(result => {
                console.log('✅ Conexión con API establecida:', result);
            })
            .catch(error => {
                console.error('❌ Error de conexión con API:', error);
            });
    }, 1000);
}

// Exportar funciones (para compatibilidad con diferentes entornos)
if (typeof window !== 'undefined') {
    // Navegador
    window.apiRequest = apiRequest;
    window.checkSystemStatus = checkSystemStatus;
    window.getServices = getServices;
    window.getAvailableSlots = getAvailableSlots;
    window.getBookings = getBookings;
    window.createBooking = createBooking;
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = {
        apiRequest,
        checkSystemStatus,
        getServices,
        getAvailableSlots,
        getBookings,
        createBooking
    };
}
    const callId = Math.random().toString(36).substring(2, 8);
    
    console.log(`🔹[${callId}] PETICIÓN A BASE DE DATOS MYSQL`);
    console.log(`🔹[${callId}] Endpoint: ${endpoint}`);
    
    // Verificar que no sea una URL absoluta
    if (endpoint.startsWith('http')) {
        console.error(`❌[${callId}] ERROR: No se permiten URLs absolutas`);
        throw new Error('URL absoluta no permitida');
    }
    
    // Construir URL para Vercel
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2);
    const url = `/api/api-bridge?endpoint=${encodeURIComponent(endpoint)}&_=${uniqueId}`;
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

// Exportar función
if (typeof window !== 'undefined') {
    window.apiRequest = apiRequest;
    console.log('📤 apiRequest disponible globalmente');
    console.log('✅ Sistema listo - SOLO BASE DE DATOS MYSQL');
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiRequest };
}

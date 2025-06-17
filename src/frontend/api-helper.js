/**
 * Función helper para realizar peticiones API
 * Versión simplificada para funcionar tanto en desarrollo como producción
 */
async function apiRequest(endpoint, options = {}) {
    // Detectar entorno de forma más precisa
    const currentHostname = window.location.hostname;
    const currentProtocol = window.location.protocol;
    
    console.log('DEBUG - Entorno detectado:', {
        hostname: currentHostname,
        protocol: currentProtocol,
        href: window.location.href
    });
    
    // Determinar la URL base según el entorno
    let baseUrl;
    
    if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
        // Desarrollo local
        baseUrl = 'http://localhost:3003/api';
        console.log('DEBUG - Modo: DESARROLLO LOCAL');
    } else if (currentProtocol === 'file:') {
        // Archivo local - forzar uso del servidor local
        baseUrl = 'http://localhost:3003/api';
        console.log('DEBUG - Modo: ARCHIVO LOCAL (usando servidor local)');
    } else {
        // Producción
        baseUrl = '/api';
        console.log('DEBUG - Modo: PRODUCCIÓN');
    }
    
    const fullUrl = `${baseUrl}${endpoint}`;
    
    console.log(`DEBUG - Realizando petición a endpoint: ${endpoint}`, options);
    console.log(`DEBUG - URL completa: ${fullUrl}`);
    
    // Configuración de fetch
    const fetchOptions = {
        method: options.method || 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(options.headers || {})
        },
        mode: 'cors',
        cache: 'no-cache',
        ...options
    };
    
    // Si hay body, convertir a JSON
    if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
    }
    
    try {
        console.log(`DEBUG - Intentando petición a: ${fullUrl}`);
        
        // Crear timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(fullUrl, {
            ...fetchOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`DEBUG - Status de la respuesta: ${response.status}`);
        
        if (response.ok) {
            try {
                const data = await response.json();
                console.log('DEBUG - Respuesta exitosa:', data);
                return data;
            } catch (jsonError) {
                console.error('DEBUG - Error al parsear JSON:', jsonError);
                throw new Error('Respuesta inválida del servidor');
            }
        } else {
            // Error del servidor
            let errorMessage = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = `Error del servidor (${response.status})`;
            }
            throw new Error(errorMessage);
        }
        
    } catch (error) {
        console.error('DEBUG - Error en petición:', error);
        
        // Manejo específico de errores
        if (error.name === 'AbortError') {
            throw new Error('La petición tardó demasiado tiempo. Verifica tu conexión.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
            if (currentProtocol === 'file:' || currentHostname === 'localhost') {
                throw new Error('No se puede conectar al servidor local. Asegúrate de que esté ejecutándose en http://localhost:3003');
            } else {
                throw new Error('Error de conexión. Verifica tu conexión a internet.');
            }
        } else {
            throw new Error(error.message || 'Error desconocido');
        }
    }
}

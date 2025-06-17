/**
 * API Helper optimizado - Usa SOLO api-bridge en producción
 */
async function apiRequest(endpoint, options = {}) {
    // Detectar entorno de forma simple
    const isLocalFile = window.location.protocol === 'file:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isProduction = !isLocalFile && !isLocalhost;
    
    console.log('DEBUG - Realizando petición a endpoint:', endpoint, options);
    console.log('DEBUG - Entorno detectado:', { isLocalhost, isProduction, protocol: window.location.protocol, hostname: window.location.hostname });
    
    // IMPORTANTE: En producción usar SOLO api-bridge (según logs funciona con Status 200)
    let url;
    
    if (isProduction) {
        // Solo api-bridge en producción - NO intentar otras URLs
        url = `/api-bridge?endpoint=${encodeURIComponent(endpoint)}&method=${options.method || 'GET'}`;
        console.log('DEBUG - MODO PRODUCCIÓN: usando api-bridge exclusivamente');
    } else {
        // Solo localhost en desarrollo
        url = `http://localhost:3003/api${endpoint}`;
        console.log('DEBUG - MODO DESARROLLO: usando servidor local');
    }
    
    console.log(`DEBUG - Intentando petición a: ${url}`);
    
    const fetchOptions = {
        method: options.method || 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...(options.headers || {})
        },
        ...options
    };
    
    if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
        
        const response = await fetch(url, {
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
            } catch (parseError) {
                console.error('DEBUG - Error al parsear JSON:', parseError);
                throw new Error('Respuesta inválida del servidor');
            }
        } else {
            let errorMessage = `Error del servidor (${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
                console.log('DEBUG - Error del servidor:', errorData);
            } catch (e) {
                console.log('DEBUG - No se pudo parsear error del servidor');
            }
            throw new Error(errorMessage);
        }
        
    } catch (error) {
        console.error(`DEBUG - Error en petición:`, error);
        
        if (error.name === 'AbortError') {
            throw new Error('La petición tardó demasiado tiempo. Intenta nuevamente.');
        } else if (!isProduction && (
            error.name === 'TypeError' ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('ERR_BLOCKED_BY_CLIENT')
        )) {
            throw new Error('ERROR_LOCAL_SERVER: No se puede conectar al servidor local. Asegúrate de que esté ejecutándose en el puerto 3003.');
        } else {
            throw new Error(error.message || 'Error de conexión.');
        }
    }
}

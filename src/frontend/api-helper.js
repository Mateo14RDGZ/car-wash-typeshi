/**
 * Función helper para realizar peticiones API evitando bloqueos
 * 
 * @param {string} endpoint - El endpoint de la API, ej: "/bookings"
 * @param {Object} options - Opciones de fetch (method, body, etc)
 * @returns {Promise<any>} - Respuesta de la API
 */
async function apiRequest(endpoint, options = {}) {
    // Detectar si estamos en entorno de producción (Vercel) o desarrollo
    const isLocalFile = window.location.protocol === 'file:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isProduction = !isLocalFile && !isLocalhost;
    
    console.log('DEBUG - Detectando entorno:', { 
        protocol: window.location.protocol, 
        hostname: window.location.hostname, 
        isLocalFile, 
        isLocalhost, 
        isProduction 
    });
    
    // Configurar URLs según el entorno
    let urlsToTry = [];
    
    if (isProduction) {
        // En producción (Vercel), usar API relativa
        urlsToTry = [`/api${endpoint}`];
    } else {
        // En desarrollo local, usar servidor local
        urlsToTry = [`http://localhost:3003/api${endpoint}`];
    }
    
    console.log('DEBUG - URLs que se intentarán:', urlsToTry);
    console.log(`DEBUG - Realizando petición a endpoint: ${endpoint}`, options);    // Configuración por defecto
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
    
    // Si hay body, asegurar que esté en formato JSON
    if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
    }
    
    try {
        for (const url of urlsToTry) {
            console.log(`DEBUG - Intentando petición a: ${url}`);
            
            try {
                // Crear AbortController para timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
                
                const response = await fetch(url, {
                    ...fetchOptions,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                console.log(`DEBUG - Status de la respuesta: ${response.status}`);
                
                // Manejar respuesta exitosa
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
                    // Manejar errores del servidor
                    let errorMessage = `Error del servidor (${response.status})`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        // Si no se puede parsear el error, usar mensaje genérico
                    }
                    throw new Error(errorMessage);
                }
                
            } catch (fetchError) {
                console.error(`DEBUG - Error en petición a ${url}:`, fetchError);
                
                // En desarrollo, si hay error de conexión, dar instrucciones claras
                if (!isProduction && (
                    fetchError.name === 'TypeError' ||
                    fetchError.message.includes('Failed to fetch') ||
                    fetchError.message.includes('ERR_BLOCKED_BY_CLIENT')
                )) {
                    throw new Error('ERROR_LOCAL_SERVER: No se puede conectar al servidor local. Asegúrate de que el servidor esté ejecutándose en el puerto 3003.');
                }
                
                // Si es el último intento, lanzar el error
                if (url === urlsToTry[urlsToTry.length - 1]) {
                    throw fetchError;
                }
                // Si no es el último, continuar con la siguiente URL
            }
        }
        
    } catch (error) {
        console.error('DEBUG - Error final en apiRequest:', error);
        
        // Mensajes de error más descriptivos
        if (error.message.includes('ERROR_LOCAL_SERVER')) {
            throw new Error('No se puede conectar al servidor local. Verifica que esté ejecutándose.');
        } else if (error.name === 'AbortError') {
            throw new Error('La petición tardó demasiado tiempo. Intenta nuevamente.');
        } else {
            throw new Error(error.message || 'Error de conexión. Verifica tu conexión a internet.');
        }
    }
}

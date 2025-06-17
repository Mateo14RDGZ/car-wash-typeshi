/**
 * API Helper optimizado - Usa api-bridge en producción que funciona según los logs
 */
async function apiRequest(endpoint, options = {}) {
    // Detectar entorno
    const isLocalFile = window.location.protocol === 'file:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isProduction = !isLocalFile && !isLocalhost;
    
    console.log('DEBUG - Realizando petición a endpoint:', endpoint, options);
    
    // En producción, usar SOLO el api-bridge que funciona (según los logs muestra Status 200)
    let urlsToTry = [];
    
    if (isProduction) {
        urlsToTry = [
            `/api-bridge?endpoint=${encodeURIComponent(endpoint)}&method=${options.method || 'GET'}`
        ];
    } else {
        urlsToTry = [`http://localhost:3003/api${endpoint}`];
    }
    
    const fetchOptions = {
        method: options.method || 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    };
    
    if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
    }
    
    for (const url of urlsToTry) {
        console.log(`DEBUG - Intentando petición a: ${url}`);
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
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
                } catch (e) {
                    // Si no se puede parsear el error, usar mensaje genérico
                }
                console.log(`DEBUG - Error en intento con URL ${url}: ${errorMessage}`);
                throw new Error(errorMessage);
            }
            
        } catch (fetchError) {
            console.error(`DEBUG - Error en petición a ${url}:`, fetchError);
            
            if (!isProduction && (
                fetchError.name === 'TypeError' ||
                fetchError.message.includes('Failed to fetch') ||
                fetchError.message.includes('ERR_BLOCKED_BY_CLIENT')
            )) {
                throw new Error('ERROR_LOCAL_SERVER: No se puede conectar al servidor local. Asegúrate de que esté ejecutándose en el puerto 3003.');
            }
            
            if (url === urlsToTry[urlsToTry.length - 1]) {
                throw fetchError;
            }
        }
    }
    
    throw new Error('No se pudo conectar con el servidor.');
}

/**
 * Función helper para realizar peticiones API evitando bloqueos
 * 
 * @param {string} endpoint - El endpoint de la API, ej: "/bookings"
 * @param {Object} options - Opciones de fetch (method, body, etc)
 * @returns {Promise<any>} - Respuesta de la API
 */
async function apiRequest(endpoint, options = {}) {
    // Detectar si estamos en entorno de producción (Vercel) o desarrollo
    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
    const isSecureContext = window.location.protocol === 'https:';
    
    let apiBaseUrls = [];
      if (isProduction) {
        // En producción (Vercel), usar la API URL relativa y la URL de Vercel
        apiBaseUrls = [
            '/api', // API relativa en el mismo servidor
            'https://car-wash-typeshi.vercel.app/api' // URL segura y completa
        ];
    } else {
        // En desarrollo local - solo usar el servidor local
        apiBaseUrls = [
            'http://localhost:3003/api'
        ];
    }
      // Lista de URLs para intentar, en orden de preferencia
    const urlsToTry = isProduction ? 
        [
            ...apiBaseUrls.map(url => `${url}${endpoint}`),
            `/api-bridge?endpoint=${encodeURIComponent(endpoint)}&method=${options.method || 'GET'}` // Usar el nuevo api-bridge en Node.js
        ] : 
        [
            ...apiBaseUrls.map(url => `${url}${endpoint}`)
        ];
    
    console.log(`DEBUG - Realizando petición a endpoint: ${endpoint}`, options);

    // Configuración por defecto
    const fetchOptions = {
        method: options.method || 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache',
            ...(options.headers || {})
        },
        ...options
    };
    
    try {
        // Intentar cada URL de la lista hasta que una funcione
        let lastError = null;
        let responseData = null;
        let allUrlsBlocked = true;
        
        // Bucle para intentar cada URL
        for (const url of urlsToTry) {
            console.log(`DEBUG - Intentando petición a: ${url}`);
            
            try {
                // Usar AbortController para manejar timeouts
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout
                
                const response = await fetch(url, {
                    ...fetchOptions,
                    signal: controller.signal
                }).catch(err => {
                    if (err.name === 'AbortError') {
                        throw new Error('La petición tomó demasiado tiempo');
                    }
                    // Si es un error de red o bloqueo (típico de ERR_BLOCKED_BY_CLIENT)
                    if (err.message && (
                        err.message.includes('network') || 
                        err.name === 'TypeError' || 
                        err.message.includes('Failed to fetch'))
                    ) {
                        allUrlsBlocked = false; // Al menos sabemos que no fue un bloqueo
                        throw new Error(`La solicitud fue bloqueada o falló la conexión (${url})`);
                    }
                    throw err;
                });
                
                clearTimeout(timeoutId);
                
                console.log(`DEBUG - Status de la respuesta: ${response.status}`);
                
                // Verificar si la respuesta es exitosa
                if (response.status >= 200 && response.status < 300) {
                    // Intentar parsear como JSON primero
                    try {
                        responseData = await response.json();
                        return responseData; // Retornar datos y salir del bucle
                    } catch (e) {
                        // Si no es JSON, intentar obtener como texto
                        const text = await response.text();
                        try {
                            // Intentar parsear el texto como JSON una vez más (por si el Content-Type es incorrecto)
                            responseData = JSON.parse(text);
                        } catch (jsonError) {
                            // Si todo falla, devolver el texto plano
                            responseData = { data: text };
                        }
                        return responseData;
                    }
                } else if (response.status === 404) {
                    // Recurso no encontrado, probar siguiente URL
                    lastError = new Error(`Recurso no encontrado (404): ${url}`);
                    continue;
                } else {
                    // Error del servidor, intentar parsear el cuerpo de la respuesta
                    try {
                        const errorData = await response.json();
                        throw new Error(`Error del servidor (${response.status}): ${JSON.stringify(errorData)}`);
                    } catch (e) {
                        // Si no se puede parsear, usar mensaje genérico
                        throw new Error(`Error del servidor (${response.status})`);
                    }
                }
            } catch (error) {
                console.log(`DEBUG - Error en intento con URL ${url}: ${error.message}`);
                lastError = error;
                // Continuar con la siguiente URL si esta falla
                continue;
            }
        }
        
        // Si llegamos aquí, todas las URLs fallaron
        if (allUrlsBlocked) {
            throw new Error('Todas las peticiones fueron bloqueadas. Intente desactivar bloqueadores de anuncios o usar una conexión diferente.');
        } else {
            throw lastError || new Error('No se pudo conectar con el servidor.');
        }
    } catch (error) {
        console.log(`DEBUG - Error en intento con URL ${endpoint}: ${error}`, error);
        throw error;
    }
}

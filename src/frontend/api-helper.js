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
        // En desarrollo local
        apiBaseUrls = [
            'http://localhost:3003/api',
            'http://127.0.0.1:3003/api',
            '/api' // También intentar la ruta relativa
        ];
    }    // Lista de URLs para intentar, en orden de preferencia (asegurando que las HTTPS vayan primero en entornos seguros)
    const urlsToTry = [
        ...apiBaseUrls.map(url => `${url}${endpoint}`),
        `/api-bridge?endpoint=${encodeURIComponent(endpoint)}&method=${options.method || 'GET'}` // Usar el nuevo api-bridge en Node.js
    ];
    
    console.log(`DEBUG - Realizando petición a endpoint: ${endpoint}`, options);

    // Configuración por defecto
    const fetchOptions = {
        method: options.method || 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            ...(options.headers || {})
        },
        ...options
    };

    try {
        // Intentar cada URL de la lista hasta que una funcione
        let lastError = null;
        
        // Bucle para intentar cada URL
        for (const url of urlsToTry) {
            console.log(`DEBUG - Intentando petición a: ${url}`);
            
            try {
                const response = await fetch(url, fetchOptions);
                console.log('DEBUG - Status de la respuesta:', response.status);
                
                if (!response.ok) {
                    let errorMsg = `Error del servidor (${response.status})`;
                    try {
                        const errorText = await response.text();
                        errorMsg += `: ${errorText.substring(0, 100)}`;
                    } catch (e) {}
                    throw new Error(errorMsg);
                }
                
                // Si llegamos aquí, la petición fue exitosa
                return await response.json();
            } catch (fetchError) {
                console.log(`DEBUG - Error en intento con URL ${url}:`, fetchError);
                lastError = fetchError;
                // Continuar con la siguiente URL
            }
        }
        
        // Si llegamos aquí, todos los intentos fallaron
        console.log('DEBUG - Todos los intentos con fetch fallaron, probando XMLHttpRequest:', lastError);
        
        // Último intento: XMLHttpRequest con la primera URL
        return await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const firstUrl = urlsToTry[0];
            xhr.open(fetchOptions.method, firstUrl, true);
            
            // Aplicar headers
            Object.keys(fetchOptions.headers).forEach(headerName => {
                xhr.setRequestHeader(headerName, fetchOptions.headers[headerName]);
            });
            
            xhr.responseType = 'json';
            
            xhr.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(new Error(`Error del servidor: ${this.status}`));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('Error de red o bloqueo de la solicitud'));
            };
            
            // Enviar con o sin body
            if (fetchOptions.body) {
                xhr.send(fetchOptions.body);
            } else {
                xhr.send();
            }
        });
    } catch (error) {
        console.error('DEBUG - Error final en apiRequest:', error);
        throw error;
    }
}

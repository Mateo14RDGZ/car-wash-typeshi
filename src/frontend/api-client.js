/**
 * 🚀 API CLIENT NUEVO - CACHE REFRESH FORZADO 🚀
 * Este archivo usa SOLO api-bridge en producción web
 */
async function apiRequest(endpoint, options = {}) {
    // Detectar entorno
    const isLocalFile = window.location.protocol === 'file:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isProduction = !isLocalFile && !isLocalhost;
    
    console.log('🆕 ===== NUEVO API CLIENT CARGADO =====');
    console.log('🔍 DEBUG - Realizando petición a endpoint:', endpoint, options);
    console.log('🌍 DEBUG - Entorno detectado:', { 
        hostname: window.location.hostname, 
        protocol: window.location.protocol,
        isLocalhost, 
        isProduction 
    });
    
    // ⚡ CLAVE: En producción usar SOLO api-bridge (Status 200)
    let url;
    
    if (isProduction) {
        // 🎯 SOLO api-bridge en producción - SIN otros intentos
        url = `/api-bridge?endpoint=${encodeURIComponent(endpoint)}&method=${options.method || 'GET'}`;
        console.log('🌐 DEBUG - MODO PRODUCCIÓN: usando EXCLUSIVAMENTE api-bridge');
    } else {
        // 🏠 SOLO localhost en desarrollo
        url = `http://localhost:3003/api${endpoint}`;
        console.log('💻 DEBUG - MODO DESARROLLO: usando servidor local');
    }
    
    console.log(`🎯 DEBUG - URL ÚNICA seleccionada: ${url}`);
    
    const fetchOptions = {
        method: options.method || 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(options.headers || {})
        },
        ...options
    };
    
    if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
    }
    
    try {
        console.log(`🚀 DEBUG - Ejecutando petición ÚNICA a: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`📊 DEBUG - Status recibido: ${response.status}`);
        
        if (response.ok) {
            try {
                const data = await response.json();
                console.log('✅ DEBUG - RESPUESTA EXITOSA:', data);
                return data;
            } catch (parseError) {
                console.error('❌ DEBUG - Error al parsear JSON:', parseError);
                throw new Error('Respuesta inválida del servidor');
            }
        } else {
            let errorMessage = `Error del servidor (${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
                console.log('� DEBUG - Error detallado del servidor:', errorData);
            } catch (e) {
                console.log('⚠️ DEBUG - No se pudo parsear error del servidor');
            }
            throw new Error(errorMessage);
        }
        
    } catch (error) {
        console.error(`💥 DEBUG - Error en la petición:`, error);
        
        if (error.name === 'AbortError') {
            throw new Error('⏱️ Timeout: La petición tardó demasiado. Intenta nuevamente.');
        } else if (!isProduction && (
            error.name === 'TypeError' ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('ERR_BLOCKED_BY_CLIENT')
        )) {
            throw new Error('🔌 ERROR_LOCAL_SERVER: No se puede conectar al servidor local en puerto 3003.');
        } else {
            throw new Error(error.message || '🌐 Error de conexión.');
        }
    }
}

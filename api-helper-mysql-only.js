/**
 * 🔥 API HELPER - SOLO BASE DE DATOS MYSQL - SIN FALLBACKS
 * 
 * VERSIÓN SIMPLIFICADA (15/07/2025)
 * 
 * ⚠️ IMPORTANTE ⚠️
 * Este archivo funciona EXCLUSIVAMENTE con la base de datos MySQL.
 * NO hay sistemas de fallback, ni generación local de horarios.
 * Si la base de datos falla, la aplicación mostrará un error.
 * 
 * 🎯 CARACTERÍSTICAS 🎯
 * - Usa EXCLUSIVAMENTE la base de datos MySQL
 * - Sin sistemas de fallback ni recuperación
 * - Errores claros cuando la BD no está disponible
 * - Horarios disponibles SOLO desde la base de datos
 */

// Anunciar inicialización del sistema
if (typeof window !== 'undefined') {
    console.log('🔥 API HELPER - SOLO BASE DE DATOS MYSQL INICIADO');
    console.log('📌 Timestamp:', new Date().toISOString());
    
    // Eliminar posibles implementaciones duplicadas
    if (window.apiRequestInitialized) {
        console.error('🚨 ALERTA: Intento de doble inicialización de apiRequest()');
    } else {
        window.apiRequestInitialized = true;
        console.log('✅ Primera inicialización de apiRequest() - OK');
    }
    
    // Verificar conexión con el servidor
    console.log('🔌 Verificando conexión con la base de datos MySQL...');
    setTimeout(() => {
        fetch('/api/api-bridge?endpoint=/system/status&_=' + Date.now())
            .then(res => {
                if (res.ok) {
                    console.log('✅ Conexión con la base de datos MySQL establecida');
                } else {
                    console.error('❌ Error de conexión con la base de datos MySQL:', res.status);
                }
            })
            .catch(err => console.error('❌ Error al verificar conexión MySQL:', err));
    }, 1000);
}

/**
 * Función principal para realizar peticiones HTTP
 * SOLO funciona con la base de datos MySQL
 */
async function apiRequest(endpoint, options = {}) {
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

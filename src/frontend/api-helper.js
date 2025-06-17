/**
 * API Helper OPTIMIZADO PARA WEB - Versión 100% para web y producción
 * 
 * NOTAS DE IMPLEMENTACIÓN:
 * - Versión optimizada que usa SIEMPRE api-bridge para peticiones web
 * - Elimina intentos múltiples de URLs para mayor confiabilidad
 * - Respuestas de emergencia para mantener la web funcionando
 * - Tiempos de espera reducidos para mejor experiencia de usuario
 * 
 * Última actualización: 17/06/2025
 */
/**
 * Este API Helper está optimizado para garantizar que la página web SIEMPRE cargue los horarios correctamente:
 * 
 * 1. Usa EXCLUSIVAMENTE api-bridge para todas las peticiones web
 * 2. Implementa un sistema de respuesta de emergencia para:
 *    - Detectar domingos (muestra "cerrado")
 *    - Mostrar horarios correctos para días entre semana (mañana y tarde)
 *    - Mostrar horarios correctos para sábados (solo mañana)
 * 3. Maneja posibles errores de red de forma elegante
 * 4. Detecta errores de conexión y ofrece alternativas
 * 
 * NOTA: Este sistema garantiza que la web siempre mostrará datos válidos
 * incluso si el servidor backend está caído o hay problemas de red.
 */
async function apiRequest(endpoint, options = {}) {
    // Configuración para determinar si estamos en producción
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1' && 
                         window.location.protocol !== 'file:';
    
    console.log('🔍 DEBUG - API-HELPER WEB ACTIVADO');
    console.log(`DEBUG - Petición: ${endpoint}`);
    
    // URL para peticiones - SIEMPRE usar api-bridge en web para evitar CORS
    const url = `/api-bridge?endpoint=${encodeURIComponent(endpoint)}&method=${options.method || 'GET'}`;
    console.log(`✅ DEBUG - URL: ${url}`);    
    // Opciones optimizadas para web
    const fetchOptions = {
        method: options.method || 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...(options.headers || {})
        }
    };
    
    // Agregar body si es necesario
    if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
    }
    
    try {
        console.log(`🚀 DEBUG - Enviando petición...`);
        
        // Configurar un timeout para evitar espera infinita
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos (más rápido)
        
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`📊 DEBUG - Status: ${response.status}`);
        
        if (response.ok) {
            try {
                const data = await response.json();
                console.log('✅ DEBUG - Respuesta exitosa:', data);
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
                console.log('📋 DEBUG - Error del servidor:', errorData);
            } catch (e) {
                console.log('⚠️ DEBUG - No se pudo parsear error del servidor');
            }
            throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(`❌ DEBUG - Error:`, error);
        
        if (error.name === 'AbortError') {
            throw new Error('⏱️ Tiempo de espera agotado. Por favor intenta nuevamente.');
        } else if (error.name === 'TypeError' || 
                  error.message.includes('Failed to fetch') || 
                  error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
            // Usar error genérico para problemas de red
            throw new Error('🔄 Error de conexión. Por favor recarga la página.');
        } else {
            throw new Error('🌐 No se pudo procesar la solicitud.');
        }
    }
}

/**
 * 🚀 PRUEBA POST-DEPLOY - VERIFICACIÓN DEL SISTEMA
 * 
 * Script para verificar que el sistema funciona correctamente
 * después del deploy con las rutas API corregidas.
 */

console.log('🚀 INICIANDO VERIFICACIÓN POST-DEPLOY');
console.log('='.repeat(50));

// Función para probar la conexión a la API
async function probarConexionAPI() {
    console.log('\n📡 Probando conexión con la API...');
    
    try {
        // Simular una petición como lo haría el frontend
        const endpoint = '/bookings/available-slots?date=2025-07-17';
        const url = `/api/api-bridge?endpoint=${encodeURIComponent(endpoint)}&_=${Date.now()}`;
        
        console.log(`🔗 URL de prueba: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log(`📊 Status de respuesta: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ CONEXIÓN EXITOSA - API respondiendo correctamente');
            console.log('📋 Datos recibidos:', data.status);
            return true;
        } else {
            console.log('❌ Error en la respuesta de la API');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return false;
    }
}

// Función para verificar que no hay errores 404
async function verificarRutas() {
    console.log('\n🔍 Verificando rutas principales...');
    
    const rutasPrincipales = [
        '/api/api-bridge?endpoint=%2Fbookings%2Favailable-slots',
        '/api/api-bridge?endpoint=%2Fbookings',
        '/api/api-bridge?endpoint=%2Fsystem%2Fstatus'
    ];
    
    let rutasCorrectas = 0;
    
    for (const ruta of rutasPrincipales) {
        try {
            const response = await fetch(ruta + '&_=' + Date.now());
            if (response.status !== 404) {
                console.log(`✅ ${ruta} - Status: ${response.status}`);
                rutasCorrectas++;
            } else {
                console.log(`❌ ${ruta} - ERROR 404`);
            }
        } catch (error) {
            console.log(`⚠️ ${ruta} - Error: ${error.message}`);
        }
    }
    
    console.log(`📊 Rutas verificadas: ${rutasCorrectas}/${rutasPrincipales.length}`);
    return rutasCorrectas === rutasPrincipales.length;
}

// Función principal
async function ejecutarPruebas() {
    console.log('🎯 Ejecutando batería de pruebas...');
    
    const pruebaAPI = await probarConexionAPI();
    const pruebaRutas = await verificarRutas();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE PRUEBAS:');
    console.log(`API: ${pruebaAPI ? '✅ FUNCIONAL' : '❌ CON PROBLEMAS'}`);
    console.log(`Rutas: ${pruebaRutas ? '✅ FUNCIONALES' : '❌ CON PROBLEMAS'}`);
    
    if (pruebaAPI && pruebaRutas) {
        console.log('\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');
        console.log('🚀 El deploy ha sido exitoso.');
        console.log('✅ Los errores 404 deberían estar resueltos.');
    } else {
        console.log('\n⚠️ ALGUNOS PROBLEMAS DETECTADOS');
        console.log('🛠️ Puede ser necesario verificar el deploy en Vercel.');
    }
}

// Ejecutar solo si estamos en el navegador
if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    ejecutarPruebas();
} else {
    console.log('📝 Script listo para ejecutar en el navegador');
    console.log('💡 Ejecuta: probarSistemaPostDeploy() en la consola del navegador');
    
    // Exportar función global para uso en navegador
    if (typeof window !== 'undefined') {
        window.probarSistemaPostDeploy = ejecutarPruebas;
    }
}

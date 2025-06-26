// Test directo para simular exactamente lo que hace el frontend
console.log('🎯 TEST DIRECTO - Simulando Frontend\n');

// Simular una petición HTTP exactamente como la hace el frontend
async function testFrontendFlow() {
    try {
        // 1. Simular que el frontend llama a api-bridge
        console.log('📡 1) Simulando llamada del frontend...');
        
        const apiBridge = require('./api-bridge.js');
        
        // Simular request HTTP GET exactamente como lo hace el navegador
        const req = {
            method: 'GET',
            query: {
                endpoint: '/bookings/available-slots',
                date: '2025-06-27'  // Fecha de mañana
            },
            headers: {}
        };
        
        const res = {
            headers: {},
            statusCode: 200,
            responseData: null,
            
            setHeader(key, value) {
                this.headers[key] = value;
            },
            
            status(code) { 
                this.statusCode = code; 
                return this; 
            },
            
            json(data) { 
                this.responseData = data;
                console.log('📊 RESPUESTA JSON ENVIADA AL FRONTEND:');
                console.log(JSON.stringify(data, null, 2));
                return this; 
            }
        };
        
        // Ejecutar el api-bridge
        await apiBridge(req, res);
        
        // 2. Simular el procesamiento del frontend
        console.log('\n🖥️ 2) Simulando procesamiento del frontend...');
        const data = res.responseData;
        
        if (data && data.data && Array.isArray(data.data)) {
            console.log('✅ Frontend recibió datos válidos');
            console.log(`📊 Total slots: ${data.data.length}`);
            console.log(`🏛️ Fuente: ${data.dataSource || 'No especificada'}`);
            
            // Simular la función procesarHorariosDisponibles
            console.log('\n🔄 3) Simulando procesarHorariosDisponibles()...');
            
            data.data.forEach((slot, index) => {
                const isReserved = slot.isBooked === true;
                console.log(`  Slot ${index + 1}: ${slot.time}`);
                console.log(`    - isBooked: ${slot.isBooked} (${typeof slot.isBooked})`);
                console.log(`    - Estado: ${isReserved ? '🔒 RESERVADO' : '✅ DISPONIBLE'}`);
                
                // Simular creación del botón HTML
                if (isReserved) {
                    console.log(`    - HTML: <button disabled class="btn-secondary">${slot.time} 🔒</button>`);
                } else {
                    console.log(`    - HTML: <button class="btn-primary">${slot.time}</button>`);
                }
            });
            
            // Resumen final
            const ocupados = data.data.filter(s => s.isBooked === true).length;
            const disponibles = data.data.filter(s => s.isBooked !== true).length;
            
            console.log(`\n📈 RESUMEN FINAL:`);
            console.log(`  🔒 Botones deshabilitados (ocupados): ${ocupados}`);
            console.log(`  ✅ Botones habilitados (disponibles): ${disponibles}`);
            
            if (ocupados > 0) {
                console.log('\n🎉 ¡ÉXITO! El sistema debería mostrar horarios ocupados');
                console.log('🔍 Si en el navegador no se ven ocupados, el problema es:');
                console.log('   • Los scripts no se cargan en el orden correcto');
                console.log('   • Hay errores JavaScript que rompen el procesamiento');
                console.log('   • La función procesarHorariosDisponibles no se ejecuta');
            } else {
                console.log('\n⚠️ PROBLEMA: No hay horarios marcados como ocupados');
                console.log('🔍 Esto significa que:');
                console.log('   • No hay reservas en la BD para esa fecha');
                console.log('   • La consulta a la BD no funciona');
                console.log('   • El marcado de isBooked no funciona');
            }
            
        } else {
            console.log('❌ Frontend NO recibió datos válidos');
            console.log('Datos recibidos:', data);
        }
        
    } catch (error) {
        console.error('💥 Error en test:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar test
testFrontendFlow()
    .then(() => {
        console.log('\n🏁 Test completado');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error:', error);
        process.exit(1);
    });

// Test de frontend - verificar que los horarios ocupados se muestren correctamente
console.log('🎯 Probando sistema desde perspectiva del frontend...');

// Importar el api-bridge directamente
const apiBridge = require('./api-bridge.js');

// Simular una llamada del frontend
async function testFrontendCall() {
    try {
        const fechaManana = new Date();
        fechaManana.setDate(fechaManana.getDate() + 1);
        const fechaStr = fechaManana.toISOString().split('T')[0];
        
        console.log(`📅 Probando horarios para: ${fechaStr}`);
        
        // Simular request como lo haría el frontend
        const mockReq = {
            method: 'GET',
            query: { 
                endpoint: `/bookings/available-slots?date=${fechaStr}`,
                method: 'GET',
                date: fechaStr
            },
            headers: { host: 'localhost:8080' }
        };
        
        console.log(`🔗 Query: ${JSON.stringify(mockReq.query, null, 2)}`);
        
        // Crear mock response
        const mockRes = {
            headers: {},
            statusCode: 200,
            data: null,
            
            setHeader(key, value) {
                this.headers[key] = value;
            },
            
            status(code) {
                this.statusCode = code;
                return this;
            },
            
            json(data) {
                this.data = data;
                return this;
            }
        };
        
        // Ejecutar api-bridge
        await apiBridge(mockReq, mockRes);
        
        // Analizar respuesta
        const data = mockRes.data;
        
        console.log('📊 Respuesta recibida:');
        console.log('  Status Code:', mockRes.statusCode);
        console.log('  Status:', data?.status);
        console.log('  Data Source:', data?.dataSource);
        console.log('  Total slots:', data?.data?.length || 0);
        
        if (data?.data && Array.isArray(data.data)) {
            console.log('\n📋 Análisis de horarios:');
            
            const disponibles = data.data.filter(s => !s.isBooked);
            const ocupados = data.data.filter(s => s.isBooked);
            
            console.log(`  Disponibles: ${disponibles.length}`);
            console.log(`  Ocupados: ${ocupados.length}`);
            
            if (data.summary) {
                console.log('\n� Resumen de la API:');
                console.log(`  Total: ${data.summary.total}`);
                console.log(`  Disponibles: ${data.summary.available}`);
                console.log(`  Ocupados: ${data.summary.booked}`);
            }
            
            console.log('\n�📋 Detalle de horarios:');
            data.data.forEach(slot => {
                const estado = slot.isBooked ? '🔒 OCUPADO' : '✅ DISPONIBLE';
                console.log(`  ${slot.time} - ${estado}`);
            });
            
            if (ocupados.length > 0) {
                console.log('\n✅ ¡ÉXITO! Se encontraron horarios ocupados');
                console.log('🎯 El sistema está funcionando correctamente');
                console.log('🔒 Los horarios ocupados se mostrarán deshabilitados en el frontend');
            } else {
                console.log('\n⚠️ No se encontraron horarios ocupados');
                console.log('🔍 Revisando por qué no se están marcando como ocupados...');
                
                // Debug adicional
                if (data.dataSource !== 'mysql-db') {
                    console.log('❓ Problema: No se está usando MySQL como fuente de datos');
                } else {
                    console.log('✅ Fuente de datos: MySQL (correcto)');
                    console.log('💡 Posibles causas:');
                    console.log('  - No hay reservas para la fecha de mañana');
                    console.log('  - Hay un problema en la lógica de comparación de horarios');
                }
            }
        } else {
            console.log('❌ Error: Formato de respuesta incorrecto');
            console.log('Data recibida:', data);
        }
        
    } catch (error) {
        console.error('❌ Error en test frontend:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar test
testFrontendCall()
    .then(() => {
        console.log('\n🎯 Test frontend completado');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test frontend falló:', error);
        process.exit(1);
    });

// Test para verificar la corrección del marcado de horarios
console.log('🧪 TEST: Verificando corrección de marcado de horarios\n');

async function testCorreccion() {
    try {
        const apiBridge = require('./api-bridge.js');
        
        const req = {
            method: 'GET',
            query: {
                endpoint: '/bookings/available-slots',
                date: '2025-06-27'  // Fecha con reservas conocidas
            }
        };
        
        const res = {
            headers: {},
            statusCode: 200,
            responseData: null,
            setHeader() {},
            status(code) { this.statusCode = code; return this; },
            json(data) { this.responseData = data; return this; }
        };
        
        console.log('📡 Consultando horarios para 2025-06-27...');
        await apiBridge(req, res);
        
        console.log('\n📊 RESULTADO DESPUÉS DE LA CORRECCIÓN:');
        
        if (res.responseData && res.responseData.data) {
            const slots = res.responseData.data;
            
            console.log(`Total slots: ${slots.length}`);
            console.log('Estado de cada slot:');
            
            slots.forEach((slot, index) => {
                const estado = slot.isBooked ? '🔒 OCUPADO' : '✅ DISPONIBLE';
                console.log(`  ${index + 1}. ${slot.time} - ${estado}`);
            });
            
            const ocupados = slots.filter(s => s.isBooked).length;
            const disponibles = slots.filter(s => !s.isBooked).length;
            
            console.log(`\n📈 RESUMEN:`);
            console.log(`  🔒 Ocupados: ${ocupados}`);
            console.log(`  ✅ Disponibles: ${disponibles}`);
            
            // Verificar que las reservas conocidas estén marcadas
            const slot1130 = slots.find(s => s.time === '11:30 - 13:00');
            
            console.log(`\n🔍 VERIFICACIÓN ESPECÍFICA:`);
            if (slot1130) {
                console.log(`  Slot 11:30-13:00: ${slot1130.isBooked ? '🔒 OCUPADO (CORRECTO)' : '❌ DISPONIBLE (INCORRECTO)'}`);
            }
            
            if (ocupados > 0) {
                console.log('\n🎉 ¡CORRECCIÓN EXITOSA!');
                console.log('Los horarios ocupados ahora se marcan correctamente');
                console.log('El frontend debería mostrar estos horarios como deshabilitados');
            } else {
                console.log('\n⚠️ La corrección aún no funciona');
                console.log('Necesitamos revisar la lógica de comparación');
            }
            
        } else {
            console.log('❌ No se recibieron datos válidos');
        }
        
    } catch (error) {
        console.error('💥 Error en test:', error.message);
    }
}

testCorreccion()
    .then(() => {
        console.log('\n🏁 Test de corrección completado');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error:', error);
        process.exit(1);
    });

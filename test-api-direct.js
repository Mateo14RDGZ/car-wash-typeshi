// Prueba directa del sistema de horarios disponibles
const availableSlotsHandler = require('./api/bookings/available-slots.js');

// Simular request y response objects
function createMockReq(date) {
    return {
        method: 'GET',
        query: { date }
    };
}

function createMockRes() {
    const res = {
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
        },
        
        end() {
            return this;
        }
    };
    
    return res;
}

async function testHorarios() {
    try {
        console.log('🧪 Probando API de horarios disponibles...');
        
        // Probar con fecha de mañana
        const fechaPrueba = new Date();
        fechaPrueba.setDate(fechaPrueba.getDate() + 1);
        const fechaStr = fechaPrueba.toISOString().split('T')[0];
        
        console.log(`📅 Probando con fecha: ${fechaStr}`);
        
        const req = createMockReq(fechaStr);
        const res = createMockRes();
        
        // Ejecutar la función
        await availableSlotsHandler(req, res);
        
        // Verificar resultado
        console.log('📊 Resultado:');
        console.log('  Status Code:', res.statusCode);
        console.log('  Status:', res.data?.status);
        console.log('  Data Source:', res.data?.dataSource);
        console.log('  Total Slots:', res.data?.data?.length || 0);
        
        if (res.data?.data && Array.isArray(res.data.data)) {
            console.log('\n📋 Horarios encontrados:');
            res.data.data.forEach(slot => {
                const estado = slot.isBooked ? '🔒 OCUPADO' : '✅ DISPONIBLE';
                console.log(`  ${slot.time} - ${estado}`);
            });
            
            const disponibles = res.data.data.filter(s => !s.isBooked).length;
            const ocupados = res.data.data.filter(s => s.isBooked).length;
            
            console.log(`\n📈 Resumen:`);
            console.log(`  Total: ${res.data.data.length}`);
            console.log(`  Disponibles: ${disponibles}`);
            console.log(`  Ocupados: ${ocupados}`);
            
            if (res.data.dataSource === 'mysql_database') {
                console.log('\n✅ ¡ÉXITO! La API está consultando la base de datos MySQL');
            } else {
                console.log('\n⚠️ La API no está usando MySQL como fuente de datos');
            }
        }
        
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar prueba
testHorarios()
    .then(() => {
        console.log('\n🎯 Prueba completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Prueba falló:', error);
        process.exit(1);
    });

// Diagnóstico completo del sistema de horarios
console.log('🔬 INICIANDO DIAGNÓSTICO COMPLETO...\n');

// Test 1: Verificar que api-bridge funciona correctamente
async function test1_ApiBridge() {
    console.log('📋 TEST 1: API Bridge');
    try {
        const apiBridge = require('./api-bridge.js');
        
        // Simular request
        const req = {
            method: 'GET',
            query: {
                endpoint: '/bookings/available-slots',
                date: '2025-06-27'
            }
        };
        
        const res = {
            headers: {},
            statusCode: 200,
            data: null,
            setHeader: function(key, value) { this.headers[key] = value; },
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { this.data = data; return this; }
        };
        
        await apiBridge(req, res);
        
        console.log('  ✅ Status:', res.statusCode);
        console.log('  ✅ Data Source:', res.data?.dataSource);
        console.log('  ✅ Total Slots:', res.data?.data?.length);
        
        if (res.data?.data) {
            const ocupados = res.data.data.filter(s => s.isBooked).length;
            console.log('  🔒 Horarios ocupados:', ocupados);
            console.log('  ✅ Horarios disponibles:', res.data.data.length - ocupados);
            
            // Mostrar cada horario
            res.data.data.forEach(slot => {
                console.log(`    ${slot.isBooked ? '🔒' : '✅'} ${slot.time} - isBooked: ${slot.isBooked}`);
            });
        }
        
        return res.data;
        
    } catch (error) {
        console.log('  ❌ Error:', error.message);
        return null;
    }
}

// Test 2: Verificar conexión directa a base de datos
async function test2_Database() {
    console.log('\n📋 TEST 2: Conexión Base de Datos');
    try {
        const { Sequelize, DataTypes } = require('sequelize');
        const sequelize = new Sequelize(
            process.env.DB_NAME || 'car_wash_db',
            process.env.DB_USER || 'root',
            process.env.DB_PASS || 'Mateo54764325%$',
            {
                host: process.env.DB_HOST || '127.0.0.1',
                dialect: 'mysql',
                logging: false
            }
        );

        await sequelize.authenticate();
        console.log('  ✅ Conexión a base de datos exitosa');
        
        // Consultar reservas
        const [results] = await sequelize.query(`
            SELECT DATE(date) as fecha, TIME(date) as hora, status 
            FROM bookings 
            WHERE DATE(date) = '2025-06-27'
            ORDER BY date
        `);
        
        console.log('  📊 Reservas encontradas para 2025-06-27:', results.length);
        results.forEach(reserva => {
            console.log(`    📅 ${reserva.fecha} ${reserva.hora} - ${reserva.status}`);
        });
        
        await sequelize.close();
        return results;
        
    } catch (error) {
        console.log('  ❌ Error de base de datos:', error.message);
        return null;
    }
}

// Test 3: Comparar resultados
async function test3_Comparison() {
    console.log('\n📋 TEST 3: Comparación de Resultados');
    
    const apiData = await test1_ApiBridge();
    const dbData = await test2_Database();
    
    if (apiData && dbData) {
        console.log('  🔍 ANÁLISIS:');
        console.log(`    - API devuelve ${apiData.data?.length || 0} slots`);
        console.log(`    - BD tiene ${dbData.length} reservas`);
        
        const apiOcupados = apiData.data?.filter(s => s.isBooked).length || 0;
        console.log(`    - API marca ${apiOcupados} como ocupados`);
        console.log(`    - BD debería tener ${dbData.length} ocupados`);
        
        if (apiOcupados === dbData.length) {
            console.log('  ✅ ¡COINCIDENCIA PERFECTA! El backend funciona correctamente');
            console.log('  🔍 El problema está en el FRONTEND, no en el backend');
        } else {
            console.log('  ⚠️ DISCREPANCIA: El backend no está marcando correctamente los horarios');
        }
    }
}

// Ejecutar todos los tests
async function runAllTests() {
    await test1_ApiBridge();
    await test2_Database();
    await test3_Comparison();
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('  1. Si el backend funciona bien → El problema está en el frontend');
    console.log('  2. Si el backend no funciona → Revisar lógica de marcado de horarios');
    console.log('  3. Usar start-debug-server.js y test-horarios.html para probar en navegador');
    
    process.exit(0);
}

runAllTests().catch(error => {
    console.error('💥 Error en diagnóstico:', error);
    process.exit(1);
});

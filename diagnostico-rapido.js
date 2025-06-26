// Diagnóstico rápido del problema de horarios
console.log('🚀 DIAGNÓSTICO RÁPIDO - Horarios no se muestran como ocupados\n');

async function diagnosticoRapido() {
    try {
        // 1. Probar api-bridge directamente
        console.log('📋 1) Probando API Bridge...');
        const apiBridge = require('./api-bridge.js');
        
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
            setHeader(key, value) { this.headers[key] = value; },
            status(code) { this.statusCode = code; return this; },
            json(data) { this.data = data; return this; }
        };
        
        await apiBridge(req, res);
        
        console.log('✅ API Response Status:', res.statusCode);
        console.log('✅ Data Source:', res.data?.dataSource);
        
        if (res.data?.data) {
            console.log('✅ Total slots:', res.data.data.length);
            
            // Analizar cada slot
            console.log('\n📊 ANÁLISIS DE SLOTS:');
            res.data.data.forEach((slot, index) => {
                console.log(`  ${index + 1}. ${slot.time} - isBooked: ${slot.isBooked} (${typeof slot.isBooked})`);
            });
            
            const ocupados = res.data.data.filter(s => s.isBooked === true).length;
            const disponibles = res.data.data.filter(s => s.isBooked === false).length;
            
            console.log(`\n📈 RESUMEN:`);
            console.log(`  🔒 Ocupados: ${ocupados}`);
            console.log(`  ✅ Disponibles: ${disponibles}`);
            
            if (ocupados > 0) {
                console.log('\n✅ ¡EL BACKEND FUNCIONA CORRECTAMENTE!');
                console.log('🔍 Los horarios ocupados SÍ se están marcando como isBooked: true');
                console.log('🎯 EL PROBLEMA ESTÁ EN EL FRONTEND');
            } else {
                console.log('\n⚠️ El backend NO está marcando horarios como ocupados');
                console.log('🔍 Verificando base de datos...');
                
                // Verificar BD directamente
                await verificarBaseDatos();
            }
        }
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error.message);
    }
}

async function verificarBaseDatos() {
    try {
        console.log('\n📋 2) Verificando Base de Datos...');
        
        const { Sequelize } = require('sequelize');
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
        console.log('✅ Conexión exitosa a MySQL');
        
        const [results] = await sequelize.query(`
            SELECT id, clientName, DATE(date) as fecha, TIME(date) as hora, status 
            FROM bookings 
            WHERE DATE(date) >= CURDATE()
            ORDER BY date
            LIMIT 10
        `);
        
        console.log(`📊 Reservas futuras en BD: ${results.length}`);
        
        if (results.length > 0) {
            results.forEach(reserva => {
                console.log(`  📅 ${reserva.fecha} ${reserva.hora} - ${reserva.clientName} (${reserva.status})`);
            });
        } else {
            console.log('⚠️ No hay reservas futuras en la base de datos');
            console.log('🔍 Esto explica por qué todos los horarios aparecen disponibles');
        }
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error de BD:', error.message);
    }
}

// Ejecutar diagnóstico
diagnosticoRapido()
    .then(() => {
        console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
        console.log('\n📋 CONCLUSIONES:');
        console.log('  • Si el backend marca horarios como ocupados pero el frontend no los muestra');
        console.log('    → El problema está en procesarHorariosDisponibles() del frontend');
        console.log('  • Si el backend NO marca horarios como ocupados');
        console.log('    → El problema está en la lógica de consulta de BD del backend');
        console.log('  • Si no hay reservas en la BD');
        console.log('    → Es normal que todos los horarios aparezcan disponibles');
        process.exit(0);
    })
    .catch(err => {
        console.error('💥 Error:', err);
        process.exit(1);
    });

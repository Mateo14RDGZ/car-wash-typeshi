const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase } = require('../database/init');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Función para iniciar el servidor
async function startServer() {
    try {
        // Inicializar la base de datos
        const dbInitialized = await initDatabase();
        
        if (!dbInitialized) {
            console.error('❌ No se pudo inicializar la base de datos.');
            console.log('🔄 Cambiando a modo sin base de datos...');
            // En producción, continuar sin BD usando datos en memoria
        }

        // Rutas - Usar el router con base de datos si está disponible
        if (dbInitialized) {
            const bookingsRouterDB = require('./routes/bookingsDB');
            const servicesRouter = require('./routes/services');
            app.use('/api/bookings', bookingsRouterDB);
            app.use('/api/services', servicesRouter);
            console.log('✅ Usando servicio de reservas con base de datos');
        } else {
            const bookingsRouter = require('./routes/bookings');
            const servicesRouter = require('./routes/services');
            app.use('/api/bookings', bookingsRouter);
            app.use('/api/services', servicesRouter);
            console.log('⚠️  Usando servicio de reservas en memoria');
        }

        // Ruta de prueba
        app.get('/test', (req, res) => {
            res.json({ 
                message: 'El servidor está funcionando correctamente',
                database: dbInitialized ? 'Conectada' : 'No disponible'
            });
        });

        // Ruta para verificar el estado de la BD
        app.get('/api/health', (req, res) => {
            res.json({
                status: 'OK',
                database: dbInitialized ? 'Connected' : 'Disconnected',
                timestamp: new Date().toISOString()
            });
        });

        // Ruta de fallback para horarios disponibles (sin BD)
        app.get('/api/bookings/available-slots', (req, res) => {
            try {
                const { date } = req.query;
                
                if (!date) {
                    return res.status(400).json({
                        status: 'ERROR',
                        message: 'Se requiere una fecha'
                    });
                }

                // Validar formato de fecha
                if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return res.status(400).json({
                        status: 'ERROR',
                        message: 'Formato de fecha inválido. Debe ser YYYY-MM-DD'
                    });
                }

                // Generar slots estándar sin consultar BD
                const inputDate = new Date(date + 'T00:00:00');
                const dayOfWeek = inputDate.getDay();
                
                let slots = [];
                
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    // Días de semana
                    slots = [
                        { time: '08:30 - 10:00', start: '08:30', end: '10:00', isBooked: false, duration: 90 },
                        { time: '10:00 - 11:30', start: '10:00', end: '11:30', isBooked: false, duration: 90 },
                        { time: '11:30 - 13:00', start: '11:30', end: '13:00', isBooked: false, duration: 90 },
                        { time: '14:00 - 15:30', start: '14:00', end: '15:30', isBooked: false, duration: 90 },
                        { time: '15:30 - 17:00', start: '15:30', end: '17:00', isBooked: false, duration: 90 }
                    ];
                } else if (dayOfWeek === 6) {
                    // Sábados
                    slots = [
                        { time: '08:30 - 10:00', start: '08:30', end: '10:00', isBooked: false, duration: 90 },
                        { time: '10:00 - 11:30', start: '10:00', end: '11:30', isBooked: false, duration: 90 },
                        { time: '11:30 - 13:00', start: '11:30', end: '13:00', isBooked: false, duration: 90 }
                    ];
                } else {
                    // Domingos
                    slots = [];
                }

                res.json({
                    status: 'SUCCESS',
                    data: slots,
                    message: dbInitialized ? null : 'Modo sin base de datos - todos los horarios disponibles'
                });

            } catch (error) {
                console.error('Error en ruta fallback de horarios:', error);
                res.status(500).json({
                    status: 'ERROR',
                    message: 'Error al obtener horarios disponibles'
                });
            }
        });

        // Manejo de errores
        app.use((err, req, res, next) => {
            console.error('Error:', err);
            res.status(500).json({
                status: 'ERROR',
                message: err.message || 'Error interno del servidor'
            });
        });

        // Iniciar servidor - Escuchar en todas las interfaces (0.0.0.0)
        app.listen(PORT, '0.0.0.0', () => {
            // Obtener la IP local
            const os = require('os');
            const networkInterfaces = os.networkInterfaces();
            let localIP = 'localhost';
            
            // Buscar la IP de la red local
            Object.keys(networkInterfaces).forEach(key => {
                networkInterfaces[key].forEach(address => {
                    if (address.family === 'IPv4' && !address.internal && address.address.startsWith('192.168')) {
                        localIP = address.address;
                    }
                });
            });

            console.log(`
╔════════════════════════════════════════╗
║   🚗 EXTREME WASH - SERVIDOR ACTIVO    ║
╠════════════════════════════════════════╣
║   Puerto: ${PORT}                        ║
║   URL Local: http://localhost:${PORT}     ║
║   URL Red: http://${localIP}:${PORT}      ║
║   Base de datos: ${dbInitialized ? '✅ Conectada' : '❌ No conectada'}      ║
╚════════════════════════════════════════╝

🌐 ACCESO DESDE OTRAS COMPUTADORAS:
   - En la misma red WiFi: http://${localIP}:${PORT}
   - Asegúrate de que el Firewall permita el puerto ${PORT}
            `);
            console.log('Presiona Ctrl + C para detener');
        });

    } catch (error) {
        console.error('Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Iniciar el servidor solo si no estamos en Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    startServer();
}

// Exportar la app para Vercel
module.exports = app;

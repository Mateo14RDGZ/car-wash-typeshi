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
            console.error('❌ No se pudo inicializar la base de datos. El servidor continuará sin persistencia.');
            // Aquí podrías decidir si continuar sin BD o detener el servidor
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

        // Manejo de errores
        app.use((err, req, res, next) => {
            console.error('Error:', err);
            res.status(500).json({
                status: 'ERROR',
                message: err.message || 'Error interno del servidor'
            });
        });

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║   🚗 EXTREME WASH - SERVIDOR ACTIVO    ║
╠════════════════════════════════════════╣
║   Puerto: ${PORT}                        ║
║   URL: http://localhost:${PORT}          ║
║   Base de datos: ${dbInitialized ? '✅ Conectada' : '❌ No conectada'}      ║
╚════════════════════════════════════════╝
            `);
            console.log('Presiona Ctrl + C para detener');
        });

    } catch (error) {
        console.error('Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Iniciar el servidor
startServer();

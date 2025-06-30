const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bookingsRouter = require('./routes/bookings');
const apiBridgeHandler = require('../../api-bridge');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/api/bookings', bookingsRouter);

// Handler para todas las variantes de api-bridge
const handleApiBridge = (req, res) => {
    console.log('Backend Express: Recibida petición api-bridge:', req.url, 'Query:', req.query);
    Promise.resolve(apiBridgeHandler(req, res)).catch(err => {
        console.error('Error en api-bridge:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    });
};

// Acepta TODAS las variantes posibles de api-bridge
app.use('/api-bridge', handleApiBridge);
app.use('/api/api-bridge', handleApiBridge);

// Ruta de prueba
app.get('/test', (req, res) => {
    res.json({ message: 'El servidor está funcionando correctamente' });
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
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Presiona Ctrl + C para detener');
});
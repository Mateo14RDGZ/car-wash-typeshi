const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bookingsRouter = require('./routes/bookings');
const apiBridgeHandler = require('../../api-bridge');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/api/bookings', bookingsRouter);

// Acepta todas las variantes de /api-bridge (con o sin slash, query o subruta)
app.all(/^\/api-bridge(\/.*)?$/, (req, res) => {
    Promise.resolve(apiBridgeHandler(req, res)).catch(err => {
        console.error('Error en api-bridge:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    });
});

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
// Script para iniciar el servidor y hacer pruebas en tiempo real
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/frontend')));

// Importar el api-bridge
const apiBridge = require('./api-bridge.js');

// Ruta para el api-bridge
app.all('/api-bridge', apiBridge);

// Ruta para servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos estáticos desde: ${path.join(__dirname, 'src/frontend')}`);
    console.log(`🔗 API Bridge disponible en: http://localhost:${PORT}/api-bridge`);
    console.log('\n🧪 Para probar:');
    console.log(`   1. Abre http://localhost:${PORT} en el navegador`);
    console.log(`   2. Abre las Developer Tools (F12)`);
    console.log(`   3. Ve a la consola para ver los logs detallados`);
    console.log(`   4. Selecciona una fecha y observa los logs`);
    console.log('\n🔍 Busca estos logs en la consola:');
    console.log(`   - "📊 RESPUESTA RECIBIDA COMPLETA"`);
    console.log(`   - "🔍 ANÁLISIS DETALLADO DE SLOTS RECIBIDOS"`);
    console.log(`   - "🔒 HORARIO RESERVADO CREADO" o "✅ HORARIO DISPONIBLE CREADO"`);
});

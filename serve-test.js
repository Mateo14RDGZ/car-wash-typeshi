// Servidor simple para testing de horarios
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (incluyendo test-horarios.html)
app.use(express.static(__dirname));

// Importar y configurar api-bridge
const apiBridge = require('./api-bridge.js');
app.all('/api-bridge', apiBridge);

// Ruta de test simplificada para debugging
app.get('/test-horarios-direct', async (req, res) => {
    try {
        const { date } = req.query;
        console.log(`🧪 [TEST] Consultando horarios para: ${date}`);
        
        // Simular request a api-bridge
        const mockReq = {
            method: 'GET',
            query: {
                endpoint: '/bookings/available-slots',
                date: date || '2025-06-27'
            }
        };
        
        const mockRes = {
            headers: {},
            statusCode: 200,
            responseData: null,
            setHeader() {},
            status(code) { this.statusCode = code; return this; },
            json(data) { this.responseData = data; return this; }
        };
        
        await apiBridge(mockReq, mockRes);
        
        console.log(`🧪 [TEST] Respuesta:`, {
            status: mockRes.statusCode,
            dataLength: mockRes.responseData?.data?.length,
            ocupados: mockRes.responseData?.data?.filter(s => s.isBooked).length || 0
        });
        
        res.json(mockRes.responseData);
        
    } catch (error) {
        console.error('🧪 [TEST] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor de test iniciado en http://localhost:${PORT}`);
    console.log(`📄 Test HTML en: http://localhost:${PORT}/test-horarios.html`);
    console.log(`🔗 Test directo en: http://localhost:${PORT}/test-horarios-direct?date=2025-06-27`);
    console.log(`\n🔍 Pasos para diagnosticar:`);
    console.log(`  1. Abre http://localhost:${PORT}/test-horarios-direct?date=2025-06-27`);
    console.log(`  2. Ve si muestra horarios ocupados en la respuesta JSON`);
    console.log(`  3. Si hay ocupados en JSON pero no en frontend → problema en JS del frontend`);
    console.log(`  4. Si no hay ocupados en JSON → problema en backend/BD`);
});

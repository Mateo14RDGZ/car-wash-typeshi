/**
 * API Bridge para Vercel - Función Serverless
 * Versión simplificada para producción
 */

module.exports = async (req, res) => {
  try {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // --- PROTECCIÓN: responder /system/status antes de cualquier import ---
    let endpoint = req.query.endpoint;
    if (!endpoint && req.url) {
      const urlParts = req.url.split('?');
      if (urlParts[1]) {
        const params = new URLSearchParams(urlParts[1]);
        endpoint = params.get('endpoint');
      }
    }
    if (!endpoint) endpoint = '/bookings/available-slots';
    if (endpoint.includes('/system/status')) {
      console.log('[API-BRIDGE] /system/status endpoint called');
      return res.status(200).json({
        status: 'SUCCESS',
        serverTime: new Date().toISOString(),
        environment: 'production',
        message: 'Sistema funcionando en Vercel'
      });
    }
    // --- FIN PROTECCIÓN ---

    // Importar handlers solo si no es /system/status
    const availableSlotsHandler = require('./bookings/available-slots');
    const bookingsHandler = require('./bookings/index');

    // Routing simple para Vercel
    if (endpoint.includes('/bookings/available-slots')) {
      const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
      const date = urlParams.get('date') || req.query.date;
      if (date) req.query.date = date;
      return availableSlotsHandler(req, res);
    }
    if (endpoint === '/bookings') {
      return bookingsHandler(req, res);
    }
    // Default: endpoint no encontrado
    return res.status(404).json({
      status: 'ERROR',
      message: `Endpoint no encontrado: ${endpoint}`,
      availableEndpoints: ['/bookings/available-slots', '/bookings', '/system/status']
    });
  } catch (err) {
    console.error('[API-BRIDGE] ERROR FATAL:', err);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error interno en API Bridge',
      error: err && (err.message || String(err)),
      stack: err && err.stack
    });
  }
};

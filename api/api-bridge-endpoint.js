/**
 * Endpoint específico para /api/api-bridge
 * Función serverless para Vercel
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

    console.log('[API-BRIDGE-ENDPOINT] Request received:', {
      url: req.url,
      method: req.method,
      query: req.query,
      headers: req.headers
    });

    // Extraer endpoint del query
    let endpoint = req.query.endpoint;
    if (!endpoint && req.url) {
      const urlParts = req.url.split('?');
      if (urlParts[1]) {
        const params = new URLSearchParams(urlParts[1]);
        endpoint = params.get('endpoint');
      }
    }
    
    if (!endpoint) endpoint = '/bookings/available-slots';
    
    console.log('[API-BRIDGE-ENDPOINT] Endpoint detected:', endpoint);

    // Responder a /system/status directamente
    if (endpoint.includes('/system/status')) {
      console.log('[API-BRIDGE-ENDPOINT] /system/status endpoint called');
      return res.status(200).json({
        status: 'SUCCESS',
        serverTime: new Date().toISOString(),
        environment: 'production',
        message: 'Sistema funcionando en Vercel - Endpoint específico',
        endpoint: endpoint,
        vercelRegion: process.env.VERCEL_REGION || 'unknown'
      });
    }

    // Para otros endpoints, importar y usar el bridge principal
    try {
      const apiBridge = require('./api-bridge');
      return await apiBridge(req, res);
    } catch (importError) {
      console.error('[API-BRIDGE-ENDPOINT] Error importing main bridge:', importError);
      
      // Fallback directo para available-slots
      if (endpoint.includes('/bookings/available-slots')) {
        return res.status(200).json({
          status: 'SUCCESS',
          message: 'Horarios disponibles (respuesta de emergencia)',
          data: [
            { time: '09:00 - 10:00', start: '09:00', end: '10:00', isBooked: false },
            { time: '10:00 - 11:00', start: '10:00', end: '11:00', isBooked: false },
            { time: '11:00 - 12:00', start: '11:00', end: '12:00', isBooked: false },
            { time: '14:00 - 15:00', start: '14:00', end: '15:00', isBooked: false },
            { time: '15:00 - 16:00', start: '15:00', end: '16:00', isBooked: false },
            { time: '16:00 - 17:00', start: '16:00', end: '17:00', isBooked: false }
          ],
          source: 'fallback',
          emergency: true
        });
      }
      
      return res.status(500).json({
        status: 'ERROR',
        message: 'Error interno en API Bridge',
        error: importError.message,
        endpoint: endpoint
      });
    }
    
  } catch (err) {
    console.error('[API-BRIDGE-ENDPOINT] ERROR FATAL:', err);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Error fatal en endpoint específico',
      error: err && (err.message || String(err)),
      stack: err && err.stack
    });
  }
};

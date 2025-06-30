/**
 * API Bridge para Vercel - Función Serverless
 * Versión simplificada para producción
 */

// Importar handlers directos
const availableSlotsHandler = require('./bookings/available-slots');
const bookingsHandler = require('./bookings/index');

// Función principal del API Bridge para Vercel
module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('API Bridge - Vercel Function Called');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  
  // Extraer endpoint del query string o URL
  let { endpoint } = req.query;
  
  // Si no hay endpoint en query, extraer de la URL
  if (!endpoint && req.url) {
    const urlParts = req.url.split('?');
    if (urlParts[1]) {
      const params = new URLSearchParams(urlParts[1]);
      endpoint = params.get('endpoint');
    }
  }
  
  // Si aún no hay endpoint, usar la URL base
  if (!endpoint) {
    endpoint = '/bookings/available-slots'; // Default
  }
  
  console.log('Endpoint determined:', endpoint);

  // Routing simple para Vercel
  if (endpoint.includes('/bookings/available-slots')) {
    console.log('Routing to available-slots handler');
    
    // Extraer date del query string
    const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
    const date = urlParams.get('date') || req.query.date;
    
    if (date) {
      req.query.date = date;
    }
    
    console.log('Date parameter:', date);
    return availableSlotsHandler(req, res);
  }
  
  if (endpoint === '/bookings') {
    console.log('Routing to bookings handler');
    return bookingsHandler(req, res);
  }
  
  // Sistema de status
  if (endpoint.includes('/system/status')) {
    return res.status(200).json({
      status: 'SUCCESS',
      serverTime: new Date().toISOString(),
      environment: 'production',
      message: 'Sistema funcionando en Vercel'
    });
  }
  
  // Default: endpoint no encontrado
  return res.status(404).json({
    status: 'ERROR',
    message: `Endpoint no encontrado: ${endpoint}`,
    availableEndpoints: ['/bookings/available-slots', '/bookings', '/system/status']
  });
};

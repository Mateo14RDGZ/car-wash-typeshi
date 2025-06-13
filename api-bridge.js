/**
 * API Bridge para Car Wash - Reemplazo de api-proxy.php para Vercel
 * 
 * Este archivo actúa como un puente entre el frontend y el backend,
 * evitando problemas de CORS y Mixed Content en Vercel.
 */

const axios = require('axios');
const { URL } = require('url');

// Opciones de configuración
const CONFIG = {
  // Lista de APIs permitidas (para seguridad)
  allowedApis: [
    'http://localhost:3003/api',
    'https://api.car-wash-typeshi.vercel.app/api',
    'https://car-wash-typeshi.vercel.app/api',
    '/api'  // API relativa
  ],
  // Timeout en milisegundos
  timeout: 15000,
  // Headers por defecto
  defaultHeaders: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  }
};

module.exports = async (req, res) => {
  // Configurar CORS para permitir solicitudes desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  
  // Si es una solicitud OPTIONS, responder inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');

  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Obtener el endpoint y otros parámetros
  const { endpoint } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({
      error: 'Se requiere un parámetro "endpoint"',
      example: '/api-bridge?endpoint=/bookings/available-slots'
    });
  }

  // Información de depuración
  console.log(`[API Bridge] Solicitud recibida para endpoint: ${endpoint}`);
  console.log(`[API Bridge] Método: ${req.method}`);
  
  // Verificar si estamos en producción o desarrollo
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`[API Bridge] Entorno: ${isProduction ? 'Producción' : 'Desarrollo'}`);

  // Determinar la base URL más adecuada
  let baseUrls = isProduction 
    ? ['https://car-wash-typeshi.vercel.app/api', '/api'] 
    : ['http://localhost:3003/api', '/api'];
  
  // Inicializar variables para seguimiento de intentos
  let lastError = null;
  let apiResponse = null;
  
  // Probar cada URL base hasta que una funcione
  for (const baseUrl of baseUrls) {
    const targetUrl = new URL(endpoint, baseUrl.startsWith('http') 
      ? baseUrl 
      : `https://${req.headers.host}${baseUrl}`).toString();
      
    console.log(`[API Bridge] Intentando conectar a: ${targetUrl}`);
    
    try {
      const axiosConfig = {
        method: req.method,
        url: targetUrl,
        headers: {
          ...CONFIG.defaultHeaders,
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
        },
        timeout: CONFIG.timeout,
        validateStatus: status => true, // Aceptar cualquier código de estado
      };
      
      // Añadir datos para métodos POST/PUT
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        axiosConfig.data = req.body;
      }
      
      // Realizar la solicitud
      const response = await axios(axiosConfig);
      
      // Registrar la respuesta
      console.log(`[API Bridge] Respuesta de ${targetUrl}: ${response.status}`);
      
      // Si la solicitud fue exitosa (código 2xx)
      if (response.status >= 200 && response.status < 300) {
        apiResponse = response.data;
        return res.status(response.status).json(apiResponse);
      }
      
      // Si la respuesta no fue exitosa, guardar el error y continuar con la siguiente URL
      lastError = {
        status: response.status,
        data: response.data,
        url: targetUrl
      };
    } catch (error) {
      console.error(`[API Bridge] Error con ${targetUrl}:`, error.message);
      lastError = {
        message: error.message,
        url: targetUrl
      };
      // Continuar con la siguiente URL
    }
  }
  
  // Si llegamos aquí, todas las URLs fallaron
  console.error('[API Bridge] Todas las URLs fallaron:', lastError);
  
  // Respuesta de fallback para horarios disponibles
  if (endpoint.includes('available-slots')) {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay(); // 0 = domingo, 6 = sábado
    
    // Determinar si es fin de semana para horarios diferentes
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Generar slots de fallback
    const fallbackSlots = isWeekend 
      ? [
          { time: '08:30 - 10:00', start: '08:30', end: '10:00', duration: 90, isBooked: false },
          { time: '10:00 - 11:30', start: '10:00', end: '11:30', duration: 90, isBooked: false },
          { time: '11:30 - 13:00', start: '11:30', end: '13:00', duration: 90, isBooked: false }
        ]
      : [
          { time: '08:30 - 10:00', start: '08:30', end: '10:00', duration: 90, isBooked: false },
          { time: '10:00 - 11:30', start: '10:00', end: '11:30', duration: 90, isBooked: false },
          { time: '11:30 - 13:00', start: '11:30', end: '13:00', duration: 90, isBooked: false },
          { time: '14:00 - 15:30', start: '14:00', end: '15:30', duration: 90, isBooked: false },
          { time: '15:30 - 17:00', start: '15:30', end: '17:00', duration: 90, isBooked: false }
        ];
    
    return res.status(200).json({
      status: 'SUCCESS',
      data: fallbackSlots,
      fallback: true,
      message: 'Datos de horarios generados como fallback debido a problemas de conexión con la API principal'
    });
  }
  
  // Respuesta de fallback para reservas (creación)
  if (endpoint === '/bookings' && req.method === 'POST') {
    // Generar ID aleatorio para la reserva
    const bookingId = Math.floor(100000 + Math.random() * 900000);
    
    return res.status(200).json({
      status: 'SUCCESS',
      data: {
        id: bookingId,
        ...req.body,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fallback: true
      },
      message: 'Reserva creada en modo offline. Por favor, confirme por teléfono.'
    });
  }
  
  // Para cualquier otra solicitud, devolver el último error recibido
  return res.status(500).json({
    error: 'No se pudo conectar a ninguna API',
    details: lastError,
    fallback: true,
    timestamp: new Date().toISOString()
  });
};

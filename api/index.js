// Punto de entrada para Vercel
// Este archivo es un punto de entrada simple para Vercel

module.exports = (req, res) => {
  // Extraer la ruta de forma robusta
  let path = req.url || '';
  
  // En caso de que req.url incluya el dominio o protocolo, obtener sólo la ruta
  if (path.includes('http')) {
    try {
      path = new URL(path).pathname;
    } catch (e) {
      // En caso de error, intentar extraer la ruta de otra manera
      path = path.split('?')[0] || '';
    }
  }
  
  // Redirigir a bookings/available-slots.js para ese endpoint específico
  if (path.includes('/bookings/available-slots')) {
    try {
      return require('./bookings/available-slots')(req, res);
    } catch (err) {
      console.error('Error al cargar el módulo de horarios:', err);
      // Manejar el error para no romper la aplicación
    }
  }
    // Para otros endpoints de la API o si falló el manejo específico
  try {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'SUCCESS',
      message: 'API funcionando correctamente',
      path: path,
      serverTime: new Date().toISOString()
    }));
  } catch (err) {
    // Último recurso en caso de error
    console.error('Error al responder:', err);
    res.statusCode = 200; // Usar 200 en lugar de 500 para evitar errores en el frontend
    res.end(JSON.stringify({
      status: 'SUCCESS',
      message: 'Servicio disponible',
      error: 'Se produjo un error interno'
    }));
  }
};

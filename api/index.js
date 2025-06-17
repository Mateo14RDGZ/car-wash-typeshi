// Punto de entrada para Vercel
// Este archivo es un punto de entrada simple para Vercel

module.exports = (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // Redirigir a bookings/available-slots.js para ese endpoint específico
  if (pathname.includes('/bookings/available-slots')) {
    return require('./bookings/available-slots')(req, res);
  }
  
  // Para otros endpoints de la API
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'SUCCESS',
    message: 'API funcionando correctamente',
    endpoint: pathname
  }));
};

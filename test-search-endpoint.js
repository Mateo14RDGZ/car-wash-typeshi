#!/usr/bin/env node

/**
 * Test rápido para verificar la búsqueda de reservas
 */

const http = require('http');

function testSearchEndpoint() {
  console.log('🔍 Probando endpoint de búsqueda de reservas...');
  
  // Datos de prueba usando la reserva de Pedro Martinez
  const searchData = JSON.stringify({
    phone: '+598 99 123 456',
    date: '2025-06-26'
  });
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api-bridge?endpoint=/bookings/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(searchData)
    }
  };
  
  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Headers:', res.headers);
      
      try {
        const result = JSON.parse(responseData);
        console.log('=== RESULTADO DE BÚSQUEDA ===');
        console.log('Status:', result.status);
        console.log('Message:', result.message);
        
        if (result.data && Array.isArray(result.data)) {
          console.log('Reservas encontradas:', result.data.length);
          result.data.forEach((booking, i) => {
            console.log(`Reserva ${i + 1}:`);
            console.log('  ID:', booking.id);
            console.log('  Cliente:', booking.clientName);
            console.log('  Teléfono:', booking.clientPhone);
            console.log('  Fecha:', new Date(booking.date).toLocaleString('es-ES'));
            console.log('  Vehículo:', booking.vehiclePlate);
            console.log('  Servicio:', booking.serviceType);
            console.log('  Precio:', booking.price);
            console.log('  Estado:', booking.status);
            console.log('---');
          });
        } else {
          console.log('❌ No se encontraron reservas o formato incorrecto');
        }
        
      } catch (error) {
        console.error('❌ Error parsing JSON:', error.message);
        console.log('Raw response:', responseData);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });
  
  req.write(searchData);
  req.end();
}

// Ejecutar el test
testSearchEndpoint();

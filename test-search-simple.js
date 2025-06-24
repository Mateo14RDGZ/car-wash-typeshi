#!/usr/bin/env node

/**
 * Test directo para verificar la búsqueda de reservas
 */

const http = require('http');

function testSearch() {
  console.log('🔍 Probando búsqueda de reservas existentes...');
  
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
      
      try {
        const result = JSON.parse(responseData);
        console.log('=== RESULTADO DE BÚSQUEDA ===');
        console.log('Status:', result.status);
        console.log('Message:', result.message);
        
        if (result.data && result.data.length > 0) {
          console.log('✅ Reservas encontradas:', result.data.length);
          result.data.forEach((booking, i) => {
            console.log(`\nReserva ${i + 1}:`);
            console.log('  ID:', booking.id);
            console.log('  Cliente:', booking.clientName);
            console.log('  Teléfono:', booking.clientPhone);
            console.log('  Fecha:', new Date(booking.date).toLocaleString('es-ES'));
            console.log('  Placa:', booking.vehiclePlate);
            console.log('  Servicio:', booking.serviceType);
            console.log('  Precio:', booking.price);
            console.log('  Estado:', booking.status);
          });
        } else {
          console.log('❌ No se encontraron reservas');
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
testSearch();

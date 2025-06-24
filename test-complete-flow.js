#!/usr/bin/env node

/**
 * Test para crear una reserva y verificar los problemas reportados
 */

const http = require('http');

function createTestReservation() {
  console.log('🧪 Creando reserva de prueba...');
    // Datos de prueba para una nueva reserva
  const reservationData = JSON.stringify({
    clientName: 'Juan Pérez Test',
    clientPhone: '+598 99 888 777',
    vehicleType: 'auto',
    vehiclePlate: 'TEST123',
    serviceType: 'basico',
    extras: [],
    date: '2025-06-27T10:00', // Formato correcto con fecha y hora
    price: 1500
  });
    const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api-bridge?endpoint=/bookings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(reservationData)
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
        console.log('=== RESULTADO DE CREACIÓN ===');
        console.log('Status:', result.status);
        console.log('Message:', result.message);
        
        if (result.data) {
          console.log('ID de reserva:', result.data.id);
          console.log('Cliente:', result.data.clientName);
          console.log('Teléfono:', result.data.clientPhone);
          console.log('Fecha:', result.data.date);
          console.log('Horario:', result.data.horario);
        }
        
        // Ahora probar si se puede buscar
        console.log('\n🔍 Probando búsqueda de la reserva recién creada...');
        searchTestReservation();
        
      } catch (error) {
        console.error('❌ Error parsing JSON:', error.message);
        console.log('Raw response:', responseData);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });
  
  req.write(reservationData);
  req.end();
}

function searchTestReservation() {
  const searchData = JSON.stringify({
    phone: '+598 99 888 777',
    date: '2025-06-27'
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
      try {
        const result = JSON.parse(responseData);
        console.log('=== RESULTADO DE BÚSQUEDA ===');
        console.log('Status:', result.status);
        console.log('Message:', result.message);
        
        if (result.data && result.data.length > 0) {
          console.log('✅ Reserva encontrada:', result.data[0].clientName);
          console.log('Teléfono:', result.data[0].clientPhone);
          console.log('Fecha:', new Date(result.data[0].date).toLocaleString('es-ES'));
          
          // Probar slots para esa fecha
          console.log('\n📅 Verificando slots para el 27/06/2025...');
          checkSlots();
        } else {
          console.log('❌ No se encontró la reserva recién creada');
        }
        
      } catch (error) {
        console.error('❌ Error en búsqueda:', error.message);
        console.log('Raw response:', responseData);
      }
    });
  });
  
  req.write(searchData);
  req.end();
}

function checkSlots() {
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api-bridge?endpoint=/bookings/available-slots&date=2025-06-27',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        console.log('=== SLOTS PARA 27/06/2025 ===');
        console.log('Total slots:', result.data.length);
        
        if (result.summary) {
          console.log('Summary:', result.summary);
        }
        
        result.data.forEach((slot, i) => {
          console.log(`Slot ${i + 1}: ${slot.time} - ${slot.isBooked ? '🔒 RESERVADO' : '✅ LIBRE'}`);
        });
        
      } catch (error) {
        console.error('❌ Error checking slots:', error.message);
      }
    });
  });
  
  req.end();
}

// Ejecutar el test
createTestReservation();

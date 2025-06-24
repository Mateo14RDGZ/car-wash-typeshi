/**
 * Script para crear datos de prueba en la base de datos MySQL
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'car_wash_db',
  ssl: {
    rejectUnauthorized: false
  }
};

// Función para generar fechas futuras
function getFutureDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Lista de reservas de prueba para insertar
const sampleBookings = [
  {
    date: getFutureDate(1),
    start_time: '08:30',
    end_time: '10:00',
    clientName: 'Carlos Rodríguez',
    clientPhone: '099123456',
    vehicleType: 'SUV',
    vehiclePlate: 'ABC1234',
    service: 'premium',
    status: 'confirmed'
  },
  {
    date: getFutureDate(1),
    start_time: '10:00',
    end_time: '11:30',
    clientName: 'Laura Martínez',
    clientPhone: '098765432',
    vehicleType: 'Sedan',
    vehiclePlate: 'XYZ5678',
    service: 'basico',
    status: 'pending'
  },
  {
    date: getFutureDate(2),
    start_time: '14:00',
    end_time: '15:30',
    clientName: 'Pedro González',
    clientPhone: '097111222',
    vehicleType: 'Camioneta',
    vehiclePlate: 'DEF5432',
    service: 'detailing',
    status: 'confirmed'
  },
  {
    date: getFutureDate(3),
    start_time: '08:30',
    end_time: '10:00',
    clientName: 'María López',
    clientPhone: '096333444',
    vehicleType: 'Hatchback',
    vehiclePlate: 'GHI7890',
    service: 'premium',
    status: 'pending'
  },
  {
    date: getFutureDate(3),
    start_time: '15:30', 
    end_time: '17:00',
    clientName: 'José Fernández',
    clientPhone: '095555666',
    vehicleType: 'SUV',
    vehiclePlate: 'JKL1011',
    service: 'basico',
    status: 'confirmed'
  }
];

// Función principal para insertar datos de prueba
async function insertSampleData() {
  console.log('🚀 Iniciando inserción de datos de prueba...');
  
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa a MySQL');
    
    // Verificar si la tabla tiene el formato correcto
    try {
      // Intentar obtener las columnas de la tabla
      const [columns] = await connection.execute('SHOW COLUMNS FROM bookings');
        // Verificar si existe la columna start_time, si no, la agregamos
      const hasStartTime = columns.some(col => col.Field === 'start_time');
      if (!hasStartTime) {
        console.log('🔄 Actualizando estructura de tabla para incluir start_time y end_time...');
        await connection.execute('ALTER TABLE bookings ADD COLUMN start_time VARCHAR(10) AFTER date');
        await connection.execute('ALTER TABLE bookings ADD COLUMN end_time VARCHAR(10) AFTER start_time');
        console.log('✅ Estructura de tabla actualizada');
      }
      
      // Verificar si existe la columna service, si no, la agregamos
      const hasService = columns.some(col => col.Field === 'service');
      if (!hasService) {
        console.log('🔄 Actualizando estructura de tabla para incluir service...');
        await connection.execute('ALTER TABLE bookings ADD COLUMN service VARCHAR(50) AFTER vehiclePlate');
        console.log('✅ Columna service agregada');
      }
    } catch (error) {
      console.error('❌ Error al verificar estructura de tabla:', error.message);
    }
    
    // Insertar cada reserva de prueba
    for (const booking of sampleBookings) {
      try {
        const query = `
          INSERT INTO bookings 
          (date, start_time, end_time, clientName, clientPhone, vehicleType, vehiclePlate, service, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
          booking.date, 
          booking.start_time, 
          booking.end_time,
          booking.clientName, 
          booking.clientPhone, 
          booking.vehicleType, 
          booking.vehiclePlate, 
          booking.service, 
          booking.status
        ];
        
        await connection.execute(query, params);
        console.log(`✅ Reserva creada: ${booking.date} ${booking.start_time} - ${booking.clientName}`);
      } catch (error) {
        console.error(`❌ Error al insertar reserva para ${booking.clientName}:`, error.message);
      }
    }
    
    // Verificar las reservas insertadas
    console.log('\n📊 Verificando reservas en la base de datos:');
    const [bookings] = await connection.execute('SELECT * FROM bookings ORDER BY date, start_time');
    
    console.log(`📈 Total de reservas: ${bookings.length}`);
    bookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.date} ${booking.start_time}-${booking.end_time}: ${booking.clientName} (${booking.service})`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('\n🔌 Conexión cerrada');
      } catch (e) {
        console.error('Error al cerrar la conexión:', e);
      }
    }
  }
}

// Ejecutar la función
insertSampleData().then(() => {
  console.log('\n✨ Proceso completado');
}).catch(err => {
  console.error('Error crítico:', err);
});

/**
 * Script para verificar la conexión a MySQL desde Vercel
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

// Función principal para verificar la conexión
async function checkDatabaseConnection() {
  console.log('🔍 Verificando conexión a MySQL...');
  console.log(`🌐 Host: ${dbConfig.host}`);
  console.log(`📁 Base de datos: ${dbConfig.database}`);
  
  let connection;
  
  try {
    // Intentar conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa a MySQL!');
    
    // Verificar que la tabla de reservas existe
    const [rows] = await connection.execute('SHOW TABLES LIKE "bookings"');
    
    if (rows.length > 0) {
      console.log('✅ Tabla de reservas encontrada');
      
      // Contar reservas
      const [bookings] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
      console.log(`📊 Total de reservas en la base de datos: ${bookings[0].count}`);      // Listar próximas reservas (ajustando la consulta según la estructura real de la tabla)
      const [upcoming] = await connection.execute(
        'SELECT * FROM bookings WHERE date >= CURDATE() ORDER BY date LIMIT 5'
      );
      
      console.log('\n📅 Próximas reservas:');
      if (upcoming.length === 0) {
        console.log('   No hay próximas reservas');
      } else {
        upcoming.forEach((booking, index) => {
          console.log(`   ${index + 1}. ${booking.date} ${booking.time} - ${booking.clientName} (${booking.vehicleType})`);
        });
      }
    } else {
      console.log('⚠️ Tabla de reservas no encontrada');
      
      // Crear la tabla de reservas
      console.log('🛠️ Creando tabla de reservas...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          date DATE NOT NULL,
          time VARCHAR(20) NOT NULL,
          clientName VARCHAR(100) NOT NULL,
          clientPhone VARCHAR(20),
          vehicleType VARCHAR(50) NOT NULL,
          vehiclePlate VARCHAR(20) NOT NULL,
          service VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla de reservas creada correctamente');
    }
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Asegúrate de que el servidor MySQL esté en ejecución');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Credenciales incorrectas. Verifica usuario y contraseña');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   La base de datos "${dbConfig.database}" no existe`);
    }
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('🔌 Conexión cerrada');
      } catch (e) {
        console.error('Error al cerrar la conexión:', e);
      }
    }
  }
}

// Ejecutar la verificación
checkDatabaseConnection().then(() => {
  console.log('\n✨ Verificación completada');
}).catch(err => {
  console.error('Error general:', err);
});

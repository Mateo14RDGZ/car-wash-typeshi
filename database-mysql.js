/**
 * 🗄️ BASE DE DATOS MySQL - CAR WASH TYPESHI
 * Configuración y funciones para MySQL
 */

const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'car_wash_typeshi',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
};

console.log('🔗 Configuración MySQL:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    ssl: !!dbConfig.ssl
});

// Pool de conexiones
let pool = null;

// Inicializar pool de conexiones
function initializePool() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
        console.log('✅ Pool de conexiones MySQL creado');
    }
    return pool;
}

// Obtener conexión
async function getConnection() {
    try {
        if (!pool) {
            initializePool();
        }
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error('❌ Error al obtener conexión:', error);
        throw error;
    }
}

// Crear tablas si no existen
async function createTables() {
    const connection = await getConnection();
    
    try {
        // Tabla de servicios
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS services (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                service_type ENUM('basico', 'completo', 'premium') NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                duration INT NOT NULL COMMENT 'Duración en minutos',
                description TEXT,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Tabla de reservas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                booking_date DATE NOT NULL,
                time_slot VARCHAR(20) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                service_id INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id),
                INDEX idx_booking_date (booking_date),
                INDEX idx_status (status)
            )
        `);
        
        console.log('✅ Tablas creadas/verificadas exitosamente');
        
        // Insertar servicios por defecto si no existen
        await insertDefaultServices(connection);
        
    } catch (error) {
        console.error('❌ Error al crear tablas:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Insertar servicios por defecto
async function insertDefaultServices(connection) {
    try {
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM services');
        
        if (rows[0].count === 0) {
            await connection.execute(`
                INSERT INTO services (name, service_type, price, duration, description) VALUES
                ('Lavado Básico', 'basico', 600.00, 90, 'Lavado exterior e interior básico'),
                ('Lavado Completo', 'completo', 1200.00, 120, 'Lavado completo con encerado'),
                ('Lavado Premium', 'premium', 2000.00, 150, 'Lavado premium con tratamiento especial')
            `);
            console.log('✅ Servicios por defecto insertados');
        }
    } catch (error) {
        console.error('❌ Error al insertar servicios por defecto:', error);
    }
}

// ==================== FUNCIONES PÚBLICAS ====================

// Obtener todos los servicios
async function getServices() {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM services WHERE active = TRUE ORDER BY price ASC'
        );
        return rows;
    } catch (error) {
        console.error('❌ Error al obtener servicios:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Obtener servicio por ID
async function getServiceById(id) {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM services WHERE id = ? AND active = TRUE',
            [id]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('❌ Error al obtener servicio:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Crear nueva reserva
async function createBooking(bookingData) {
    const connection = await getConnection();
    try {
        const [result] = await connection.execute(`
            INSERT INTO bookings (name, email, phone, booking_date, time_slot, start_time, end_time, service_id, total_amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [
            bookingData.name,
            bookingData.email,
            bookingData.phone,
            bookingData.booking_date,
            bookingData.time_slot,
            bookingData.start_time,
            bookingData.end_time,
            bookingData.service_id,
            bookingData.total_amount
        ]);
        
        return { id: result.insertId, ...bookingData, status: 'pending' };
    } catch (error) {
        console.error('❌ Error al crear reserva:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Obtener todas las reservas
async function getBookings() {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(`
            SELECT b.*, s.name as service_name, s.service_type 
            FROM bookings b 
            JOIN services s ON b.service_id = s.id 
            ORDER BY b.booking_date DESC, b.start_time DESC
        `);
        return rows;
    } catch (error) {
        console.error('❌ Error al obtener reservas:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Obtener reservas por fecha
async function getBookingsByDate(date) {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(`
            SELECT b.*, s.name as service_name 
            FROM bookings b 
            JOIN services s ON b.service_id = s.id 
            WHERE b.booking_date = ? 
            ORDER BY b.start_time ASC
        `, [date]);
        return rows;
    } catch (error) {
        console.error('❌ Error al obtener reservas por fecha:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Actualizar estado de reserva
async function updateBookingStatus(id, status) {
    const connection = await getConnection();
    try {
        const [result] = await connection.execute(
            'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Eliminar reserva
async function deleteBooking(id) {
    const connection = await getConnection();
    try {
        const [result] = await connection.execute('DELETE FROM bookings WHERE id = ?', [id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('❌ Error al eliminar reserva:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Verificar disponibilidad de horario
async function checkTimeSlotAvailability(date, startTime, endTime) {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(`
            SELECT id FROM bookings 
            WHERE booking_date = ? 
            AND status != 'cancelled'
            AND (
                (start_time < ? AND end_time > ?) OR
                (start_time < ? AND end_time > ?) OR
                (start_time >= ? AND end_time <= ?)
            )
        `, [date, endTime, startTime, startTime, endTime, startTime, endTime]);
        
        return rows.length === 0;
    } catch (error) {
        console.error('❌ Error al verificar disponibilidad:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Inicializar base de datos
async function initializeDatabase() {
    try {
        console.log('🚀 Inicializando base de datos MySQL...');
        await createTables();
        console.log('✅ Base de datos MySQL inicializada correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
        return false;
    }
}

// Cerrar pool de conexiones
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✅ Pool de conexiones cerrado');
    }
}

module.exports = {
    initializeDatabase,
    getServices,
    getServiceById,
    createBooking,
    getBookings,
    getBookingsByDate,
    updateBookingStatus,
    deleteBooking,
    checkTimeSlotAvailability,
    closePool
};

/**
 * 🚀 API PRINCIPAL PARA VERCEL - CAR WASH TYPESHI
 * Usa base de datos MySQL
 * URL: https://car-wash-typeshi.vercel.app/api/
 */

// Cargar variables de entorno solo en desarrollo local
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'interchange.proxy.rlwy.net',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'TsCsBvoAqxhMeYnwDTABpaawMdyLhRaa',
    database: process.env.DB_NAME || 'railway',
    port: parseInt(process.env.DB_PORT) || 16110,
    ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === true ? { rejectUnauthorized: false } : false,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
};

// Pool de conexiones
let pool = null;

// Función para obtener conexión
async function getConnection() {
    // Forzar nueva conexión para refrescar datos
    if (pool) {
        await pool.end();
        pool = null;
    }
    pool = mysql.createPool(dbConfig);
    return pool;
}

// Función principal del handler
module.exports = async (req, res) => {
    console.log('🚀 [API] Procesando:', req.method, req.url);
    
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
        res.setHeader('Content-Type', 'application/json');
        
        // Manejar preflight requests
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        const { url, method, query } = req;
        const path = url.split('?')[0];
        
        // Endpoint: Estado del sistema
        if (path.includes('/status') || query?.endpoint?.includes('status')) {
            try {
                const connection = await getConnection();
                const [rows] = await connection.execute('SELECT COUNT(*) as count FROM services WHERE active = 1');
                const serviceCount = rows[0].count;
                
                res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Car Wash Typeshi - Sistema funcionando correctamente',
                    timestamp: new Date().toISOString(),
                    environment: 'production',
                    version: '1.0.0',
                    database: 'MySQL conectado exitosamente',
                    services: serviceCount
                });
            } catch (error) {
                console.error('Error conectando a MySQL:', error);
                res.status(500).json({
                    status: 'ERROR',
                    message: 'Error de conexión a la base de datos',
                    database: 'MySQL - Error de conexión',
                    error: error.message
                });
            }
            return;
        }
        
        // Endpoint: Servicios disponibles
        if (path.includes('/services') || query?.endpoint?.includes('services')) {
            try {
                const connection = await getConnection();
                const [services] = await connection.execute(
                    'SELECT * FROM services WHERE active = 1 ORDER BY id'
                );
                
                res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Servicios obtenidos exitosamente',
                    data: {
                        services: services
                    }
                });
            } catch (error) {
                console.error('Error obteniendo servicios:', error);
                res.status(500).json({
                    status: 'ERROR',
                    message: 'Error obteniendo servicios de la base de datos',
                    error: error.message
                });
            }
            return;
        }
        
        // Endpoint: Horarios disponibles
        if (path.includes('/available-slots') || query?.endpoint?.includes('available-slots')) {
            const date = query?.date || new URLSearchParams(url.split('?')[1] || '').get('date');
            
            if (!date) {
                res.status(400).json({
                    status: 'ERROR',
                    message: 'Fecha requerida (formato: YYYY-MM-DD)'
                });
                return;
            }
            
            try {
                const connection = await getConnection();
                
                // Generar horarios predefinidos basados en el día de la semana
                const requestDate = new Date(date + 'T00:00:00');
                const dayOfWeek = requestDate.getDay(); // 0 = Domingo, 6 = Sábado
                
                // Definir horarios según el día
                let timeSlots = [];
                if (dayOfWeek === 6) { // Sábado: 8:30 a 13:00
                    timeSlots = [
                        { start: '08:30', end: '10:00', time: '08:30 - 10:00' },
                        { start: '10:00', end: '11:30', time: '10:00 - 11:30' },
                        { start: '11:30', end: '13:00', time: '11:30 - 13:00' }
                    ];
                } else if (dayOfWeek === 0) { // Domingo: cerrado
                    timeSlots = [];
                } else { // Lunes a Viernes: 8:30 a 17:00
                    timeSlots = [
                        { start: '08:30', end: '10:00', time: '08:30 - 10:00' },
                        { start: '10:00', end: '11:30', time: '10:00 - 11:30' },
                        { start: '11:30', end: '13:00', time: '11:30 - 13:00' },
                        { start: '14:00', end: '15:30', time: '14:00 - 15:30' },
                        { start: '15:30', end: '17:00', time: '15:30 - 17:00' }
                    ];
                }
                
                // Verificar disponibilidad contra reservas existentes
                const [existingBookings] = await connection.execute(
                    'SELECT time_slot, start_time FROM bookings WHERE booking_date = ? AND status != ?',
                    [date, 'cancelled']
                );
                
                const bookedSlots = existingBookings.map(booking => booking.time_slot || booking.start_time);
                
                // Marcar disponibilidad
                const availableSlots = timeSlots.map(slot => ({
                    ...slot,
                    available: !bookedSlots.includes(slot.time) && !bookedSlots.includes(slot.start),
                    booked: bookedSlots.includes(slot.time) || bookedSlots.includes(slot.start)
                }));
                
                res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Horarios obtenidos exitosamente',
                    data: {
                        date: date,
                        dayOfWeek: dayOfWeek,
                        availableSlots: availableSlots,
                        totalSlots: availableSlots.length,
                        availableCount: availableSlots.filter(s => s.available).length,
                        bookedSlots: bookedSlots
                    }
                });
            } catch (error) {
                console.error('Error obteniendo horarios disponibles:', error);
                res.status(500).json({
                    status: 'ERROR',
                    message: 'Error obteniendo horarios de la base de datos',
                    error: error.message
                });
            }
            return;
        }
        
        // Endpoint: Reservas
        if (path.includes('/bookings') || query?.endpoint?.includes('bookings')) {
            if (method === 'GET') {
                try {
                    const connection = await getConnection();
                    const [bookings] = await connection.execute(
                        'SELECT * FROM bookings ORDER BY created_at DESC'
                    );
                    
                    res.status(200).json({
                        status: 'SUCCESS',
                        message: 'Reservas obtenidas exitosamente',
                        data: {
                            bookings: bookings
                        }
                    });
                } catch (error) {
                    console.error('Error obteniendo reservas:', error);
                    res.status(500).json({
                        status: 'ERROR',
                        message: 'Error obteniendo reservas de la base de datos',
                        error: error.message
                    });
                }
                return;
            }
            
            if (method === 'POST') {
                let body = '';
                
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                
                req.on('end', async () => {
                    try {
                        const bookingData = JSON.parse(body);
                        const connection = await getConnection();
                        
                        const [result] = await connection.execute(
                            `INSERT INTO bookings (name, email, phone, license_plate, vehicle_type, booking_date, time_slot, start_time, 
                             selected_services, total_price, status, created_at) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                            [
                                bookingData.name,
                                bookingData.email,
                                bookingData.phone,
                                bookingData.license_plate,
                                bookingData.vehicle_type,
                                bookingData.booking_date,
                                bookingData.time_slot,
                                bookingData.start_time,
                                JSON.stringify(bookingData.selected_services),
                                bookingData.total_price
                            ]
                        );
                        
                        const [newBooking] = await connection.execute(
                            'SELECT * FROM bookings WHERE id = ?',
                            [result.insertId]
                        );
                        
                        res.status(201).json({
                            status: 'SUCCESS',
                            message: 'Reserva creada exitosamente',
                            data: {
                                booking: newBooking[0]
                            }
                        });
                    } catch (error) {
                        console.error('Error creando reserva:', error);
                        res.status(400).json({
                            status: 'ERROR',
                            message: 'Error creando la reserva',
                            error: error.message
                        });
                    }
                });
                return;
            }
        }

        // Endpoint: Administrador - Confirmar reserva
        if (path.includes('/admin/bookings/confirm') || query?.endpoint?.includes('admin-confirm')) {
            if (method === 'PUT') {
                let body = '';
                
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                
                req.on('end', async () => {
                    try {
                        const { bookingId } = JSON.parse(body);
                        const connection = await getConnection();
                        
                        await connection.execute(
                            'UPDATE bookings SET status = "confirmed" WHERE id = ?',
                            [bookingId]
                        );
                        
                        const [updatedBooking] = await connection.execute(
                            'SELECT * FROM bookings WHERE id = ?',
                            [bookingId]
                        );
                        
                        res.status(200).json({
                            status: 'SUCCESS',
                            message: 'Reserva confirmada exitosamente',
                            data: {
                                booking: updatedBooking[0]
                            }
                        });
                    } catch (error) {
                        console.error('Error confirmando reserva:', error);
                        res.status(400).json({
                            status: 'ERROR',
                            message: 'Error confirmando la reserva',
                            error: error.message
                        });
                    }
                });
                return;
            }
        }

        // Endpoint: Administrador - Cancelar reserva
        if (path.includes('/admin/bookings/cancel') || query?.endpoint?.includes('admin-cancel')) {
            if (method === 'PUT') {
                let body = '';
                
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                
                req.on('end', async () => {
                    try {
                        const { bookingId } = JSON.parse(body);
                        const connection = await getConnection();
                        
                        await connection.execute(
                            'UPDATE bookings SET status = "cancelled" WHERE id = ?',
                            [bookingId]
                        );
                        
                        const [updatedBooking] = await connection.execute(
                            'SELECT * FROM bookings WHERE id = ?',
                            [bookingId]
                        );
                        
                        res.status(200).json({
                            status: 'SUCCESS',
                            message: 'Reserva cancelada exitosamente',
                            data: {
                                booking: updatedBooking[0]
                            }
                        });
                    } catch (error) {
                        console.error('Error cancelando reserva:', error);
                        res.status(400).json({
                            status: 'ERROR',
                            message: 'Error cancelando la reserva',
                            error: error.message
                        });
                    }
                });
                return;
            }
        }
        
        // Endpoint no encontrado
        res.status(404).json({
            status: 'ERROR',
            message: 'Endpoint no encontrado',
            availableEndpoints: [
                'GET /api/status',
                'GET /api/services',
                'GET /api/available-slots?date=YYYY-MM-DD',
                'GET /api/bookings',
                'POST /api/bookings',
                'PUT /api/admin/bookings/confirm',
                'PUT /api/admin/bookings/cancel'
            ]
        });
        
    } catch (error) {
        console.error('❌ [API] Error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

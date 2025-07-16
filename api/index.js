/**
 * 🚀 API PRINCIPAL PARA VERCEL - CAR WASH TYPESHI
 * Conecta directamente con MySQL
 * URL: https://car-wash-typeshi.vercel.app/api/
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de conexión MySQL
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'car_wash_db',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4'
};

// Pool de conexiones para mejor rendimiento
let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
}

// Función para generar horarios disponibles
function generateTimeSlots(date) {
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();
    
    let slots = [];
    
    if (dayOfWeek === 0) { // Domingo - Cerrado
        slots = [];
    } else if (dayOfWeek === 6) { // Sábado
        slots = [
            { start: '08:30', end: '10:00', timeSlot: '08:30-10:00' },
            { start: '10:00', end: '11:30', timeSlot: '10:00-11:30' },
            { start: '11:30', end: '13:00', timeSlot: '11:30-13:00' }
        ];
    } else { // Lunes a Viernes
        slots = [
            { start: '08:30', end: '10:00', timeSlot: '08:30-10:00' },
            { start: '10:00', end: '11:30', timeSlot: '10:00-11:30' },
            { start: '11:30', end: '13:00', timeSlot: '11:30-13:00' },
            { start: '14:00', end: '15:30', timeSlot: '14:00-15:30' },
            { start: '15:30', end: '17:00', timeSlot: '15:30-17:00' }
        ];
    }
    
    return slots;
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
        const connection = getPool();
        
        // Endpoint: Estado del sistema
        if (path.includes('/status') || query?.endpoint?.includes('status')) {
            try {
                const [rows] = await connection.execute('SELECT COUNT(*) as count FROM services');
                res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Car Wash Typeshi - Sistema funcionando correctamente',
                    timestamp: new Date().toISOString(),
                    environment: 'production',
                    version: '1.0.0',
                    database: 'MySQL conectado',
                    services: rows[0].count
                });
            } catch (error) {
                res.status(500).json({
                    status: 'ERROR',
                    message: 'Error de conexión a la base de datos',
                    error: error.message
                });
            }
            return;
        }
        
        // Endpoint: Servicios disponibles
        if (path.includes('/services') || query?.endpoint?.includes('services')) {
            try {
                const [services] = await connection.execute('SELECT * FROM services WHERE active = 1 ORDER BY price ASC');
                res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Servicios obtenidos exitosamente',
                    data: {
                        services: services
                    }
                });
            } catch (error) {
                res.status(500).json({
                    status: 'ERROR',
                    message: 'Error al obtener servicios',
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
                // Obtener reservas existentes para esa fecha
                const [bookings] = await connection.execute(
                    'SELECT time_slot FROM bookings WHERE booking_date = ? AND status != "cancelled"',
                    [date]
                );
                
                const bookedSlots = bookings.map(booking => booking.time_slot);
                const allSlots = generateTimeSlots(date);
                
                // Marcar disponibilidad
                const availableSlots = allSlots.map(slot => ({
                    ...slot,
                    available: !bookedSlots.includes(slot.timeSlot)
                }));
                
                res.status(200).json({
                    status: 'SUCCESS',
                    message: 'Horarios obtenidos exitosamente',
                    data: {
                        date: date,
                        availableSlots: availableSlots,
                        totalSlots: availableSlots.length,
                        availableCount: availableSlots.filter(s => s.available).length
                    }
                });
            } catch (error) {
                res.status(500).json({
                    status: 'ERROR',
                    message: 'Error al obtener horarios',
                    error: error.message
                });
            }
            return;
        }
        
        // Endpoint: Reservas
        if (path.includes('/bookings') || query?.endpoint?.includes('bookings')) {
            if (method === 'GET') {
                try {
                    const [bookings] = await connection.execute(`
                        SELECT b.*, s.name as service_name, s.price as service_price
                        FROM bookings b
                        LEFT JOIN services s ON b.service_id = s.id
                        ORDER BY b.booking_date DESC, b.start_time ASC
                    `);
                    
                    res.status(200).json({
                        status: 'SUCCESS',
                        message: 'Reservas obtenidas exitosamente',
                        data: {
                            bookings: bookings
                        }
                    });
                } catch (error) {
                    res.status(500).json({
                        status: 'ERROR',
                        message: 'Error al obtener reservas',
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
                        const { name, email, phone, date, timeSlot, serviceType } = bookingData;
                        
                        // Validaciones
                        if (!name || !email || !phone || !date || !timeSlot || !serviceType) {
                            res.status(400).json({
                                status: 'ERROR',
                                message: 'Datos incompletos para crear la reserva',
                                required: ['name', 'email', 'phone', 'date', 'timeSlot', 'serviceType']
                            });
                            return;
                        }
                        
                        // Obtener información del servicio
                        const [services] = await connection.execute(
                            'SELECT * FROM services WHERE service_type = ? AND active = 1',
                            [serviceType]
                        );
                        
                        if (services.length === 0) {
                            res.status(400).json({
                                status: 'ERROR',
                                message: 'Servicio no encontrado'
                            });
                            return;
                        }
                        
                        const service = services[0];
                        
                        // Verificar disponibilidad
                        const [existing] = await connection.execute(
                            'SELECT id FROM bookings WHERE booking_date = ? AND time_slot = ? AND status != "cancelled"',
                            [date, timeSlot]
                        );
                        
                        if (existing.length > 0) {
                            res.status(409).json({
                                status: 'ERROR',
                                message: 'El horario seleccionado no está disponible'
                            });
                            return;
                        }
                        
                        // Crear o encontrar usuario
                        let userId = null;
                        const [existingUser] = await connection.execute(
                            'SELECT id FROM users WHERE email = ?',
                            [email]
                        );
                        
                        if (existingUser.length > 0) {
                            userId = existingUser[0].id;
                        } else {
                            const [userResult] = await connection.execute(
                                'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
                                [name, email, phone]
                            );
                            userId = userResult.insertId;
                        }
                        
                        // Extraer horas del time_slot
                        const [startTime, endTime] = timeSlot.split('-');
                        
                        // Crear reserva
                        const [result] = await connection.execute(`
                            INSERT INTO bookings (
                                user_id, service_id, booking_date, time_slot, start_time, end_time,
                                customer_name, customer_email, customer_phone, total_price, status
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
                        `, [
                            userId, service.id, date, timeSlot, startTime + ':00', endTime + ':00',
                            name, email, phone, service.price
                        ]);
                        
                        const newBooking = {
                            id: result.insertId,
                            user_id: userId,
                            service_id: service.id,
                            booking_date: date,
                            time_slot: timeSlot,
                            customer_name: name,
                            customer_email: email,
                            customer_phone: phone,
                            total_price: service.price,
                            status: 'confirmed',
                            service: service
                        };
                        
                        res.status(201).json({
                            status: 'SUCCESS',
                            message: 'Reserva creada exitosamente',
                            data: {
                                booking: newBooking
                            }
                        });
                        
                    } catch (parseError) {
                        res.status(400).json({
                            status: 'ERROR',
                            message: 'Error al procesar datos de la reserva',
                            error: parseError.message
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
            path: path,
            availableEndpoints: [
                '/api/status',
                '/api/services',
                '/api/available-slots?date=YYYY-MM-DD',
                '/api/bookings'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error en API:', error);
        
        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// API Route para Vercel - Crear Reservas

const { Op } = require('sequelize');
const Booking = require('../../src/database/models/BookingSimple');

module.exports = async (req, res) => {
    console.log('>>> [API BOOKINGS INDEX] Handler ejecutado');
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        if (req.method === 'GET') {
            // Obtener todas las reservas o filtrar por fecha
            const { date } = req.query;
            let where = {};
            if (date) {
                const startOfDay = new Date(date + 'T00:00:00');
                const endOfDay = new Date(date + 'T23:59:59');
                where.date = { [Op.between]: [startOfDay, endOfDay] };
            }
            const reservasFiltradas = await Booking.findAll({ where });
            return res.status(200).json({
                status: 'SUCCESS',
                data: reservasFiltradas
            });
        } else if (req.method === 'POST') {
            // Crear nueva reserva
            const {
                clientName,
                clientPhone,
                date,
                vehicleType,
                vehiclePlate,
                serviceType,
                price,
                extras,
                notes
            } = req.body;
            
            // Validar campos requeridos
            if (!clientName || !date || !vehicleType || !serviceType) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Faltan campos requeridos: clientName, date, vehicleType, serviceType'
                });
            }
            
            // Validar formato de fecha
            let fechaReserva = new Date(date);
            if (isNaN(fechaReserva.getTime())) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Fecha inválida'
                });
            }
            // Forzar hora local (no UTC)
            const [fechaStr, horaStr] = date.split('T');
            if (fechaStr && horaStr) {
                const [h, m] = horaStr.split(':');
                fechaReserva = new Date(
                    Number(fechaStr.split('-')[0]),
                    Number(fechaStr.split('-')[1]) - 1,
                    Number(fechaStr.split('-')[2]),
                    Number(h),
                    Number(m),
                    0, 0
                );
            }
            console.log('📝 Guardando reserva con fecha/hora local:', fechaReserva.toString(), fechaReserva.toISOString());
            
            // Verificar que la fecha no sea en el pasado
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaReserva < hoy) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'No se pueden hacer reservas en fechas pasadas'
                });
            }
            
            // Verificar disponibilidad del horario
            const startOfDay = new Date(fechaReserva.toISOString().split('T')[0] + 'T00:00:00');
            const endOfDay = new Date(fechaReserva.toISOString().split('T')[0] + 'T23:59:59');
            const horaReserva = fechaReserva.getHours().toString().padStart(2, '0') + ':' + 
                              fechaReserva.getMinutes().toString().padStart(2, '0');
            const reservaExistente = await Booking.findOne({
                where: {
                    date: { [Op.between]: [startOfDay, endOfDay] },
                    status: { [Op.in]: ['confirmed', 'pending', 'in_progress'] },
                    [Booking.sequelize.Op.and]: [
                        Booking.sequelize.where(
                            Booking.sequelize.fn('TIME', Booking.sequelize.col('date')),
                            horaReserva
                        )
                    ]
                }
            });
            if (reservaExistente) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'El horario seleccionado ya no está disponible'
                });
            }
            
            // Crear la nueva reserva en la base de datos
            const nuevaReserva = await Booking.create({
                clientName,
                clientPhone: clientPhone || '',
                date: fechaReserva,
                vehicleType,
                vehiclePlate: vehiclePlate || '',
                serviceType,
                price: price || 0,
                extras: extras || [],
                notes: notes || '',
                status: 'confirmed'
            });
            console.log('✅ Reserva guardada en la base de datos:', nuevaReserva.toJSON());
            
            return res.status(201).json({
                status: 'SUCCESS',
                message: 'Reserva creada exitosamente',
                data: nuevaReserva
            });
        } else {
            return res.status(405).json({
                status: 'ERROR',
                message: 'Método no permitido'
            });
        }
    } catch (error) {
        console.error('Vercel - Error en API de reservas:', error);
        
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

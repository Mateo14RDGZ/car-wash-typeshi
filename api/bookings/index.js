// API Route para Vercel - Crear Reservas
// 🔥 VERSIÓN DEFINITIVA - SOLO BASE DE DATOS MYSQL

const { Op } = require('sequelize');
const { Booking } = require('../../src/database/init');

module.exports = async (req, res) => {
    console.log('>>> [API BOOKINGS INDEX] Iniciando - SOLO MYSQL');
    
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        if (req.method === 'GET') {
            // Obtener reservas (filtradas por fecha si se proporciona)
            const { date } = req.query;
            
            let where = {};
            if (date) {
                const startOfDay = new Date(date + 'T00:00:00');
                const endOfDay = new Date(date + 'T23:59:59');
                where.date = { [Op.between]: [startOfDay, endOfDay] };
            }
            
            const reservas = await Booking.findAll({ 
                where,
                order: [['date', 'ASC']] 
            });
            
            console.log('📊 Reservas encontradas:', reservas.length);
            
            return res.status(200).json({
                status: 'SUCCESS',
                data: reservas
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
            
            console.log('📝 Datos recibidos para nueva reserva:', {
                clientName,
                clientPhone,
                date,
                vehicleType,
                vehiclePlate,
                serviceType,
                price
            });
            
            // Validar campos requeridos
            if (!clientName || !date || !vehicleType || !serviceType) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Campos requeridos: clientName, date, vehicleType, serviceType'
                });
            }
            
            // Validar y parsear fecha
            let fechaReserva;
            try {
                fechaReserva = new Date(date);
                if (isNaN(fechaReserva.getTime())) {
                    throw new Error('Fecha inválida');
                }
            } catch (error) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Fecha inválida'
                });
            }
            
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
            
            console.log('🔍 Verificando disponibilidad para:', horaReserva);
            
            const reservaExistente = await Booking.findOne({
                where: {
                    date: { [Op.between]: [startOfDay, endOfDay] },
                    status: { [Op.in]: ['confirmed', 'pending', 'in_progress'] },
                    [Op.and]: [
                        Booking.sequelize.where(
                            Booking.sequelize.fn('TIME', Booking.sequelize.col('date')),
                            horaReserva
                        )
                    ]
                }
            });
            
            if (reservaExistente) {
                console.log('❌ Horario ya ocupado por:', reservaExistente.clientName);
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'El horario seleccionado ya no está disponible'
                });
            }
            
            // Crear la nueva reserva
            console.log('✅ Horario disponible, creando reserva...');
            
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
            
            console.log('✅ Reserva creada exitosamente:', nuevaReserva.id);
            
            const reservaData = nuevaReserva.toJSON();
            
            return res.status(201).json({
                status: 'SUCCESS',
                data: reservaData,
                message: 'Reserva creada exitosamente'
            });
            
        } else {
            return res.status(405).json({
                status: 'ERROR',
                message: 'Método no permitido'
            });
        }
        
    } catch (error) {
        console.error('❌ Error en API bookings:', error);
        
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error al procesar la solicitud en base de datos MySQL',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
};

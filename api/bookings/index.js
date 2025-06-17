// API Route para Vercel - Crear Reservas

// Almacenamiento temporal en memoria para reservas (en producción usarías una BD)
let reservas = [];

export default async function handler(req, res) {
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
            
            let reservasFiltradas = reservas;
            if (date) {
                const fechaBuscada = new Date(date + 'T00:00:00');
                reservasFiltradas = reservas.filter(reserva => {
                    const fechaReserva = new Date(reserva.date);
                    return fechaReserva.toDateString() === fechaBuscada.toDateString();
                });
            }
            
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
            const fechaReserva = new Date(date);
            if (isNaN(fechaReserva.getTime())) {
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
            const fechaStr = fechaReserva.toISOString().split('T')[0];
            const horaReserva = fechaReserva.getHours().toString().padStart(2, '0') + ':' + 
                              fechaReserva.getMinutes().toString().padStart(2, '0');
            
            // Verificar si ya existe una reserva para esa fecha y hora
            const reservaExistente = reservas.find(r => {
                const fechaExistente = new Date(r.date);
                const horaExistente = fechaExistente.getHours().toString().padStart(2, '0') + ':' + 
                                    fechaExistente.getMinutes().toString().padStart(2, '0');
                return fechaExistente.toDateString() === fechaReserva.toDateString() && 
                       horaExistente === horaReserva;
            });
            
            if (reservaExistente) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'El horario seleccionado ya no está disponible'
                });
            }
            
            // Crear la nueva reserva
            const nuevaReserva = {
                id: Date.now().toString(),
                clientName,
                clientPhone: clientPhone || '',
                date: fechaReserva.toISOString(),
                vehicleType,
                vehiclePlate: vehiclePlate || '',
                serviceType,
                price: price || 0,
                notes: notes || '',
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };
            
            reservas.push(nuevaReserva);
            
            console.log('Vercel - Nueva reserva creada:', nuevaReserva.id);
            
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

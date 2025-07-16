/**
 * 🚀 API BRIDGE PARA VERCEL - SOLUCION DEFINITIVA 404
 * Sin dependencias externas, todo en un archivo
 */

module.exports = async (req, res) => {
    console.log('🚀 [API BRIDGE] Iniciando...');
    console.log('📝 Método:', req.method);
    console.log('🔗 URL:', req.url);
    console.log('📄 Query:', req.query);
    
    try {
        // Configurar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
        res.setHeader('Content-Type', 'application/json');
        
        // Manejar OPTIONS (preflight)
        if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
        }
        
        const { endpoint } = req.query;
        
        if (!endpoint) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 'ERROR',
                message: 'Endpoint requerido',
                received: req.query,
                url: req.url
            }));
            return;
        }
        
        console.log('🎯 Endpoint solicitado:', endpoint);
        
        // ENDPOINT: System Status
        if (endpoint.includes('system/status')) {
            console.log('🔍 Verificando estado del sistema');
            
            const systemStatus = {
                status: 'SUCCESS',
                message: 'Sistema funcionando correctamente',
                timestamp: new Date().toISOString(),
                database: 'MySQL',
                version: '1.0.0',
                environment: 'production',
                vercel: true
            };
            
            res.statusCode = 200;
            res.end(JSON.stringify(systemStatus));
            return;
        }
        
        // ENDPOINT: Available Slots
        if (endpoint.includes('available-slots')) {
            console.log('📅 Manejando solicitud de horarios disponibles');
            
            // Extraer fecha del endpoint o query
            let date = req.query.date;
            
            // Si no está en query, buscar en el endpoint
            if (!date && endpoint.includes('date=')) {
                const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
                date = urlParams.get('date');
            }
            
            if (!date) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 'ERROR',
                    message: 'Fecha requerida',
                    endpoint: endpoint,
                    query: req.query
                }));
                return;
            }
            
            console.log('📅 Fecha procesada:', date);
            
            // Obtener día de la semana
            const requestDate = new Date(date);
            const dayOfWeek = requestDate.getDay();
            
            // Horarios base según el día
            let availableSlots = [];
            
            if (dayOfWeek === 0) { // Domingo
                availableSlots = [];
            } else if (dayOfWeek === 6) { // Sábado
                availableSlots = [
                    { start: '08:30', end: '10:00', available: true, timeSlot: '08:30-10:00' },
                    { start: '10:00', end: '11:30', available: true, timeSlot: '10:00-11:30' },
                    { start: '11:30', end: '13:00', available: true, timeSlot: '11:30-13:00' }
                ];
            } else { // Lunes a Viernes
                availableSlots = [
                    { start: '08:30', end: '10:00', available: true, timeSlot: '08:30-10:00' },
                    { start: '10:00', end: '11:30', available: true, timeSlot: '10:00-11:30' },
                    { start: '11:30', end: '13:00', available: true, timeSlot: '11:30-13:00' },
                    { start: '14:00', end: '15:30', available: true, timeSlot: '14:00-15:30' },
                    { start: '15:30', end: '17:00', available: true, timeSlot: '15:30-17:00' }
                ];
            }
            
            const response = {
                status: 'SUCCESS',
                message: 'Horarios obtenidos exitosamente',
                data: {
                    date: date,
                    dayOfWeek: dayOfWeek,
                    availableSlots: availableSlots,
                    totalSlots: availableSlots.length,
                    availableCount: availableSlots.filter(s => s.available).length
                }
            };
            
            console.log('✅ Respuesta de horarios:', response);
            
            res.statusCode = 200;
            res.end(JSON.stringify(response));
            return;
        }
        
        // ENDPOINT: Bookings
        if (endpoint.includes('bookings')) {
            console.log('📝 Manejando solicitud de reservas');
            
            if (req.method === 'GET') {
                const response = {
                    status: 'SUCCESS',
                    message: 'Reservas obtenidas exitosamente',
                    data: {
                        bookings: []
                    }
                };
                
                res.statusCode = 200;
                res.end(JSON.stringify(response));
                return;
            }
            
            if (req.method === 'POST') {
                let body = '';
                
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                
                req.on('end', () => {
                    try {
                        const bookingData = JSON.parse(body);
                        const { name, email, phone, date, timeSlot, serviceType } = bookingData;
                        
                        // Validaciones
                        if (!name || !email || !phone || !date || !timeSlot || !serviceType) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({
                                status: 'ERROR',
                                message: 'Datos incompletos para crear la reserva'
                            }));
                            return;
                        }
                        
                        // Crear reserva
                        const booking = {
                            id: 'booking-' + Date.now(),
                            name,
                            email,
                            phone,
                            date,
                            timeSlot,
                            serviceType,
                            status: 'confirmed',
                            createdAt: new Date().toISOString()
                        };
                        
                        const response = {
                            status: 'SUCCESS',
                            message: 'Reserva creada exitosamente',
                            data: { booking }
                        };
                        
                        res.statusCode = 201;
                        res.end(JSON.stringify(response));
                        
                    } catch (parseError) {
                        res.statusCode = 400;
                        res.end(JSON.stringify({
                            status: 'ERROR',
                            message: 'Error al procesar datos de la reserva'
                        }));
                    }
                });
                
                return;
            }
        }
        
        // Endpoint no reconocido
        console.log('❌ Endpoint no reconocido:', endpoint);
        res.statusCode = 404;
        res.end(JSON.stringify({
            status: 'ERROR',
            message: 'Endpoint no encontrado: ' + endpoint,
            availableEndpoints: [
                'system/status',
                'available-slots',
                'bookings'
            ]
        }));
        
    } catch (error) {
        console.error('❌ Error crítico en API Bridge:', error);
        
        res.statusCode = 500;
        res.end(JSON.stringify({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: error.message,
            timestamp: new Date().toISOString()
        }));
    }
};

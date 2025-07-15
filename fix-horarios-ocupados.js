/**
 * 🔧 CORRECCIÓN: HORARIOS OCUPADOS NO SE MARCAN CORRECTAMENTE
 * 
 * Identificamos que el problema está en la verificación de horarios ocupados.
 * Esta corrección asegura que los horarios ya reservados no aparezcan como disponibles.
 */

// Función para verificar si un horario está ocupado (corregida)
function isSlotBooked(slotStart, bookedTimes) {
    // Verificar si el horario coincide exactamente con alguna reserva
    return bookedTimes.some(bookedTime => {
        return bookedTime === slotStart;
    });
}

// Función para formatear hora correctamente
function formatTimeSlot(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Función corregida para verificar horarios ocupados
async function checkBookedSlotsFixed(date) {
    console.log('🔍 [CORREGIDO] Verificando horarios ocupados para:', date);
    
    try {
        // Importar el modelo correcto
        const { Op } = require('sequelize');
        const Booking = require('../../src/database/models/BookingSimple');
        
        // Crear las fechas de inicio y fin del día
        const startOfDay = new Date(date + 'T00:00:00');
        const endOfDay = new Date(date + 'T23:59:59');

        console.log('🔍 Consultando reservas entre:', startOfDay.toISOString(), 'y', endOfDay.toISOString());

        // Buscar reservas confirmadas
        const bookings = await Booking.findAll({
            where: {
                date: { [Op.between]: [startOfDay, endOfDay] },
                status: { [Op.in]: ['confirmed', 'pending', 'in_progress'] }
            },
            attributes: ['date', 'status', 'clientName', 'serviceType', 'vehiclePlate']
        });

        console.log('📋 Reservas encontradas:', bookings.length);

        // Extraer y formatear horarios ocupados
        const bookedTimes = bookings.map(booking => {
            const bookingDate = new Date(booking.date);
            const formattedTime = formatTimeSlot(bookingDate);
            
            console.log(`  - ${booking.clientName} | ${booking.serviceType} | Hora: ${formattedTime}`);
            
            return formattedTime;
        });

        console.log('⏰ Horarios ocupados (formateados):', bookedTimes);
        
        return bookedTimes;

    } catch (error) {
        console.error('❌ Error al verificar horarios ocupados:', error);
        return [];
    }
}

// Función corregida para generar horarios con disponibilidad
async function generateTimeSlotsWithAvailabilityFixed(date) {
    console.log('🔄 [CORREGIDO] Generando horarios con verificación de disponibilidad para:', date);
    
    try {
        // Importar funciones necesarias
        const { generateBaseTimeSlots } = require('./base-slots-generator');
        
        // Generar horarios base
        const baseSlots = generateBaseTimeSlots(date);
        
        if (baseSlots.length === 0) {
            console.log('⚠️ No hay horarios base para esta fecha');
            return [];
        }

        // Obtener horarios ocupados
        const bookedTimes = await checkBookedSlotsFixed(date);
        
        console.log('🔍 Comparando horarios:');
        console.log('  - Horarios base:', baseSlots.map(s => s.start));
        console.log('  - Horarios ocupados:', bookedTimes);

        // Marcar horarios como ocupados
        const slotsWithAvailability = baseSlots.map(slot => {
            const slotStartTime = slot.start;
            const isBooked = isSlotBooked(slotStartTime, bookedTimes);
            
            console.log(`  📍 ${slot.time}: ${isBooked ? '🔒 OCUPADO' : '🟢 DISPONIBLE'}`);
            
            return {
                ...slot,
                isBooked: isBooked
            };
        });

        // Estadísticas
        const totalSlots = slotsWithAvailability.length;
        const bookedSlots = slotsWithAvailability.filter(s => s.isBooked).length;
        const availableSlots = totalSlots - bookedSlots;

        console.log('📊 ESTADÍSTICAS:');
        console.log(`  📋 Total: ${totalSlots}`);
        console.log(`  🔒 Ocupados: ${bookedSlots}`);
        console.log(`  🟢 Disponibles: ${availableSlots}`);

        return slotsWithAvailability;

    } catch (error) {
        console.error('❌ Error al generar horarios con disponibilidad:', error);
        return [];
    }
}

// Función para probar la corrección
async function probarCorreccion() {
    console.log('🧪 PROBANDO CORRECCIÓN DE HORARIOS OCUPADOS');
    console.log('='.repeat(50));
    
    const fechaPrueba = '2025-07-17';
    
    try {
        const horarios = await generateTimeSlotsWithAvailabilityFixed(fechaPrueba);
        
        console.log('\n📋 RESULTADO DE LA CORRECCIÓN:');
        horarios.forEach((slot, index) => {
            const estado = slot.isBooked ? '🔒 OCUPADO' : '🟢 DISPONIBLE';
            console.log(`  ${index + 1}. ${slot.time} - ${estado}`);
        });
        
        // Verificar que los horarios ocupados no aparezcan como disponibles
        const horariosDisponibles = horarios.filter(h => !h.isBooked);
        console.log(`\n✅ HORARIOS QUE SE MOSTRARÁN AL USUARIO (${horariosDisponibles.length}):`);
        horariosDisponibles.forEach((slot, index) => {
            console.log(`  ${index + 1}. ${slot.time}`);
        });
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

// Exportar funciones
module.exports = {
    checkBookedSlotsFixed,
    generateTimeSlotsWithAvailabilityFixed,
    probarCorreccion
};

// Ejecutar prueba si es llamado directamente
if (require.main === module) {
    probarCorreccion();
}

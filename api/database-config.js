/**
 * 🔧 CONFIGURACIÓN PARA VERCEL - BASE DE DATOS
 * 
 * Sistema de fallback para cuando la base de datos no está disponible
 */

// Función para crear un modelo mock cuando no hay base de datos
function createMockBookingModel() {
    return {
        findAll: async (options) => {
            console.log('⚠️ Usando mock de base de datos - findAll');
            return [];
        },
        create: async (data) => {
            console.log('⚠️ Usando mock de base de datos - create');
            return {
                id: Math.floor(Math.random() * 10000),
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
                toJSON: () => ({ id: Math.floor(Math.random() * 10000), ...data })
            };
        },
        findOne: async (options) => {
            console.log('⚠️ Usando mock de base de datos - findOne');
            return null;
        }
    };
}

// Función para obtener el modelo de booking de forma segura
function getBookingModel() {
    try {
        const Booking = require('../src/database/models/BookingSimple');
        console.log('✅ Modelo BookingSimple cargado correctamente');
        return Booking;
    } catch (error) {
        console.log('⚠️ No se pudo cargar BookingSimple:', error.message);
        console.log('🔄 Usando modelo mock para evitar errores');
        return createMockBookingModel();
    }
}

// Función para verificar si la base de datos está disponible
async function isDatabaseAvailable() {
    try {
        const Booking = getBookingModel();
        if (Booking.findAll) {
            await Booking.findAll({ limit: 1 });
            return true;
        }
        return false;
    } catch (error) {
        console.log('⚠️ Base de datos no disponible:', error.message);
        return false;
    }
}

module.exports = {
    getBookingModel,
    isDatabaseAvailable,
    createMockBookingModel
};

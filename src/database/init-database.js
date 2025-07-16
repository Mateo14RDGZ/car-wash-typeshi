/**
 * 🚀 INICIALIZADOR DE BASE DE DATOS - CAR WASH TYPESHI
 * Script para inicializar la base de datos MySQL
 */

const { sequelize, testConnection, syncDatabase } = require('./config/database');

// Importar modelos
const User = require('./models/UserNew');
const Service = require('./models/ServiceNew');
const Booking = require('./models/BookingNew');

// Configurar relaciones entre modelos
function setupAssociations() {
    // Un usuario puede tener muchas reservas
    User.hasMany(Booking, { foreignKey: 'user_id' });
    Booking.belongsTo(User, { foreignKey: 'user_id' });
    
    // Un servicio puede tener muchas reservas
    Service.hasMany(Booking, { foreignKey: 'service_id' });
    Booking.belongsTo(Service, { foreignKey: 'service_id' });
}

// Insertar datos iniciales
async function seedDatabase() {
    try {
        // Verificar si ya existen servicios
        const existingServices = await Service.count();
        
        if (existingServices === 0) {
            console.log('📦 Insertando servicios iniciales...');
            
            await Service.bulkCreate([
                {
                    name: 'Lavado Básico',
                    description: 'Lavado exterior e interior básico',
                    price: 600.00,
                    duration: 90,
                    service_type: 'basico'
                },
                {
                    name: 'Lavado Premium',
                    description: 'Lavado completo con encerado',
                    price: 1100.00,
                    duration: 90,
                    service_type: 'premium'
                },
                {
                    name: 'Detailing Completo',
                    description: 'Servicio completo de detailing profesional',
                    price: 3850.00,
                    duration: 90,
                    service_type: 'detailing'
                }
            ]);
            
            console.log('✅ Servicios insertados correctamente');
        }
        
        // Mostrar estadísticas
        const stats = {
            users: await User.count(),
            services: await Service.count(),
            bookings: await Booking.count()
        };
        
        console.log('📊 Estadísticas de la base de datos:');
        console.log(`   - Usuarios: ${stats.users}`);
        console.log(`   - Servicios: ${stats.services}`);
        console.log(`   - Reservas: ${stats.bookings}`);
        
    } catch (error) {
        console.error('❌ Error al insertar datos iniciales:', error);
    }
}

// Función principal de inicialización
async function initializeDatabase() {
    try {
        console.log('🚀 Inicializando base de datos...');
        
        // Probar conexión
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        // Configurar asociaciones
        setupAssociations();
        
        // Sincronizar modelos
        await syncDatabase();
        
        // Insertar datos iniciales
        await seedDatabase();
        
        console.log('✅ Base de datos inicializada correctamente');
        
        return {
            success: true,
            models: {
                User,
                Service,
                Booking
            }
        };
        
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para cerrar la conexión
async function closeDatabase() {
    try {
        await sequelize.close();
        console.log('📝 Conexión a la base de datos cerrada');
    } catch (error) {
        console.error('❌ Error al cerrar la conexión:', error);
    }
}

// Exportar funciones y modelos
module.exports = {
    initializeDatabase,
    closeDatabase,
    sequelize,
    models: {
        User,
        Service,
        Booking
    }
};

// Si se ejecuta directamente
if (require.main === module) {
    initializeDatabase()
        .then(result => {
            if (result.success) {
                console.log('🎉 ¡Base de datos lista para usar!');
                process.exit(0);
            } else {
                console.error('💥 Error en la inicialización');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Error fatal:', error);
            process.exit(1);
        });
}

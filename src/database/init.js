const sequelize = require('./config/database');
const Booking = require('./models/BookingSimple');

async function initDatabase() {
    try {
        // Probar la conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // Sincronizar modelos con la base de datos
        // force: true eliminará las tablas existentes y las recreará
        // En producción, usar force: false o migrations
        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados con la base de datos.');

        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        return false;
    }
}

module.exports = { initDatabase, sequelize, Booking };
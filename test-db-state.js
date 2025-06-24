const BookingSimple = require('./src/database/models/BookingSimple');
const sequelize = require('./src/database/config/database');

async function checkDatabaseState() {
    try {
        console.log('🔍 Checking database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        console.log('\n📊 Checking all bookings in database...');
        const allBookings = await BookingSimple.findAll({
            order: [['createdAt', 'DESC']]
        });        console.log(`Found ${allBookings.length} bookings:`);
        allBookings.forEach((booking, index) => {
            console.log(`${index + 1}. ID: ${booking.id}`);
            console.log(`   Date: ${booking.date}`);
            console.log(`   Vehicle: ${booking.vehicleType} - ${booking.vehiclePlate}`);
            console.log(`   Service: ${booking.serviceType} ($${booking.price})`);
            console.log(`   Client: ${booking.clientName} (${booking.clientPhone})`);
            console.log(`   Status: ${booking.status}`);
            console.log(`   Created: ${booking.createdAt}`);
            console.log('   ---');
        });

        // Also check today's bookings specifically
        const today = new Date().toISOString().split('T')[0];
        console.log(`\n📅 Today's bookings (${today}):`);
        const todayBookings = await BookingSimple.findAll({
            where: { date: today }
        });
        
        console.log(`Found ${todayBookings.length} bookings for today`);
        todayBookings.forEach((booking, index) => {
            console.log(`${index + 1}. Time: ${booking.time}, Service: ${booking.service}, Client: ${booking.clientName}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkDatabaseState();

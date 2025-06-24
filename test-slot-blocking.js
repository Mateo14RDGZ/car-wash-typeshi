const axios = require('axios');

async function testSlotBlocking() {
    console.log('🔍 Testing slot blocking logic...');
    
    try {
        // Test with a date that has bookings (June 27, 2025)
        const dateWithBookings = '2025-06-27';
        console.log(`\n📅 Testing slots for ${dateWithBookings} (should have blocked slots):`);        const response1 = await axios.get(`http://localhost:8080/api-bridge?endpoint=/bookings/available-slots&date=${dateWithBookings}`);
        console.log('Response status:', response1.status);
        console.log('Available slots:', JSON.stringify(response1.data, null, 2));
        
        // Test with a date that has no bookings 
        const dateWithoutBookings = '2025-07-01';
        console.log(`\n📅 Testing slots for ${dateWithoutBookings} (should have all slots available):`);
        
        const response2 = await axios.get(`http://localhost:8080/api-bridge?endpoint=/bookings/available-slots&date=${dateWithoutBookings}`);
        console.log('Response status:', response2.status);
        console.log('Available slots:', JSON.stringify(response2.data, null, 2));
        
        // Test specific booking details
        console.log('\n🔍 Checking database for June 27 bookings:');
        console.log('Expected blocked slots:');
        console.log('- 10:00 (2 bookings for this time)');
        
    } catch (error) {
        console.error('❌ Error testing slots:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testSlotBlocking();

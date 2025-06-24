const axios = require('axios');

async function testCompleteReservationFlow() {
    console.log('🧪 Testing complete reservation flow...');
    
    try {
        // Step 1: Check available slots for a future date (should be all available)
        const testDate = '2025-07-05'; // Future Saturday
        console.log(`\n📅 Step 1: Checking available slots for ${testDate}:`);
        
        const response1 = await axios.get(`http://localhost:8080/api-bridge?endpoint=/bookings/available-slots&date=${testDate}`);
        console.log('Available slots BEFORE reservation:');
        console.log(`Total: ${response1.data.summary.total}, Available: ${response1.data.summary.available}, Booked: ${response1.data.summary.booked}`);
        
        // Step 2: Make a reservation for the first available slot
        const availableSlots = response1.data.data.filter(slot => !slot.isBooked);
        if (availableSlots.length === 0) {
            console.log('❌ No available slots found for testing');
            return;
        }
        
        const selectedSlot = availableSlots[0];
        console.log(`\n📝 Step 2: Making reservation for slot: ${selectedSlot.time}`);
          const reservationData = {
            clientName: 'Test User',
            clientPhone: '+598 99 999 999',
            date: testDate + 'T' + selectedSlot.start,
            vehicleType: 'auto',
            vehiclePlate: 'TEST999',
            serviceType: 'basico',
            price: 1500,
            extras: []
        };
        
        const response2 = await axios.post('http://localhost:8080/api-bridge?endpoint=/bookings', reservationData, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Reservation result:', response2.data.message || response2.data.status);
        
        // Step 3: Check available slots again (the reserved slot should now be blocked)
        console.log(`\n📅 Step 3: Checking available slots for ${testDate} AFTER reservation:`);
        
        const response3 = await axios.get(`http://localhost:8080/api-bridge?endpoint=/bookings/available-slots&date=${testDate}`);
        console.log('Available slots AFTER reservation:');
        console.log(`Total: ${response3.data.summary.total}, Available: ${response3.data.summary.available}, Booked: ${response3.data.summary.booked}`);
        
        // Step 4: Verify that the specific slot is now blocked
        const reservedSlot = response3.data.data.find(slot => slot.start === selectedSlot.start);
        if (reservedSlot && reservedSlot.isBooked) {
            console.log(`✅ SUCCESS: Slot ${reservedSlot.time} is now correctly marked as booked!`);
        } else {
            console.log(`❌ FAILURE: Slot ${selectedSlot.time} is still available (should be booked)`);
        }
        
        // Step 5: Verify that other slots are still available
        const stillAvailable = response3.data.data.filter(slot => !slot.isBooked);
        console.log(`📊 Remaining available slots: ${stillAvailable.length}`);
        stillAvailable.forEach(slot => {
            console.log(`   - ${slot.time}`);
        });
        
    } catch (error) {
        console.error('❌ Error in complete flow test:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCompleteReservationFlow();

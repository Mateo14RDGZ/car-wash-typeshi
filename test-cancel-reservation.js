const axios = require('axios');

async function testCancelFlow() {
    console.log('🧪 Testing cancel reservation flow...');
    
    try {
        // Step 1: Search for the reservation we just created
        const testDate = '2025-07-05';
        const testPhone = '+598 99 999 999';
        
        console.log(`\n🔍 Step 1: Searching for reservation on ${testDate} with phone ${testPhone}:`);
        
        const searchResponse = await axios.get(`http://localhost:8080/api-bridge?endpoint=/bookings/search&phone=${encodeURIComponent(testPhone)}&date=${testDate}`);
        
        console.log('Search response status:', searchResponse.status);
        console.log('Found reservations:', searchResponse.data.data.length);
        
        if (searchResponse.data.data.length === 0) {
            console.log('❌ No reservations found to cancel');
            return;
        }
        
        const reservation = searchResponse.data.data[0];
        console.log(`📋 Found reservation: ID ${reservation.id} for ${reservation.clientName}`);
        
        // Step 2: Check slots before cancellation (should show 1 booked)
        console.log(`\n📅 Step 2: Checking slots BEFORE cancellation:`);
        const slotsBeforeCancel = await axios.get(`http://localhost:8080/api-bridge?endpoint=/bookings/available-slots&date=${testDate}`);
        console.log(`Before cancel - Total: ${slotsBeforeCancel.data.summary.total}, Available: ${slotsBeforeCancel.data.summary.available}, Booked: ${slotsBeforeCancel.data.summary.booked}`);
        
        // Step 3: Cancel the reservation
        console.log(`\n❌ Step 3: Cancelling reservation ID ${reservation.id}:`);
        
        const cancelResponse = await axios.put(`http://localhost:8080/api-bridge?endpoint=/bookings/${reservation.id}/cancel`, {
            cancelReason: 'Testing cancel flow'
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Cancel response status:', cancelResponse.status);
        console.log('Cancel result:', cancelResponse.data.message);
        
        // Step 4: Check slots after cancellation (should show 0 booked)
        console.log(`\n📅 Step 4: Checking slots AFTER cancellation:`);
        const slotsAfterCancel = await axios.get(`http://localhost:8080/api-bridge?endpoint=/bookings/available-slots&date=${testDate}`);
        console.log(`After cancel - Total: ${slotsAfterCancel.data.summary.total}, Available: ${slotsAfterCancel.data.summary.available}, Booked: ${slotsAfterCancel.data.summary.booked}`);
        
        // Step 5: Verify the slot is now available again
        if (slotsAfterCancel.data.summary.booked === 0 && slotsAfterCancel.data.summary.available === 3) {
            console.log('✅ SUCCESS: All slots are now available again after cancellation!');
        } else {
            console.log('❌ FAILURE: Slots are not properly available after cancellation');
        }
        
        // Step 6: Verify the reservation no longer appears in search
        console.log(`\n🔍 Step 6: Verifying cancelled reservation doesn't appear in search:`);
        const finalSearchResponse = await axios.get(`http://localhost:8080/api-bridge?endpoint=/bookings/search&phone=${encodeURIComponent(testPhone)}&date=${testDate}`);
        
        const activeReservations = finalSearchResponse.data.data.filter(r => r.status !== 'cancelled');
        console.log(`Active reservations found: ${activeReservations.length}`);
        
        if (activeReservations.length === 0) {
            console.log('✅ SUCCESS: No active reservations found - cancellation working correctly!');
        } else {
            console.log('❌ FAILURE: Active reservations still found after cancellation');
        }
        
    } catch (error) {
        console.error('❌ Error in cancel flow test:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCancelFlow();

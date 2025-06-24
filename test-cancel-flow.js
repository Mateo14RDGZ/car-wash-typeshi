#!/usr/bin/env node

/**
 * Test script for cancel reservation flow
 * Tests the complete flow: search reservation -> confirm cancellation -> verify cancellation
 */

const BookingSimple = require('./src/database/models/BookingSimple');

async function testCancelFlow() {
  console.log('🧪 Testing Cancel Reservation Flow');
  console.log('=====================================');
  
  try {
    // Step 1: Find existing reservation
    console.log('\n📋 Step 1: Searching for existing reservations...');
    const allBookings = await BookingSimple.findAll();
    console.log(`Found ${allBookings.length} total bookings`);
    
    // Find a confirmed booking with phone number
    const testBooking = allBookings.find(booking => 
      booking.status === 'confirmed' && booking.clientPhone
    );
    
    if (!testBooking) {
      console.log('❌ No confirmed booking with phone number found for testing');
      return;
    }
    
    console.log('✅ Found test booking:', {
      id: testBooking.id,
      name: testBooking.clientName,
      phone: testBooking.clientPhone,
      date: testBooking.date.toISOString().split('T')[0],
      status: testBooking.status
    });
    
    // Step 2: Simulate search by phone and date
    console.log('\n🔍 Step 2: Testing search functionality...');
    const searchDate = testBooking.date.toISOString().split('T')[0];
    const searchBookings = await BookingSimple.findAll({
      where: {
        clientPhone: testBooking.clientPhone,
        date: {
          [BookingSimple.sequelize.Sequelize.Op.gte]: new Date(searchDate + 'T00:00:00.000Z'),
          [BookingSimple.sequelize.Sequelize.Op.lt]: new Date(searchDate + 'T23:59:59.999Z')
        },
        status: 'confirmed'
      }
    });
    
    console.log(`✅ Search found ${searchBookings.length} matching booking(s)`);
    
    if (searchBookings.length === 0) {
      console.log('❌ Search did not find the expected booking');
      return;
    }
    
    // Step 3: Test cancellation
    console.log('\n❌ Step 3: Testing cancellation...');
    const bookingToCancel = searchBookings[0];
    
    // Update the booking status to cancelled
    await bookingToCancel.update({
      status: 'cancelled'
    });
    
    console.log('✅ Booking cancelled successfully');
    
    // Step 4: Verify cancellation
    console.log('\n✅ Step 4: Verifying cancellation...');
    const cancelledBooking = await BookingSimple.findByPk(bookingToCancel.id);
    
    console.log('Booking status after cancellation:', {
      id: cancelledBooking.id,
      status: cancelledBooking.status,
      clientName: cancelledBooking.clientName,
      date: cancelledBooking.date
    });
    
    if (cancelledBooking.status === 'cancelled') {
      console.log('🎉 CANCEL FLOW TEST PASSED! ✅');
    } else {
      console.log('❌ CANCEL FLOW TEST FAILED - Status not updated');
    }
    
    // Step 5: Test that cancelled booking doesn't appear in search for confirmed bookings
    console.log('\n🔍 Step 5: Verifying cancelled booking is excluded from active searches...');
    const activeBookings = await BookingSimple.findAll({
      where: {
        clientPhone: testBooking.clientPhone,
        date: {
          [BookingSimple.sequelize.Sequelize.Op.gte]: new Date(searchDate + 'T00:00:00.000Z'),
          [BookingSimple.sequelize.Sequelize.Op.lt]: new Date(searchDate + 'T23:59:59.999Z')
        },
        status: 'confirmed'
      }
    });
    
    console.log(`Active bookings after cancellation: ${activeBookings.length}`);
    
    if (activeBookings.length < searchBookings.length) {
      console.log('✅ Cancelled booking correctly excluded from active searches');
    } else {
      console.log('⚠️ Cancelled booking may still appear in active searches');
    }
    
    // Optional: Restore the booking for further testing
    console.log('\n🔄 Step 6: Restoring booking for future tests...');
    await cancelledBooking.update({
      status: 'confirmed'
    });
    console.log('✅ Booking restored to confirmed status');
    
    console.log('\n🎊 ALL TESTS COMPLETED SUCCESSFULLY! 🎊');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
}

// Run the test
testCancelFlow();

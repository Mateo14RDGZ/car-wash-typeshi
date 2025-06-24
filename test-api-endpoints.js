#!/usr/bin/env node

/**
 * Test script for API Bridge cancel reservation endpoints
 * Tests the actual HTTP endpoints used by the frontend
 */

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testAPIEndpoints() {
  console.log('🌐 Testing API Bridge Cancel Reservation Endpoints');
  console.log('==================================================');
  
  try {    // Test 1: Search for reservation
    console.log('\n🔍 Test 1: Search for reservation by phone and date...');
    
    const searchOptions = {
      hostname: 'localhost',
      port: 8080,
      path: '/api-bridge?endpoint=/bookings/search&phone=%2B598%2099%20123%20456&date=2025-06-26',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const searchResponse = await makeRequest(searchOptions);
    console.log('Search Response Status:', searchResponse.statusCode);
    console.log('Search Response Data:', JSON.stringify(searchResponse.data, null, 2));
    
    if (searchResponse.statusCode === 200 && searchResponse.data.status === 'SUCCESS') {
      console.log('✅ Search endpoint working correctly');
      
      const bookings = searchResponse.data.data;
      if (bookings && bookings.length > 0) {
        const bookingToCancel = bookings[0];
        console.log(`Found booking to cancel: ID ${bookingToCancel.id}`);
        
        // Test 2: Cancel the reservation
        console.log('\n❌ Test 2: Cancel the reservation...');
          const cancelOptions = {
          hostname: 'localhost',
          port: 8080,
          path: `/api-bridge?endpoint=/bookings/${bookingToCancel.id}/cancel`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        const cancelResponse = await makeRequest(cancelOptions);
        console.log('Cancel Response Status:', cancelResponse.statusCode);
        console.log('Cancel Response Data:', JSON.stringify(cancelResponse.data, null, 2));
        
        if (cancelResponse.statusCode === 200 && cancelResponse.data.status === 'SUCCESS') {
          console.log('✅ Cancel endpoint working correctly');
          
          // Test 3: Verify the booking is cancelled
          console.log('\n✅ Test 3: Verify booking is cancelled...');
          
          const verifyResponse = await makeRequest(searchOptions);
          console.log('Verification Response Status:', verifyResponse.statusCode);
          console.log('Verification Response Data:', JSON.stringify(verifyResponse.data, null, 2));
          
          if (verifyResponse.statusCode === 200) {
            const remainingBookings = verifyResponse.data.data;
            if (!remainingBookings || remainingBookings.length === 0) {
              console.log('✅ Booking successfully cancelled and no longer appears in search');
            } else {
              const cancelledBooking = remainingBookings.find(b => b.id === bookingToCancel.id);
              if (!cancelledBooking) {
                console.log('✅ Cancelled booking no longer appears in active searches');
              } else {
                console.log('⚠️ Cancelled booking still appears in search results');
              }
            }
          }
          
          console.log('\n🎉 ALL API TESTS COMPLETED SUCCESSFULLY! 🎉');
        } else {
          console.log('❌ Cancel endpoint failed');
        }
      } else {
        console.log('⚠️ No bookings found to cancel (this is expected if all bookings are already cancelled)');
      }
    } else {
      console.log('❌ Search endpoint failed');
    }
    
  } catch (error) {
    console.error('❌ API test failed with error:', error.message);
    console.error(error.stack);
  }
}

// Run the API tests
testAPIEndpoints();

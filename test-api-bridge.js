const handler = require('./api-bridge');

const req = {
  method: 'GET',
  query: { 
    endpoint: '/bookings/available-slots',
    date: '2025-01-18'
  },
  url: '/api-bridge?endpoint=/bookings/available-slots&date=2025-01-18'
};

const res = {
  setHeader: () => {},
  status: (code) => ({
    json: (data) => {
      console.log('Status:', code);
      console.log('Response:', JSON.stringify(data, null, 2));
      return res;
    },
    end: () => console.log('Response ended')
  })
};

handler(req, res).catch(console.error);

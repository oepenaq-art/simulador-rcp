const handler = require('./api/debrief.js');

const req = {
  method: 'POST',
  body: {
    participante: { nombre: "Test", email: "test@test.com" },
    tiempoTotal: "2:00"
  }
};

const res = {
  setHeader: (k, v) => console.log('SetHeader:', k, v),
  status: (code) => {
    console.log('Status:', code);
    return {
      end: () => console.log('End'),
      json: (data) => console.log('JSON:', data)
    };
  }
};

// You need to set GEMINI_API_KEY environment variable to test properly.
// But even without it, we can see if it throws a synchronous error.

handler(req, res).catch(err => console.error("Unhandled:", err));

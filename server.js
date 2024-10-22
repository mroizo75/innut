const { createServer } = require('http');
const next = require('next');
const SocketIO = require('socket.io');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = SocketIO(server);

  // Lagre Socket.IO-objektet globalt slik at det kan brukes i API-ruter
  global.io = io;

  io.on('connection', (socket) => {
    console.log('En bruker koblet til Socket.IO');

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`Bruker med ID ${userId} har blitt med i rommet.`);
    });

    socket.on('disconnect', () => {
      console.log('En bruker har koblet fra Socket.IO');
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Serveren kjører på http://localhost:${port}`);
  });
});
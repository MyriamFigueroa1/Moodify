const { Server } = require('socket.io');

function createSocket(server) {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('message', (data) => {
      console.log('Mensaje recibido:', data);
      socket.emit('reply', { text: 'Hola desde el servidor' });
    });

    socket.on('mensajeCliente', (data) => {
      console.log('Mensaje recibido del cliente:', data);
  
      // Enviar una respuesta al cliente
      socket.emit('respuestaServidor', { message: 'Hola cliente, recibí tu mensaje' });
    });  

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

  return io; // Devuelve la instancia de Socket.IO
}

module.exports = createSocket;
const socketIo = require('socket.io');

let io;
let activeUsers = new Map();

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: (origin, callback) => {
        // Echo back the requesting origin to satisfy CORS with credentials
        callback(null, origin || true);
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join', (userData) => {
      if (userData && userData._id) {
        activeUsers.set(socket.id, {
          userId: userData._id,
          name: userData.name,
          role: userData.role,
          socketId: socket.id
        });
        
        socket.join(userData._id.toString());
        
        // Broadcast active users update
        io.emit('activeUsersUpdate', Array.from(activeUsers.values()));
        console.log(`👤 User joined: ${userData.name} (${userData.role})`);
      }
    });

    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        activeUsers.delete(socket.id);
        io.emit('activeUsersUpdate', Array.from(activeUsers.values()));
        console.log('👋 User disconnected:', user.name);
      }
    });

    // Typing Indicator
    socket.on('typing', (data) => {
      if (data.recipientId) {
        // Direct chat typing
        socket.to(data.recipientId).emit('user_typing', { 
          userId: data.userId, 
          typing: data.typing,
          isGlobal: false 
        });
      } else {
        // Global chat typing
        socket.broadcast.emit('user_typing', { 
          userId: data.userId, 
          name: data.name,
          typing: data.typing,
          isGlobal: true 
        });
      }
    });

    // Admin Broadcast
    socket.on('adminBroadcast', (data) => {
      const user = activeUsers.get(socket.id);
      if (user && user.role === 'admin') {
        socket.broadcast.emit('receiveBroadcast', {
          message: data.message,
          sender: user.name,
          timestamp: new Date()
        });
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const emitActivity = (type, data) => {
  if (io) {
    io.emit('activity', {
      type,
      data,
      timestamp: new Date()
    });
  }
};

module.exports = { initSocket, getIo, emitActivity };

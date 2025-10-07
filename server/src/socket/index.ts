import { Server as SocketIOServer } from 'socket.io';

export const initializeSocket = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Add more socket event handlers here
  });
};

import { io } from 'socket.io-client';

const SOCKET_URL = 'https://safe-route-navigation.onrender.com'; // Replace with Render backend URL
let socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      // Authenticate
      socket.emit('authenticate', 'mock_jwt_token');
    });

    socket.on('deviation-alert', (data) => {
      alert(`Safety Alert: ${data.message}`);
    });

    socket.on('emergency-alert', (data) => {
        console.log('Global emergency reported nearby', data);
    });
  }
  return socket;
};

export const getSocket = () => socket;

import { io } from 'socket.io-client';

let socket = null;

export const initSocket = async () => {
    // If socket already exists and is connected, return existing socket
    if (socket && socket.connected) {
        console.log('🔌 Reusing existing socket');
        return socket;
    }

    const options = {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        timeout: 10000,
        transports: ['websocket'],
    };

    socket = io('http://localhost:5000', options);

    // Add connection error handling
    socket.on('connect_error', (error) => {
        console.error('🚨 Socket Connection Error:', error);
    });

    // Add reconnection handling
    socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
    });

    return new Promise((resolve, reject) => {
        socket.on('connect', () => {
            console.log('🌐 Socket Connected Successfully');
            resolve(socket);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket Connection Failed:', error);
            reject(error);
        });
    });
};
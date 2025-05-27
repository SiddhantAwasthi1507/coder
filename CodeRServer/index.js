import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Setup WebSocket Server
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (change this in production)
    },
});

const hosts = {};
const userSocketMap = {};
const clientCodes = new Map();
let client = null;

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId] ?? hosts[socketId],
        };
    });
}

function getHostId(roomId) {
    const socketIds = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    for (const socketId of socketIds) {
        if(hosts[socketId]) {
            return { socketId, username: hosts[socketId] };
        }
    }

    console.warn("Host not found");
    return null;
}

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", ({ roomId, username, hostname }) => {
        // console.log("🔌 Socket Join Event:", { 
        //     socketId: socket.id, 
        //     roomId, 
        //     username, 
        //     hostname,
        //     existingHosts: Object.keys(hosts)
        // });

        // Check if this socket is already in the room
        if (socket.rooms.has(roomId)) {
            console.warn("🚧 Socket already in room, skipping duplicate join");
            return;
        }

        // Determine if this is a host or a regular user
        if (!username && hostname) {
            // If a host already exists, log a warning
            const existingHost = getHostId(roomId);
            if (existingHost) {
                console.warn(`🏠 Replacing existing host ${existingHost.socketId} with ${socket.id}`);
            }

            // Update or add host
            hosts[socket.id] = hostname;
        }
        else {
            userSocketMap[socket.id] = username;
        }
        // console.log(`${username || hostname} joined room ${roomId}`);
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        // console.log(clients);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', {
                clients,
                username,
                socketId : socket.id,
            });
        });
        socket.to(roomId).emit("NEW_USER", `${username} has joined!`);
    });

    
    
    //editor code sync
    socket.on('code_changed', ({ roomId, code, socketid }) => {
        const host = getHostId(roomId);

        clientCodes.set(socketid, code);
        if(client === socketid) {
            io.to(host.socketId).emit('client_codes', { code, socketid });
        };
        // console.log(clientCodes);

        // if(host) {
        //     io.to(host.socketId).emit('code_changed', { code, socketid });
        // } else {
        //     console.error("Host not found");
        // }
         
    });

    //teacher_edit
    socket.on('teacher_edit', ({ roomId, code, socketid }) => {
        io.to(client).emit('client_codes', { code, socketid });
    });

    //teacher emitting student
    socket.on('teacher_emit', ({ roomId, code, socketid }) => {
        socket.to(roomId).emit('broad_cast', { code, socketid });
    });


    
    //requesting feature teacher-student
    socket.on('request_clientcode', ({ roomId, targetSocketid, requesterSocketId }) => {
        // Verify room existence
        const roomClients = io.sockets.adapter.rooms.get(roomId);
        if (!roomClients) {
            console.error("❌ Room does not exist:", roomId);
            return;
        }
    
        // Find the current host for the room
        const host = getHostId(roomId);
        
        // Verify host and request origin
        const isValidHostRequest = host && 
            (host.socketId === socket.id || host.socketId === requesterSocketId);
    
        if (isValidHostRequest) {
            // Get the code of the specific client only
            client = targetSocketid;
            const clientCode = clientCodes.get(targetSocketid) || 'No code available';
    
            // Emit ONLY the selected client's code to the requester (host)
            io.to(host.socketId).emit('client_codes', { 
                code: clientCode,  
                sourceSocketId: targetSocketid  
            });
        } else {
            console.error("❌ Host Verification Failed", { 
                hostSocketId: host?.socketId, 
                currentSocketId: socket.id,
                requesterSocketId
            });
        }
    });
    



    //Chatting feature
    socket.on('send_chat_message', ( messageData ) => {
        socket.to(messageData.roomId).emit('receive_chat_message', {
            messageData
        });
        // console.log("📤 Chat Message Sent:", {
        //     messageData,
        //     timestamp: new Date().toISOString()
        // });
    });
    
    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit("disconnected", {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

// Define a simple route to prevent "Cannot GET /"
app.get("/", (req, res) => {
    res.send("Server is running! WebSocket is ready.");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

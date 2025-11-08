const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const DrawingStateManager = require('./drawing-state');
const RoomManager = require('./rooms');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Initialize managers
const roomManager = new RoomManager();
const stateManager = new DrawingStateManager();

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// User colors
const USER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

function getUserColor(index) {
    return USER_COLORS[index % USER_COLORS.length];
}

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);
    
    const userId = socket.id;
    const roomId = 'default'; // Using single room for now
    
    // Join room
    socket.join(roomId);
    roomManager.addUser(roomId, userId);
    
    // Assign color to user
    const userIndex = roomManager.getUserIndex(roomId, userId);
    const userColor = getUserColor(userIndex);
    
    console.log(`👤 User ${userId} joined room ${roomId} (${roomManager.getUserCount(roomId)} users)`);
    
    // Send current canvas state to new user
    const currentState = stateManager.getState(roomId);
    socket.emit('init-state', {
        operations: currentState.operations,
        users: roomManager.getUsers(roomId).map((id, idx) => ({
            userId: id,
            color: getUserColor(idx),
            name: id === userId ? 'You' : `User ${idx + 1}`
        }))
    });
    
    // Notify others of new user
    socket.to(roomId).emit('user-joined', {
        userId: userId,
        color: userColor,
        name: `User ${userIndex + 1}`
    });
    
    // Handle drawing events
    socket.on('draw', (data) => {
        const operation = {
            id: `${userId}_${Date.now()}`,
            type: 'draw',
            userId: userId,
            data: data.pathData,
            timestamp: Date.now()
        };
        
        stateManager.addOperation(roomId, operation);
        
        // Broadcast to all other users in room
        socket.to(roomId).emit('draw', {
            userId: userId,
            pathData: data.pathData,
            timestamp: operation.timestamp
        });
        
        console.log(`✏️  User ${userId} drew (${data.pathData.points.length} points)`);
    });
    
    // Handle cursor movement
    socket.on('cursor-move', (data) => {
        socket.to(roomId).emit('cursor-move', {
            userId: userId,
            position: data.position
        });
    });
    
    // Handle undo
    socket.on('undo', (data) => {
        const result = stateManager.undo(roomId);
        if (result.success) {
            // Broadcast undo to all users including sender
            io.to(roomId).emit('undo', {
                userId: userId,
                timestamp: Date.now()
            });
            console.log(`↩️  User ${userId} performed undo`);
        }
    });
    
    // Handle redo
    socket.on('redo', (data) => {
        const result = stateManager.redo(roomId);
        if (result.success) {
            // Broadcast redo to all users including sender
            io.to(roomId).emit('redo', {
                userId: userId,
                timestamp: Date.now()
            });
            console.log(`↪️  User ${userId} performed redo`);
        }
    });
    
    // Handle clear canvas
    socket.on('clear', (data) => {
        stateManager.clear(roomId);
        
        // Broadcast clear to all users
        io.to(roomId).emit('clear', {
            userId: userId
        });
        
        console.log(`🗑️  User ${userId} cleared canvas`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        
        roomManager.removeUser(roomId, userId);
        
        // Notify others
        socket.to(roomId).emit('user-left', {
            userId: userId
        });
        
        // Clean up empty rooms
        if (roomManager.getUserCount(roomId) === 0) {
            stateManager.clearRoom(roomId);
            console.log(`🧹 Room ${roomId} cleaned up (empty)`);
        }
        
        console.log(`👥 Remaining users in ${roomId}: ${roomManager.getUserCount(roomId)}`);
    });
});

// Error handling
server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Start server
server.listen(PORT, () => {
    console.log(`
                                                        
   Collaborative Canvas Server                       
                                                        
   Server running on: http://localhost:${PORT}       
   WebSocket ready                                   
   Ready for connections                             
                                                        
    `);
});
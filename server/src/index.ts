import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://hackumbcgamemash.web.app"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Hackathon Game Server Running!' });
});

// Game sessions storage
const gameSessions = new Map();
const connectedPlayers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle player joining a game session
  socket.on('join-session', (data) => {
    const { sessionId, playerName, deviceType } = data;
    
    // Join the socket to the session room
    socket.join(sessionId);
    
    // Store player info
    connectedPlayers.set(socket.id, {
      sessionId,
      playerName,
      deviceType, // 'main-display' or 'controller'
      socketId: socket.id
    });
    
    // Get or create session
    if (!gameSessions.has(sessionId)) {
      gameSessions.set(sessionId, {
        players: [],
        interactions: [],
        startTime: new Date()
      });
    }
    
    const session = gameSessions.get(sessionId);
    session.players.push({
      socketId: socket.id,
      playerName,
      deviceType,
      joinedAt: new Date()
    });
    
    console.log(`${deviceType} "${playerName}" joined session ${sessionId}`);
    
    // Notify all devices in the session
    io.to(sessionId).emit('player-joined', {
      playerName,
      deviceType,
      totalPlayers: session.players.length
    });
    
    // Send current session state to the new player
    socket.emit('session-state', {
      sessionId,
      players: session.players,
      recentInteractions: session.interactions.slice(-10)
    });
  });
  
  // Handle button presses from mobile controllers
  socket.on('button-press', (data) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;
    
    const { sessionId } = player;
    const session = gameSessions.get(sessionId);
    if (!session) return;
    
    // Create interaction record
    const interaction = {
      playerId: socket.id,
      playerName: player.playerName,
      action: 'button-press',
      data: data,
      timestamp: new Date(),
      id: Math.random().toString(36).substring(7)
    };
    
    // Store interaction
    session.interactions.push(interaction);
    
    console.log(`Button press from ${player.playerName}:`, data);
    
    // Broadcast to all devices in the session
    io.to(sessionId).emit('interaction', interaction);
  });
  
  // Handle game actions
  socket.on('game-action', (data) => {
    const player = connectedPlayers.get(socket.id);
    if (!player) return;
    
    const { sessionId } = player;
    
    // Broadcast action to all devices in the session
    io.to(sessionId).emit('game-action', {
      playerId: socket.id,
      playerName: player.playerName,
      action: data,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    const player = connectedPlayers.get(socket.id);
    if (player) {
      const { sessionId, playerName } = player;
      
      // Remove from session
      const session = gameSessions.get(sessionId);
      if (session) {
        session.players = session.players.filter((p: any) => p.socketId !== socket.id);
        
        // Notify others in the session
        io.to(sessionId).emit('player-left', {
          playerName,
          totalPlayers: session.players.length
        });
      }
      
      connectedPlayers.delete(socket.id);
      console.log(`${playerName} disconnected from session ${sessionId}`);
    }
    
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
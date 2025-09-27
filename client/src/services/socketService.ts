import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    // Use localhost for development, deployed server for production
    this.serverUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : 'https://your-server-url.com'; // We'll update this when we deploy the server
  }

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl);
      
      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
        resolve(this.socket!);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a game session
  joinSession(sessionId: string, playerName: string, deviceType: 'main-display' | 'controller') {
    if (!this.socket) throw new Error('Not connected to server');
    
    this.socket.emit('join-session', {
      sessionId,
      playerName,
      deviceType
    });
  }

  // Send button press from mobile controller
  sendButtonPress(data: any) {
    if (!this.socket) throw new Error('Not connected to server');
    
    this.socket.emit('button-press', data);
  }

  // Send general game action
  sendGameAction(action: any) {
    if (!this.socket) throw new Error('Not connected to server');
    
    this.socket.emit('game-action', action);
  }

  // Listen for events
  onPlayerJoined(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('player-joined', callback);
  }

  onPlayerLeft(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('player-left', callback);
  }

  onInteraction(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('interaction', callback);
  }

  onGameAction(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('game-action', callback);
  }

  onSessionState(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('session-state', callback);
  }

  // Remove listeners
  removeAllListeners() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService;
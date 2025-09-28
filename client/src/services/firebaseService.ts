import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, off, remove, set } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "development-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "hackumbcgamemash.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://hackumbcgamemash-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "hackumbcgamemash",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "hackumbcgamemash.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "development-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

interface Player {
  socketId: string;
  playerName: string;
  deviceType: 'main-display' | 'controller';
  joinedAt: number;
}

interface Interaction {
  id: string;
  playerId: string;
  playerName: string;
  action: string;
  data: any;
  timestamp: number;
}

class FirebaseService {
  private sessionId: string = '';
  private playerId: string = '';
  private playerName: string = '';

  // Initialize session
  async initializeSession(sessionId: string, playerName: string, deviceType: 'main-display' | 'controller') {
    try {
      this.sessionId = sessionId;
      this.playerName = playerName;
      this.playerId = Math.random().toString(36).substring(7);

      // Add player to session
      const playerData: Player = {
        socketId: this.playerId,
        playerName,
        deviceType,
        joinedAt: Date.now()
      };

      // Use push to add player to the players list
      const playersRef = ref(database, `sessions/${sessionId}/players`);
      const result = await push(playersRef, playerData);
      
      console.log('Player added to Firebase:', playerData);
      return result;
    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    }
  }

  // Send button press or game action
  async sendInteraction(action: string, data: any) {
    try {
      if (!this.sessionId || !this.playerId) {
        console.error('❌ Firebase service not initialized:', { sessionId: this.sessionId, playerId: this.playerId });
        throw new Error('Session not initialized');
      }

      const interactionRef = ref(database, `sessions/${this.sessionId}/interactions`);
      const interaction: Omit<Interaction, 'id'> = {
        playerId: this.playerId,
        playerName: this.playerName,
        action,
        data,
        timestamp: Date.now()
      };

      console.log('🔥 Sending interaction to Firebase:', interaction);
      console.log('🔥 Firebase path:', `sessions/${this.sessionId}/interactions`);
      const result = await push(interactionRef, interaction);
      console.log('🔥 Firebase push result:', result.key);
      return result;
    } catch (error) {
      console.error('❌ Error sending interaction:', error);
      throw error;
    }
  }

  // Listen for players joining/leaving
  onPlayersChange(callback: (players: Player[]) => void) {
    if (!this.sessionId) return;

    const playersRef = ref(database, `sessions/${this.sessionId}/players`);
    
    console.log('Setting up players listener for session:', this.sessionId);
    
    const unsubscribe = onValue(playersRef, (snapshot) => {
      console.log('Players data received:', snapshot.val());
      
      const players: Player[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          players.push(childSnapshot.val() as Player);
        });
      }
      
      console.log('Processed players:', players);
      callback(players);
    });

    return unsubscribe;
  }

  // Listen for interactions (button presses, etc.)
  onInteractions(callback: (interaction: Interaction & { id: string }) => void) {
    if (!this.sessionId) return;

    const interactionsRef = ref(database, `sessions/${this.sessionId}/interactions`);
    
    const unsubscribe = onValue(interactionsRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const interaction = childSnapshot.val() as Interaction;
        callback({
          ...interaction,
          id: childSnapshot.key || ''
        });
      });
    }, {
      onlyOnce: false // Listen for all changes
    });

    return unsubscribe;
  }

  // Listen for new interactions only
  onNewInteractions(callback: (interaction: Interaction & { id: string }) => void) {
    if (!this.sessionId) {
      console.error('❌ Cannot set up listener: no sessionId');
      return;
    }

    const interactionsRef = ref(database, `sessions/${this.sessionId}/interactions`);
    
    console.log('🔥 Setting up interaction listener for session:', this.sessionId);
    console.log('🔥 Firebase path for listener:', `sessions/${this.sessionId}/interactions`);
    
    const processedInteractions = new Set<string>();
    
    const unsubscribe = onValue(interactionsRef, (snapshot) => {
      console.log('🔥 Interactions data received:', snapshot.val());
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const interactionId = childSnapshot.key || '';
          
          // Only process new interactions
          if (!processedInteractions.has(interactionId)) {
            processedInteractions.add(interactionId);
            
            const interaction = childSnapshot.val() as Interaction;
            console.log('🔥 Processing NEW interaction:', interaction);
            callback({
              ...interaction,
              id: interactionId
            });
          } else {
            console.log('🔥 Skipping already processed interaction:', interactionId);
          }
        });
      } else {
        console.log('🔥 No interactions found in snapshot');
      }
    }, (error) => {
      console.error('❌ Firebase listener error:', error);
    });

    return unsubscribe;
  }

  // Get session state (for initial load)
  async getSessionState() {
    if (!this.sessionId) return null;

    const sessionRef = ref(database, `sessions/${this.sessionId}`);
    
    return new Promise((resolve) => {
      onValue(sessionRef, (snapshot) => {
        resolve(snapshot.val());
      }, {
        onlyOnce: true
      });
    });
  }

  // Clean up when player leaves
  cleanup() {
    if (this.sessionId && this.playerId) {
      // Remove player from session
      const playerRef = ref(database, `sessions/${this.sessionId}/players/${this.playerId}`);
      remove(playerRef);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.sessionId) {
      const playersRef = ref(database, `sessions/${this.sessionId}/players`);
      const interactionsRef = ref(database, `sessions/${this.sessionId}/interactions`);
      off(playersRef);
      off(interactionsRef);
    }
  }

  // Helper to check if connected
  isConnected(): boolean {
    return this.sessionId !== '' && this.playerId !== '';
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getPlayerId(): string {
    return this.playerId;
  }

  // Test Firebase connection
  async testConnection() {
    try {
      console.log('🔥 Testing Firebase connection...');
      console.log('Database URL:', process.env.REACT_APP_FIREBASE_DATABASE_URL);
      console.log('Project ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID);
      
      const testRef = ref(database, 'test');
      console.log('📝 Attempting to write test data...');
      
      const result = await push(testRef, { 
        message: 'test', 
        timestamp: Date.now(),
        source: 'web-app'
      });
      
      console.log('✅ Firebase write successful:', result.key);
      
      // Try to read back the data
      console.log('📖 Attempting to read test data...');
      const snapshot = await new Promise((resolve, reject) => {
        onValue(testRef, resolve, reject, { onlyOnce: true });
      });
      
      console.log('✅ Firebase read successful:', snapshot);
      console.log('✅ Firebase connection test successful');
      return true;
    } catch (error: any) {
      console.error('❌ Firebase connection test failed:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      return false;
    }
  }
}

const firebaseService = new FirebaseService();
export default firebaseService;
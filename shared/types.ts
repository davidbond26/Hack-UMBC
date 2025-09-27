// Shared types between client and server

export interface Player {
  id: string;
  name: string;
  socketId: string;
  gameStats: GameStats;
}

export interface GameStats {
  [gameName: string]: any;
}

export interface GameSession {
  id: string;
  players: Player[];
  currentGame: string | null;
  gameHistory: GameResult[];
  status: 'waiting' | 'playing' | 'finished';
}

export interface GameResult {
  gameName: string;
  playerId: string;
  score: number;
  stats: any;
  completedAt: Date;
}

export interface BingoSquare {
  id: string;
  text: string;
  completed: boolean;
  requirement: {
    type: 'stat' | 'achievement' | 'easter_egg';
    condition: any;
  };
}

export interface BingoBoard {
  squares: BingoSquare[];
  playerId: string;
}

// Socket event types
export interface SocketEvents {
  // Client to server
  joinGame: (sessionId: string, playerName: string) => void;
  gameAction: (action: any) => void;
  
  // Server to client
  gameUpdate: (gameState: any) => void;
  playerJoined: (player: Player) => void;
  gameStarted: (gameName: string) => void;
  gameEnded: (results: GameResult[]) => void;
}
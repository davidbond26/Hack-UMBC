import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BaseController from './controllers/BaseController';
import JumpGameController from './controllers/JumpGameController';
import TapGameController from './controllers/TapGameController';
import WordGameController from './controllers/WordGameController';



type GameType = 'none' | 'jump' | 'tap' | 'word';

interface GameState {
  currentGame: GameType;
  gameData?: any;
}

const Controller: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    currentGame: 'none'
  });

  useEffect(() => {
    console.log('Controller loaded for session:', sessionId);
    // TODO: Connect to Socket.io here
  }, [sessionId]);

  const handleJoinGame = () => {
    if (playerName.trim()) {
      setIsConnected(true);
      // TODO: Send join request via Socket.io
      console.log('Player joined:', playerName, 'Session:', sessionId);
    }
  };

  const handleGameAction = (action: any) => {
    console.log('Game action:', action);
    // TODO: Send action via Socket.io to main game
  };

  // Temporary function to test switching (will be replaced by Socket.io events)
  const switchGame = (gameType: GameType) => {
    setGameState({ currentGame: gameType });
  };

  const renderGameController = () => {
    const baseProps = {
      playerName,
      sessionId: sessionId || '',
      onGameAction: handleGameAction
    };

    switch (gameState.currentGame) {
      case 'jump':
        return <JumpGameController {...baseProps} />;
      case 'tap':
        return <TapGameController {...baseProps} />;
      case 'word':
        return <WordGameController {...baseProps} currentPrompt={gameState.gameData?.prompt} />;
      case 'none':
      default:
        return <BaseController {...baseProps} />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-4">Join Game</h1>
          <p className="text-center text-gray-600 mb-6">Session: {sessionId}</p>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleJoinGame}
            disabled={!playerName.trim()}
            className={`w-full p-4 text-lg font-bold rounded-lg ${
              playerName.trim()
                ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white transition-colors`}
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {renderGameController()}

      {/* Temporary dev controls - remove in production */}
      <div className="fixed bottom-3 left-3 right-3 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs">
        <p className="mb-2">Dev Controls (will be removed):</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => switchGame('none')}
            className="bg-gray-600 px-2 py-1 rounded text-white hover:bg-gray-500"
          >
            Base
          </button>
          <button
            onClick={() => switchGame('jump')}
            className="bg-red-600 px-2 py-1 rounded text-white hover:bg-red-500"
          >
            Jump
          </button>
          <button
            onClick={() => switchGame('tap')}
            className="bg-blue-600 px-2 py-1 rounded text-white hover:bg-blue-500"
          >
            Tap
          </button>
          <button
            onClick={() => switchGame('word')}
            className="bg-green-600 px-2 py-1 rounded text-white hover:bg-green-500"
          >
            Word
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controller;
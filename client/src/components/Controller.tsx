import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BaseController from './controllers/BaseController';
import JumpGameController from './controllers/JumpGameController';
import TapGameController from './controllers/TapGameController';
import WordGameController from './controllers/WordGameController';
import './styles.css';

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
      <div className="controller-join">
        <h1>Join Game</h1>
        <p>Session: {sessionId}</p>
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="player-name-input"
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid #ddd',
            marginBottom: '15px'
          }}
        />
        <button
          onClick={handleJoinGame}
          disabled={!playerName.trim()}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: playerName.trim() ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: playerName.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          Join Game
        </button>
      </div>
    );
  }

  return (
    <div className="controller-interface">
      {renderGameController()}

      {/* Temporary dev controls - remove in production */}
      <div className="dev-controls" style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <p>Dev Controls (will be removed):</p>
        <button onClick={() => switchGame('none')} style={{margin: '2px', padding: '5px'}}>Base</button>
        <button onClick={() => switchGame('jump')} style={{margin: '2px', padding: '5px'}}>Jump</button>
        <button onClick={() => switchGame('tap')} style={{margin: '2px', padding: '5px'}}>Tap</button>
        <button onClick={() => switchGame('word')} style={{margin: '2px', padding: '5px'}}>Word</button>
      </div>
    </div>
  );
};

export default Controller;
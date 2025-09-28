import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MemoryGameController from './controllers/MemoryGameController';
import BaseController from './controllers/BaseController';
import JumpGameController from './controllers/JumpGameController';
import TapGameController from './controllers/TapGameController';
import WordGameController from './controllers/WordGameController';
import PlatformerGameController from './controllers/PlatformerGameController';
import firebaseService from '../services/firebaseService';

type GameType = 'none' | 'jump' | 'tap' | 'word' | 'memory' | 'platformer';

interface GameState {
  currentGame: GameType;
  gameData?: any;
}

const Controller: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentGame: 'memory' // Default to memory game
  });

  const handleJoinGame = async () => {
    if (playerName.trim() && sessionId) {
      try {
        console.log('📱 Controller attempting to join session:', sessionId, 'as', playerName);
        await firebaseService.initializeSession(sessionId, playerName, 'controller');
        setIsConnected(true);
        console.log('✅ Player joined successfully:', playerName, 'Session:', sessionId);
      } catch (error) {
        console.error('❌ Failed to join game:', error);
      }
    } else {
      console.log('❌ Missing playerName or sessionId:', { playerName, sessionId });
    }
  };

  const handleGameAction = async (action: any) => {
    try {
      console.log('📱 Controller sending action:', action);
      await firebaseService.sendInteraction(action.type, action.data);
      console.log('✅ Game action sent successfully:', action);
    } catch (error) {
      console.error('❌ Failed to send game action:', error);
    }
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
      case 'memory':
        return <MemoryGameController {...baseProps} />;
      case 'platformer':
        return <PlatformerGameController {...baseProps} />;
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

  useEffect(() => {
    return () => {
      firebaseService.cleanup();
    };
  }, []);

  if (!isConnected) {
    return (
      <div style={{
        backgroundColor: '#aedfff',
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ color: '#347ee1', textAlign: 'center', marginBottom: '20px' }}>Join Game</h1>
          <p style={{ color: '#2c5aa0', textAlign: 'center', marginBottom: '20px' }}>
            Session: {sessionId}
          </p>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              marginBottom: '15px',
              boxSizing: 'border-box'
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
              backgroundColor: playerName.trim() ? '#347ee1' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: playerName.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {renderGameController()}

      {/* Temporary dev controls - remove in production */}
      <div style={{
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
        <p style={{ marginBottom: '8px' }}>Dev Controls (will be removed):</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => switchGame('memory')} 
            style={{
              margin: '2px', 
              padding: '5px 10px',
              backgroundColor: gameState.currentGame === 'memory' ? '#347ee1' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Memory
          </button>
          <button 
            onClick={() => switchGame('platformer')} 
            style={{
              margin: '2px', 
              padding: '5px 10px',
              backgroundColor: gameState.currentGame === 'platformer' ? '#347ee1' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Platformer
          </button>
          <button 
            onClick={() => switchGame('none')} 
            style={{
              margin: '2px', 
              padding: '5px 10px',
              backgroundColor: gameState.currentGame === 'none' ? '#347ee1' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Base
          </button>
          <button 
            onClick={() => switchGame('jump')} 
            style={{
              margin: '2px', 
              padding: '5px 10px',
              backgroundColor: gameState.currentGame === 'jump' ? '#347ee1' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Jump
          </button>
          <button 
            onClick={() => switchGame('tap')} 
            style={{
              margin: '2px', 
              padding: '5px 10px',
              backgroundColor: gameState.currentGame === 'tap' ? '#347ee1' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tap
          </button>
          <button 
            onClick={() => switchGame('word')} 
            style={{
              margin: '2px', 
              padding: '5px 10px',
              backgroundColor: gameState.currentGame === 'word' ? '#347ee1' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Word
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controller;
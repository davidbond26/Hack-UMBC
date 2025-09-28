import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MemoryGameController from './controllers/MemoryGameController';
import BaseController from './controllers/BaseController';
import JumpGameController from './controllers/JumpGameController';
import TapGameController from './controllers/TapGameController';
import WordGameController from './controllers/WordGameController';
import PlatformerGameController from './controllers/PlatformerGameController';
import RacingGameController from './controllers/RacingGameController';

import firebaseService from '../services/firebaseService';

type GameType = 'none' | 'jump' | 'tap' | 'word' | 'memory' | 'racing' | 'platformer';


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
      case 'racing':
        return <RacingGameController {...baseProps} />;
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
        backgroundColor: '#74c5ff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'LL Baguid, Arial, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* Main Title */}
          <h1 style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#000000',
            margin: '0',
            fontFamily: 'LL Baguid, Arial, sans-serif',
            textAlign: 'center'
          }}>
            ENTER
          </h1>

          {/* Subtitle */}
          <h2 style={{
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#000000',
            margin: '0',
            fontFamily: 'LL Baguid, Arial, sans-serif',
            textAlign: 'center'
          }}>
            YOUR NAME:
          </h2>

          {/* Input Field */}
          <input
            type="text"
            placeholder=""
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && playerName.trim()) {
                handleJoinGame();
              }
            }}
            style={{
              width: '300px',
              height: '50px',
              fontSize: '24px',
              fontFamily: 'LL Baguid, Arial, sans-serif',
              backgroundColor: 'white',
              border: '3px solid #000000',
              borderRadius: '0',
              padding: '10px 15px',
              boxSizing: 'border-box',
              textAlign: 'center',
              outline: 'none',
              color: '#000000'
            }}
          />

          {/* Play Button */}
          <button
            onClick={handleJoinGame}
            disabled={!playerName.trim()}
            style={{
              background: 'none',
              border: 'none',
              cursor: playerName.trim() ? 'pointer' : 'not-allowed',
              opacity: playerName.trim() ? 1 : 0.5,
              transition: 'opacity 0.2s ease, transform 0.1s ease',
              outline: 'none'
            }}
            onMouseDown={(e) => {
              if (playerName.trim()) {
                e.currentTarget.style.transform = 'scale(0.95)';
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img
              src="/assets/play-button.png"
              alt="Play"
              style={{
                width: '120px',
                height: 'auto',
                imageRendering: 'pixelated',
                imageRendering: '-moz-crisp-edges',
                imageRendering: 'crisp-edges'
              }}
            />
          </button>

          {/* Session ID - Small text at bottom */}
          <p style={{
            fontSize: '16px',
            color: '#000000',
            fontFamily: 'LL Baguid, Arial, sans-serif',
            opacity: 0.7,
            margin: '20px 0 0 0',
            textAlign: 'center'
          }}>
            Session: {sessionId}
          </p>
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
            onClick={() => switchGame('racing')}
            style={{
              margin: '2px',
              padding: '5px 10px',
              backgroundColor: gameState.currentGame === 'racing' ? '#347ee1' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Racing
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
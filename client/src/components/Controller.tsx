import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MemoryGameController from './controllers/MemoryGameController';
import firebaseService from '../services/firebaseService';

const Controller: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

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
              border: '2px solid #347ee1',
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
            Join Memory Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <MemoryGameController
      playerName={playerName}
      sessionId={sessionId || ''}
      onGameAction={handleGameAction}
    />
  );
};

export default Controller;
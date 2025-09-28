import React, { useState, useEffect } from 'react';
import MemoryGame from './games/MemoryGame';
import QRCodeGenerator from './QRCodeGenerator';

const MainDisplay: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [showQR, setShowQR] = useState(true);

  useEffect(() => {
    // Generate session ID for this game
    const newSessionId = 'memory-game-' + Date.now();
    setSessionId(newSessionId);
  }, []);

  const handleGameEnd = (score: number, moves: number) => {
    console.log('Memory game completed!', { score, moves });
    // TODO: Send game stats to Firebase for bingo board
  };

  const handlePlayerJoin = (playerId: string) => {
    console.log('Player joined:', playerId);
    // Keep QR code visible for multiple players
  };

  if (showQR && sessionId) {
    return (
      <div style={{
        backgroundColor: '#aedfff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#2c5aa0'
        }}>
          <h1 style={{ fontSize: '3rem', margin: '10px 0' }}>🃏 Memory Game</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            Scan the QR code with your phone to join!
          </p>
        </div>
        
        <QRCodeGenerator 
          onPlayerJoin={handlePlayerJoin}
          sessionId={sessionId}
        />
        
        <button
          onClick={() => setShowQR(false)}
          style={{
            backgroundColor: '#347ee1',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '1.1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '30px'
          }}
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div>
      <MemoryGame onGameEnd={handleGameEnd} sessionId={sessionId} />
    </div>
  );
};

export default MainDisplay;
import React, { useState, useEffect } from 'react';
import firebaseService from '../../services/firebaseService';

interface MemoryGameControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
}

const MemoryGameController: React.FC<MemoryGameControllerProps> = ({ 
  playerName, 
  sessionId, 
  onGameAction 
}) => {
  const [matchedCards, setMatchedCards] = useState<number[]>([]);

  // Listen for match updates from main display
  useEffect(() => {
    const unsubscribe = firebaseService.onNewInteractions((interaction) => {
      if (interaction.action === 'match-update') {
        console.log('📱 Controller received match update:', interaction.data.matchedCards);
        setMatchedCards(interaction.data.matchedCards || []);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleCardSelect = (cardPosition: number) => {
    onGameAction({
      type: 'memory-card-select',
      data: {
        cardPosition,
        playerName,
        timestamp: new Date()
      }
    });
  };

  return (
    <div style={{
      backgroundColor: '#aedfff',
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: '#2c5aa0'
      }}>
        <h1 style={{ fontSize: '1.8rem', margin: '10px 0' }}>Memory Game</h1>
        <p style={{ fontSize: '1rem' }}>Player: {playerName}</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Tap a card to flip it!</p>
      </div>

      {/* Card Grid Selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '10px',
        flex: 1,
        maxHeight: '60vh'
      }}>
        {Array.from({ length: 18 }, (_, index) => {
          const isMatched = matchedCards.includes(index);
          const isClickable = !isMatched;
          
          return (
            <button
              key={index}
              onClick={() => isClickable && handleCardSelect(index)}
              disabled={!isClickable}
              style={{
                backgroundColor: isMatched ? '#1a4a73' : '#347ee1',
                border: 'none',
                borderRadius: '8px',
                color: isMatched ? '#888' : 'white',
                fontSize: '1.2rem',
                cursor: isClickable ? 'pointer' : 'not-allowed',
                transition: isMatched ? 'none' : 'all 0.2s ease',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isMatched ? '0 1px 2px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                opacity: isMatched ? 0.6 : 1,
                // Force override any browser styling
                WebkitAppearance: 'none',
                outline: 'none',
                userSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                // Prevent any visual feedback on interaction for matched cards
                ...(isMatched && {
                  pointerEvents: 'none',
                  background: '#1a4a73',
                  backgroundImage: 'none',
                  backgroundClip: 'padding-box',
                  MozBackgroundClip: 'padding-box',
                  WebkitBackgroundClip: 'padding-box'
                })
              }}
              {...(isClickable ? {
                onTouchStart: (e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                  e.currentTarget.style.backgroundColor = '#2968c7';
                },
                onTouchEnd: (e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = '#347ee1';
                },
                onMouseDown: (e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                  e.currentTarget.style.backgroundColor = '#2968c7';
                },
                onMouseUp: (e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = '#347ee1';
                }
              } : {})}
            >
              {isMatched ? '✓' : index + 1}
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: '#2c5aa0',
        fontSize: '0.9rem'
      }}>
        <p>Find matching pairs by selecting two cards!</p>
        <p style={{ marginTop: '10px', opacity: 0.7 }}>
          Session: {sessionId}
        </p>
      </div>
    </div>
  );
};

export default MemoryGameController;
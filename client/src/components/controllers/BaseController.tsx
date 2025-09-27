import React from 'react';

interface BaseControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
}

const BaseController: React.FC<BaseControllerProps> = ({ playerName, sessionId, onGameAction }) => {
  const handleTestButton = () => {
    onGameAction({
      type: 'button-press',
      data: {
        buttonType: 'test',
        timestamp: new Date(),
        message: `${playerName} pressed the test button!`
      }
    });
  };

  return (
    <div className="base-controller" style={{ padding: '20px', textAlign: 'center' }}>
      <div className="controller-header">
        <h2>Welcome {playerName}! 🎮</h2>
        <p>Session: {sessionId}</p>
        <p className="waiting-message">Ready to play!</p>
      </div>

      <div className="game-status" style={{ margin: '20px 0' }}>
        <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#27ae60',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <span>Connected to game</span>
        </div>
      {/* Test Button for Proof of Concept */}
      <div style={{ margin: '30px 0' }}>
        <button
          onClick={handleTestButton}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: '#e74c3c',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
            e.currentTarget.style.backgroundColor = '#c0392b';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#e74c3c';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
            e.currentTarget.style.backgroundColor = '#c0392b';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#e74c3c';
          }}
        >
          <div>🔴</div>
          <div style={{ fontSize: '1rem', marginTop: '5px' }}>TEST BUTTON</div>
        </button>
      </div>

      <div className="instructions">
        <p>Press the button above to send a signal to the main display!</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '10px' }}>
          This demonstrates real-time communication between your phone and the main screen.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default BaseController;
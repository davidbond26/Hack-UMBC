import React from 'react';

interface JumpGameControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
}

const JumpGameController: React.FC<JumpGameControllerProps> = ({ playerName, sessionId, onGameAction }) => {
  const handleJump = () => {
    onGameAction({ type: 'JUMP', timestamp: Date.now() });
  };

  return (
    <div className="jump-game-controller">
      <div className="controller-header">
        <h2>{playerName}</h2>
        <p>Jump Game</p>
      </div>

      <div className="game-controls">
        <button
          className="jump-button"
          onTouchStart={handleJump}
          onMouseDown={handleJump}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            fontSize: '24px',
            fontWeight: 'bold',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            margin: '20px auto',
            display: 'block'
          }}
        >
          JUMP!
        </button>
      </div>

      <div className="instructions">
        <p>Tap the button to make your character jump!</p>
      </div>
    </div>
  );
};

export default JumpGameController;
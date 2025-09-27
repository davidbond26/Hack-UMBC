import React, { useState, useEffect } from 'react';

interface TapGameControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
}

const TapGameController: React.FC<TapGameControllerProps> = ({ playerName, sessionId, onGameAction }) => {
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 second game

  const handleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    onGameAction({ type: 'TAP', count: newCount, timestamp: Date.now() });
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <div className="tap-game-controller">
      <div className="controller-header">
        <h2>{playerName}</h2>
        <p>Tap Challenge</p>
      </div>

      <div className="game-stats">
        <div className="tap-counter">Taps: {tapCount}</div>
        <div className="timer">Time: {timeLeft}s</div>
      </div>

      <div className="game-controls">
        <button
          className="tap-button"
          onClick={handleTap}
          disabled={timeLeft === 0}
          style={{
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            fontSize: '32px',
            fontWeight: 'bold',
            backgroundColor: timeLeft > 0 ? '#4ecdc4' : '#ccc',
            color: 'white',
            border: 'none',
            margin: '20px auto',
            display: 'block',
            cursor: timeLeft > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          {timeLeft > 0 ? 'TAP!' : 'TIME UP!'}
        </button>
      </div>

      <div className="instructions">
        <p>Tap as fast as you can!</p>
      </div>
    </div>
  );
};

export default TapGameController;
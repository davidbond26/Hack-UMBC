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
    <div className="min-h-screen bg-teal-100 flex flex-col justify-center items-center p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{playerName}</h2>
        <p className="text-gray-600">Tap Challenge</p>
      </div>

      <div className="flex gap-8 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-teal-600">{tapCount}</div>
          <div className="text-sm text-gray-600">Taps</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{timeLeft}s</div>
          <div className="text-sm text-gray-600">Time</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={handleTap}
          disabled={timeLeft === 0}
          className={`w-64 h-64 rounded-full text-3xl font-bold border-none shadow-lg transition-all duration-100 active:scale-95 ${
            timeLeft > 0
              ? 'bg-teal-500 text-white cursor-pointer hover:bg-teal-600 active:bg-teal-700'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          {timeLeft > 0 ? 'TAP!' : 'TIME UP!'}
        </button>
      </div>

      <div className="text-center text-gray-600 mb-8">
        <p>Tap as fast as you can!</p>
      </div>
    </div>
  );
};

export default TapGameController;
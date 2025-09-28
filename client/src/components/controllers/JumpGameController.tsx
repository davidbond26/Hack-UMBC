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
    <div className="min-h-screen bg-red-100 flex flex-col justify-center items-center p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{playerName}</h2>
        <p className="text-gray-600">Jump Game</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <button
          onTouchStart={handleJump}
          onMouseDown={handleJump}
          className="w-52 h-52 rounded-full text-2xl font-bold bg-red-500 text-white border-none active:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-150 active:scale-95"
        >
          JUMP!
        </button>
      </div>

      <div className="text-center text-gray-600 mb-8">
        <p>Tap the button to make your character jump!</p>
      </div>
    </div>
  );
};

export default JumpGameController;
import React from 'react';

interface BaseControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
}

const BaseController: React.FC<BaseControllerProps> = ({ playerName, sessionId }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome {playerName}!</h2>
        <p className="text-gray-600 mb-6">Session: {sessionId}</p>
        <p className="text-lg text-blue-600 mb-8">Waiting for game to start...</p>

        <div className="flex items-center justify-center mb-6">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-green-600">Connected to game</span>
        </div>

        <div className="text-gray-500">
          <p>Your controller will update automatically when a minigame starts!</p>
        </div>
      </div>
    </div>
  );
};

export default BaseController;
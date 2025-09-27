import React from 'react';

interface BaseControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
}

const BaseController: React.FC<BaseControllerProps> = ({ playerName, sessionId }) => {
  return (
    <div className="base-controller">
      <div className="controller-header">
        <h2>Welcome {playerName}!</h2>
        <p>Session: {sessionId}</p>
        <p className="waiting-message">Waiting for game to start...</p>
      </div>

      <div className="game-status">
        <div className="status-indicator">
          <div className="pulse-dot"></div>
          <span>Connected to game</span>
        </div>
      </div>

      <div className="instructions">
        <p>Your controller will update automatically when a minigame starts!</p>
      </div>
    </div>
  );
};

export default BaseController;
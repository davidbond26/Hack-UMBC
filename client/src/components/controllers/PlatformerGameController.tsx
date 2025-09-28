import React, { useState } from 'react';
import firebaseService from '../../services/firebaseService';

interface PlatformerGameControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
}

const PlatformerGameController: React.FC<PlatformerGameControllerProps> = ({ 
  playerName, 
  sessionId, 
  onGameAction 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);

  const handleJumpAction = async () => {
    try {
      const now = Date.now();
      
      // Prevent rapid-fire actions (minimum 50ms between actions)
      if (now - lastActionTime < 50) {
        console.log('🎮 Jump action blocked - too recent');
        return;
      }
      
      // Prevent any action if one is already in progress
      if (isActionInProgress) {
        console.log('🎮 Jump action blocked - action in progress');
        return;
      }
      
      setLastActionTime(now);
      setIsActionInProgress(true);
      
      await firebaseService.sendInteraction('jump-action', {
        playerName,
        timestamp: now
      });
      console.log('🎮 Jump action sent successfully');
      
      // Clear the action flag after a delay
      setTimeout(() => {
        setIsActionInProgress(false);
      }, 100);
      
    } catch (error) {
      console.error('❌ Failed to send jump action:', error);
      setIsActionInProgress(false); // Reset on error
    }
  };

  return (
    <div style={{
      backgroundColor: '#74c5ff',
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'LL Baguid, Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        color: '#000000',
        fontFamily: 'LL Baguid, Arial, sans-serif'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          margin: '10px 0',
          fontFamily: 'LL Baguid, Arial, sans-serif',
          fontWeight: 'bold'
        }}>Platformer Game</h1>
        <p style={{ 
          fontSize: '1.1rem',
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>Player: {playerName}</p>
        <p style={{ 
          fontSize: '0.9rem', 
          opacity: 0.8,
          fontFamily: 'LL Baguid, Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.4,
          marginTop: '15px'
        }}>
          Tap once to start charging your jump,<br/>
          then tap again to release and jump!<br/>
          Longer charge = higher jump!
        </p>
      </div>

      {/* Jump Button */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <button
          disabled={isActionInProgress}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isActionInProgress) {
              setIsPressed(true);
              handleJumpAction();
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPressed(false);
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPressed(false);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            border: '5px solid #000',
            backgroundColor: isActionInProgress ? '#999' : (isPressed ? '#ffe46f' : '#000000'),
            color: isActionInProgress ? '#666' : (isPressed ? '#000' : '#fff'),
            fontSize: '1.8rem',
            fontWeight: 'bold',
            cursor: isActionInProgress ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s ease',
            transform: isPressed ? 'scale(0.95)' : 'scale(1)',
            boxShadow: isPressed 
              ? '0 5px 15px rgba(0,0,0,0.3)' 
              : '0 10px 30px rgba(0,0,0,0.5)',
            fontFamily: 'LL Baguid, Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: 1.2,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
            opacity: isActionInProgress ? 0.6 : 1
          }}
        >
          {isActionInProgress ? '⏳' : (isPressed ? '🚀' : 'TAP TO\nJUMP')}
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        color: '#000000',
        fontSize: '0.9rem',
        fontFamily: 'LL Baguid, Arial, sans-serif'
      }}>
        <p style={{ fontFamily: 'LL Baguid, Arial, sans-serif', marginBottom: '10px' }}>
          🎯 Jump from platform to platform to reach new heights!
        </p>
        <p style={{ fontFamily: 'LL Baguid, Arial, sans-serif', marginBottom: '10px' }}>
          ⚡ Timing is everything - charge longer for higher jumps!
        </p>
        <p style={{ 
          marginTop: '15px', 
          opacity: 0.7,
          fontFamily: 'LL Baguid, Arial, sans-serif',
          fontSize: '0.8rem'
        }}>
          Session: {sessionId}
        </p>
      </div>
    </div>
  );
};

export default PlatformerGameController;
import React from 'react';

interface RacingGameControllerProps {
  playerName: string;
  sessionId: string;
  onGameAction: (action: any) => void;
}

const RacingGameController: React.FC<RacingGameControllerProps> = ({
  playerName,
  sessionId,
  onGameAction
}) => {

  const handleTap = () => {
    onGameAction({
      type: 'racing-tap',
      data: {
        playerName,
        timestamp: new Date()
      }
    });
  };

  const handleLaneSwitch = (lane: number) => {
    onGameAction({
      type: 'racing-lane-switch',
      data: {
        lane: lane - 1, // Convert from 1-3 to 0-2
        playerName,
        timestamp: new Date()
      }
    });
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
        marginBottom: '30px',
        color: '#000000',
        fontFamily: 'LL Baguid, Arial, sans-serif'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          margin: '10px 0',
          fontFamily: 'LL Baguid, Arial, sans-serif',
          fontWeight: 'bold'
        }}>Racing Game</h1>
        <p style={{
          fontSize: '1rem',
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>Player: {playerName}</p>
        <p style={{
          fontSize: '0.9rem',
          opacity: 0.8,
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>Tap to move forward and switch lanes!</p>
      </div>

      {/* Main Tap Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '40px',
        flex: 1
      }}>
        <button
          onClick={handleTap}
          style={{
            backgroundColor: '#b08756',
            border: '4px solid #8b6b3d',
            borderRadius: '20px',
            color: '#ffffff',
            fontSize: '2rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minHeight: '200px',
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            fontFamily: 'LL Baguid, Arial, sans-serif',
            fontWeight: 'bold',
            WebkitAppearance: 'none',
            outline: 'none',
            userSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
            e.currentTarget.style.backgroundColor = '#9a5a40';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#b08756';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
            e.currentTarget.style.backgroundColor = '#9a5a40';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#b08756';
          }}
        >
          🚗 TAP TO MOVE
        </button>
      </div>

      {/* Lane Switch Buttons */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '1.3rem',
          color: '#000000',
          marginBottom: '15px',
          fontFamily: 'LL Baguid, Arial, sans-serif',
          fontWeight: 'bold'
        }}>Switch Lanes</h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          {[1, 2, 3].map(lane => (
            <button
              key={lane}
              onClick={() => handleLaneSwitch(lane)}
              style={{
                backgroundColor: '#1eb710',
                border: '3px solid #156b0a',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '80px',
                minWidth: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                fontFamily: 'LL Baguid, Arial, sans-serif',
                fontWeight: 'bold',
                WebkitAppearance: 'none',
                outline: 'none',
                userSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.backgroundColor = '#138a08';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = '#1eb710';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.backgroundColor = '#138a08';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = '#1eb710';
              }}
            >
              {lane}
            </button>
          ))}
        </div>
      </div>

      {/* Visual representation of lanes */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '5px',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '20px',
          height: '40px',
          backgroundColor: '#1eb710',
          borderRadius: '4px'
        }} />
        {[1, 2, 3].map(lane => (
          <React.Fragment key={lane}>
            <div style={{
              width: '50px',
              height: '40px',
              backgroundColor: '#b08756',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontFamily: 'LL Baguid, Arial, sans-serif',
              fontWeight: 'bold'
            }}>
              {lane}
            </div>
            {lane < 3 && (
              <div style={{
                width: '2px',
                height: '40px',
                backgroundColor: '#000000'
              }} />
            )}
          </React.Fragment>
        ))}
        <div style={{
          width: '20px',
          height: '40px',
          backgroundColor: '#1eb710',
          borderRadius: '4px'
        }} />
      </div>

      {/* Instructions */}
      <div style={{
        textAlign: 'center',
        color: '#000000',
        fontSize: '0.9rem',
        fontFamily: 'LL Baguid, Arial, sans-serif'
      }}>
        <p style={{ fontFamily: 'LL Baguid, Arial, sans-serif' }}>
          Tap the big button to move forward, use lane buttons to dodge roadblockers!
        </p>
        <p style={{
          marginTop: '10px',
          opacity: 0.7,
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>
          Session: {sessionId}
        </p>
      </div>
    </div>
  );
};

export default RacingGameController;
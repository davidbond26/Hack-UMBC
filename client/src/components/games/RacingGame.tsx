import React, { useState, useEffect, useRef } from 'react';
import firebaseService from '../../services/firebaseService';
import gameStatsService from '../../services/gameStatsService';

interface Roadblocker {
  id: number;
  lane: number; // 0, 1, or 2 for lanes 1, 2, 3
  y: number;
}

interface RacingGameProps {
  onGameEnd?: (score: number, time: number) => void;
  onBackToMenu?: () => void;
  sessionId?: string;
}

const RacingGame: React.FC<RacingGameProps> = ({ onGameEnd, onBackToMenu, sessionId }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState('Player');

  // Character state
  const [characterY, setCharacterY] = useState(0);
  const [characterLane, setCharacterLane] = useState(1); // 0, 1, or 2 for lanes 1, 2, 3 (starts at middle lane)
  const [characterSpeed, setCharacterSpeed] = useState(1); // Multiplier for movement speed
  const [animationFrame, setAnimationFrame] = useState(0);

  // Roadblockers and finish line
  const [roadblockers, setRoadblockers] = useState<Roadblocker[]>([]);
  const [finishLineY, setFinishLineY] = useState<number | null>(null);
  const [lastProgressCheckpoint, setLastProgressCheckpoint] = useState(0);
  const [slowMovementUntil, setSlowMovementUntil] = useState<number | null>(null);
  const roadblockerIdRef = useRef(0);

  // Game constants - make track span full width
  const TOTAL_WIDTH = window.innerWidth - 40; // Leave some margin
  const GRASS_WIDTH = Math.max(50, TOTAL_WIDTH * 0.1); // 10% of width, minimum 50px
  const LANE_WIDTH = (TOTAL_WIDTH - GRASS_WIDTH * 2) / 3;
  const GAME_HEIGHT = 600;
  const FINISH_LINE_Y = 1500; // Reduced distance but same time (illusion of going farther)
  const MOVE_DISTANCE = 12.5; // Increased by 5px (was 7.5, now 12.5) to look faster
  const ROADBLOCKER_MOVE_DISTANCE = 45; // Distance roadblockers move down per tap
  const ROADBLOCKER_SLOW_DISTANCE = 20; // Distance when hit by roadblock
  const SLOW_PROGRESS_DURATION = 5; // 5% progress of slower movement
  const ROADBLOCKER_SPAWN_RATE = 0.02; // Probability per frame

  // Spawn starting roadblockers to prevent empty tapping at beginning
  const spawnStartingRoadblockers = () => {
    // Spawn 2-3 sets of roadblockers at different distances ahead
    const distances = [300, 600, 900]; // Different distances ahead

    distances.forEach((distance, setIndex) => {
      const numRoadblockers = Math.random() < 0.5 ? 1 : 2;
      const availableLanes = [0, 1, 2];

      for (let i = 0; i < numRoadblockers; i++) {
        if (availableLanes.length === 0) break;

        const randomIndex = Math.floor(Math.random() * availableLanes.length);
        const selectedLane = availableLanes.splice(randomIndex, 1)[0];

        const newRoadblocker: Roadblocker = {
          id: roadblockerIdRef.current++,
          lane: selectedLane,
          y: distance + (i * 100) // Space them out vertically
        };

        setRoadblockers(prev => [...prev, newRoadblocker]);
      }
    });
  };

  // Initialize game
  const initializeGame = () => {
    setCharacterY(0);
    setCharacterLane(1); // Start at middle lane (lane 2)
    setCharacterSpeed(1);
    setAnimationFrame(0);
    setRoadblockers([]);
    setFinishLineY(FINISH_LINE_Y + GAME_HEIGHT); // Start finish line at top of screen
    setLastProgressCheckpoint(0);
    setSlowMovementUntil(null);
    setGameStarted(true);
    setGameFinished(false);
    setGameStartTime(Date.now());
    roadblockerIdRef.current = 0;

    // Add starting roadblocks to prevent empty tapping
    setTimeout(() => spawnStartingRoadblockers(), 100); // Small delay to ensure state is set

    console.log('🏁 Racing game initialized');
  };

  // Handle tap from mobile controller
  const handleTap = () => {
    if (!gameStarted || gameFinished) return;

    // Check if we're in slow movement period after hitting roadblock
    const currentProgress = (characterY / FINISH_LINE_Y) * 100;
    const isSlowMovement = slowMovementUntil !== null && currentProgress < slowMovementUntil;

    // Move character forward - HALF speed if in slow movement
    const characterMoveDistance = isSlowMovement ? (MOVE_DISTANCE * characterSpeed) / 2 : (MOVE_DISTANCE * characterSpeed);
    setCharacterY(prev => prev + characterMoveDistance);

    // Switch animation frame for running effect
    setAnimationFrame(prev => (prev + 1) % 2); // Alternate between 0 and 1

    // Move roadblockers based on current state - HALF speed if in slow movement
    const roadblockerMoveDistance = isSlowMovement ? ROADBLOCKER_SLOW_DISTANCE : ROADBLOCKER_MOVE_DISTANCE;

    setRoadblockers(prev =>
      prev.map(roadblocker => ({
        ...roadblocker,
        y: roadblocker.y - roadblockerMoveDistance
      }))
    );

    console.log(`🚗 Character moved ${characterMoveDistance}px forward, roadblockers moved down ${roadblockerMoveDistance}px`);
    console.log(`🔍 Character lane: ${characterLane}, Character Y: ${characterY}`);
  };

  // Handle lane switch from mobile controller
  const handleLaneSwitch = (newLane: number) => {
    if (!gameStarted || gameFinished) return;

    setCharacterLane(Math.max(0, Math.min(2, newLane)));
    console.log('🔄 Character switched to lane:', newLane + 1);
  };

  // Check collision with roadblockers
  const checkCollisions = () => {
    roadblockers.forEach(roadblocker => {
      // Check if character and roadblocker are in same lane
      if (characterLane === roadblocker.lane) {
        // Character is at bottom: 50px from bottom = GAME_HEIGHT - 50
        // Roadblocker screen position: GAME_HEIGHT - (roadblocker.y - characterY + 50)
        const roadblockerScreenY = GAME_HEIGHT - (roadblocker.y - characterY + 50);
        const characterScreenY = GAME_HEIGHT - 50; // Character bottom position

        // Collision if roadblocker overlaps with character (both 80px tall)
        const roadblockerBottom = roadblockerScreenY + 120; // roadblocker height
        const roadblockerTop = roadblockerScreenY;
        const characterBottom = characterScreenY;
        const characterTop = characterScreenY - 80; // character height

        // Check vertical overlap
        const collision = !(roadblockerBottom < characterTop || roadblockerTop > characterBottom);

        if (collision) {
          console.log('💥 COLLISION DETECTED!', {
            characterLane,
            roadblockerLane: roadblocker.lane,
            roadblockerScreenY,
            characterScreenY,
            roadblockerId: roadblocker.id
          });

          // Set slow movement for next 5% progress
          const currentProgress = (characterY / FINISH_LINE_Y) * 100;
          setSlowMovementUntil(currentProgress + SLOW_PROGRESS_DURATION);

          // Remove the hit roadblocker
          setRoadblockers(prev => prev.filter(r => r.id !== roadblocker.id));

          console.log(`⚡ Slow movement until ${currentProgress + SLOW_PROGRESS_DURATION}% progress`);
        }
      }
    });
  };

  // Spawn 1-2 roadblockers at specific progress checkpoints
  const spawnRoadblockersAtCheckpoint = () => {
    const numRoadblockers = Math.random() < 0.5 ? 1 : 2; // Randomly 1 or 2
    const spawnY = characterY + GAME_HEIGHT;

    // Get existing roadblockers near this spawn area to avoid stacking
    const existingNearby = roadblockers.filter(r =>
      Math.abs(r.y - spawnY) < 150 // Within 150px of spawn area
    );

    const occupiedLanes = existingNearby.map(r => r.lane);
    const availableLanes = [0, 1, 2].filter(lane => !occupiedLanes.includes(lane));

    // If we don't have enough available lanes, skip spawning
    if (availableLanes.length === 0) return;

    const lanesToUse = [];

    // Select lanes to use (ensuring no stacking)
    for (let i = 0; i < numRoadblockers && availableLanes.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableLanes.length);
      const selectedLane = availableLanes.splice(randomIndex, 1)[0];
      lanesToUse.push(selectedLane);
    }

    // Create roadblockers with much larger vertical spacing
    lanesToUse.forEach((lane, index) => {
      const newRoadblocker: Roadblocker = {
        id: roadblockerIdRef.current++,
        lane: lane,
        y: spawnY + (index * 200) + Math.random() * 150 // Much larger vertical spacing (200px base + up to 150px variation)
      };

      setRoadblockers(prev => [...prev, newRoadblocker]);
    });
  };

  // Game loop - move roadblockers, check collisions and finish line
  useEffect(() => {
    if (!gameStarted || gameFinished) return;

    const gameLoop = setInterval(() => {
      // Slowly move finish line down for realism
      setFinishLineY(prev => prev !== null ? prev - 0.5 : null); // Move down 0.5px per frame

      // Check collisions
      checkCollisions();

      // Check if character has reached 100% progress (finish line)
      const currentProgress = (characterY / FINISH_LINE_Y) * 100;
      if (currentProgress >= 100) {
        setGameFinished(true);
        const timeElapsed = Math.round((Date.now() - gameStartTime) / 1000);
        const score = calculateScore(timeElapsed);

        gameStatsService.recordGame(currentPlayer, 'racing', score, 0, timeElapsed);
        onGameEnd?.(score, timeElapsed);
      }
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameFinished, characterY, characterSpeed, roadblockers]);

  // Check for 10% progress checkpoints and spawn roadblockers
  useEffect(() => {
    if (!gameStarted || gameFinished) return;

    // Clean up old roadblockers that are too far behind
    setRoadblockers(prev => prev.filter(roadblocker => roadblocker.y > characterY - 300));

    // Calculate current progress percentage
    const currentProgress = Math.floor((characterY / FINISH_LINE_Y) * 100);
    const currentCheckpoint = Math.floor(currentProgress / 10) * 10;

    // Check if we've reached a new 10% checkpoint
    if (currentCheckpoint > lastProgressCheckpoint && currentCheckpoint < 100) {
      console.log(`🎯 Reached ${currentCheckpoint}% progress - spawning roadblockers`);
      setLastProgressCheckpoint(currentCheckpoint);
      spawnRoadblockersAtCheckpoint();
    }
  }, [characterY, lastProgressCheckpoint]); // Trigger when character moves or checkpoint changes

  // Set up Firebase listener
  useEffect(() => {
    if (gameStarted && sessionId) {
      console.log('🔥 Setting up Firebase listener for racing game');

      const unsubscribe = firebaseService.onNewInteractions((interaction) => {
        console.log('🎮 Racing game received interaction:', interaction);

        if (interaction.action === 'racing-tap') {
          setCurrentPlayer(interaction.playerName);
          handleTap();
        } else if (interaction.action === 'racing-lane-switch') {
          setCurrentPlayer(interaction.playerName);
          handleLaneSwitch(interaction.data.lane);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [gameStarted, sessionId]);

  // Initialize Firebase session
  useEffect(() => {
    if (sessionId) {
      console.log('🎮 Racing game initializing Firebase with session:', sessionId);
      firebaseService.initializeSession(sessionId, 'MainDisplay', 'main-display');
    }

    return () => {
      firebaseService.cleanup();
    };
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameFinished) {
      const timer = setInterval(() => {
        setCurrentTime(Math.round((Date.now() - gameStartTime) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, gameFinished, gameStartTime]);

  const calculateScore = (timeElapsed: number) => {
    // Score based on time (faster = higher score)
    const baseScore = 1000;
    const timePenalty = timeElapsed * 10;
    return Math.max(100, baseScore - timePenalty);
  };

  const getLaneX = (lane: number) => {
    return GRASS_WIDTH + lane * LANE_WIDTH + LANE_WIDTH / 2;
  };

  if (!gameStarted) {
    return (
      <div style={{
        backgroundColor: '#74c5ff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <button
          onClick={initializeGame}
          style={{
            backgroundColor: '#b08756',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            fontSize: '24px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: 'LL Baguid, Arial, sans-serif'
          }}
        >
          Start Racing Game
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#74c5ff',
      height: '100vh',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'LL Baguid, Arial, sans-serif',
      overflow: 'hidden',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Collapsible Back to Menu Tab */}
      {onBackToMenu && (
        <div
          onClick={onBackToMenu}
          style={{
            position: 'fixed',
            top: '50%',
            left: '-120px',
            transform: 'translateY(-50%)',
            backgroundColor: '#74c5ff',
            color: 'black',
            border: '2px solid #000000',
            borderLeft: 'none',
            padding: '15px 25px 15px 15px',
            fontSize: '1rem',
            borderRadius: '0 12px 12px 0',
            cursor: 'pointer',
            fontFamily: 'LL Baguid, Arial, sans-serif',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '2px 4px 8px rgba(0,0,0,0.3)',
            transition: 'left 0.3s ease',
            width: '150px',
            textAlign: 'center',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.left = '0px';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.left = '-120px';
          }}
        >
          ← Back to Menu
        </div>
      )}
      {/* Game Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '10px',
        color: '#000000',
        fontFamily: 'LL Baguid, Arial, sans-serif'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          margin: '5px 0',
          fontFamily: 'LL Baguid, Arial, sans-serif',
          fontWeight: 'bold'
        }}>Racing Game</h1>
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          fontSize: '1rem',
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>
          <div>Player: {currentPlayer}</div>
          <div>Time: {currentTime}s</div>
          <div>Progress: {Math.round((characterY / FINISH_LINE_Y) * 100)}%</div>
        </div>
      </div>

      {/* Racing Track */}
      <div style={{
        width: TOTAL_WIDTH,
        height: GAME_HEIGHT,
        position: 'relative',
        border: '3px solid #000000',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '0 auto',
        maxWidth: '100vw'
      }}>
        {/* Grass on left */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: GRASS_WIDTH,
          height: '100%',
          backgroundColor: '#1eb710'
        }} />

        {/* Dirt roads */}
        {[0, 1, 2].map(lane => (
          <div key={lane} style={{
            position: 'absolute',
            left: GRASS_WIDTH + lane * LANE_WIDTH,
            top: 0,
            width: LANE_WIDTH,
            height: '100%',
            backgroundColor: '#b08756',
            borderRight: lane < 2 ? '3px solid #000000' : 'none'
          }} />
        ))}

        {/* Grass on right */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: GRASS_WIDTH,
          height: '100%',
          backgroundColor: '#1eb710'
        }} />

        {/* Character */}
        <div style={{
          position: 'absolute',
          left: getLaneX(characterLane) - 40, // Adjusted for bigger character
          bottom: 50,
          width: 80, // Made bigger
          height: 80, // Made bigger
          backgroundImage: `url(/assets/character${animationFrame === 1 ? '-right' : ''}.png)`, // Switch between character.png and character-right.png
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          zIndex: 10
          // Removed transition, backgroundColor, borderRadius, border for instant teleport and no red circle
        }} />

        {/* Roadblockers */}
        {roadblockers.map(roadblocker => {
          const screenY = GAME_HEIGHT - (roadblocker.y - characterY + 50);

          if (screenY < -120 || screenY > GAME_HEIGHT + 120) return null;

          const roadblockerWidth = LANE_WIDTH - 6; // 3px less on each side
          const roadblockerLeft = GRASS_WIDTH + roadblocker.lane * LANE_WIDTH + 3; // 3px from left edge of lane

          return (
            <div
              key={roadblocker.id}
              style={{
                position: 'absolute',
                left: roadblockerLeft,
                top: screenY,
                width: roadblockerWidth,
                height: 120, // Made even bigger
                backgroundImage: 'url(/assets/roadblocker.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            />
          );
        })}

        {/* Finish Line - positioned to hit character bottom at 100% progress */}
        {(() => {
          const currentProgress = (characterY / FINISH_LINE_Y) * 100;

          // Calculate finish line position: when progress = 100%, finish line should be at character bottom
          // Character bottom is at: GAME_HEIGHT - 50
          // At 100% progress: finishLineScreenY should equal GAME_HEIGHT - 50
          // Working backwards: GAME_HEIGHT - (FINISH_LINE_Y - characterY + 50) = GAME_HEIGHT - 50
          // Solving: FINISH_LINE_Y - characterY + 50 = 50, so FINISH_LINE_Y = characterY

          const finishLineScreenY = GAME_HEIGHT - (FINISH_LINE_Y - characterY + 50);

          // Show finish line when approaching 90% progress
          if (currentProgress < 90) return null;

          // Only show if finish line is visible on screen
          if (finishLineScreenY < -30 || finishLineScreenY > GAME_HEIGHT + 30) return null;

          return (
            <div style={{
              position: 'absolute',
              left: GRASS_WIDTH,
              top: finishLineScreenY,
              width: LANE_WIDTH * 3,
              height: 30,
              backgroundImage: 'url(/assets/finishline.png)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              zIndex: 5
            }} />
          );
        })()}
      </div>

      {/* Game Finished Message */}
      {gameFinished && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            color: '#000000',
            fontFamily: 'LL Baguid, Arial, sans-serif'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              margin: '0 0 20px 0',
              fontFamily: 'LL Baguid, Arial, sans-serif',
              fontWeight: 'bold'
            }}>🏁 Race Finished!</h2>
            <p style={{
              fontSize: '1.2rem',
              margin: '10px 0',
              fontFamily: 'LL Baguid, Arial, sans-serif'
            }}>Time: {currentTime}s</p>
            <p style={{
              fontSize: '1.2rem',
              margin: '10px 0',
              fontFamily: 'LL Baguid, Arial, sans-serif'
            }}>Score: {calculateScore(currentTime)}</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={initializeGame}
                style={{
                  backgroundColor: '#b08756',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'LL Baguid, Arial, sans-serif',
                  fontWeight: 'bold'
                }}
              >
                Race Again
              </button>
              {onBackToMenu && (
                <button
                  onClick={onBackToMenu}
                  style={{
                    backgroundColor: '#74c5ff',
                    color: 'black',
                    border: '2px solid #000000',
                    padding: '15px 30px',
                    fontSize: '1.1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'LL Baguid, Arial, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  Back to Menu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '10px',
        textAlign: 'center',
        color: '#000000',
        fontSize: '0.9rem',
        fontFamily: 'LL Baguid, Arial, sans-serif'
      }}>
        Use your phone to tap for speed and switch lanes to avoid roadblockers!
      </div>
    </div>
  );
};

export default RacingGame;
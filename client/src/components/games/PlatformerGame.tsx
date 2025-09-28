import React, { useState, useEffect, useRef, useCallback } from 'react';
import firebaseService from '../../services/firebaseService';

interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number; // side-to-side movement speed
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  isCharging: boolean;
  onPlatform: Platform | null;
}

interface PlatformerGameProps {
  onGameEnd?: (height: number, time: number) => void;
  onBackToMenu?: () => void;
  sessionId?: string;
}

const PlatformerGame: React.FC<PlatformerGameProps> = ({ onGameEnd, onBackToMenu, sessionId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Game constants
  const GRAVITY = 0.5;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLATFORM_WIDTH = 120;
  const PLATFORM_HEIGHT = 25; // Increased by 5px
  const GROUND_HEIGHT = 80; // Brown ground height
  const JUMP_POWER_MIN = 8;
  const JUMP_POWER_MAX = 20;
  const CHARGE_SPEED = 0.01; // Consistent charge speed
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [height, setHeight] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState('Player');
  
  // Game objects
  const [player, setPlayer] = useState<Player>({
    x: 400, // Center of screen
    y: CANVAS_HEIGHT - GROUND_HEIGHT - 40, // On top of brown ground
    width: 40,
    height: 40,
    velocityY: 0,
    isJumping: false,
    isCharging: false,
    onPlatform: null
  });
  
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [camera, setCamera] = useState({ y: 0 });
  const [chargeAmount, setChargeAmount] = useState(0);
  const [chargeDirection, setChargeDirection] = useState(1); // 1 for up, -1 for down
  const [isCharging, setIsCharging] = useState(false);
  
  // Images
  const [images, setImages] = useState<{[key: string]: HTMLImageElement}>({});
  
  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const imageUrls = {
        standing: '/assets/standing.png',
        jumping: '/assets/jumping.png',
        background: '/assets/background.png',
        chargingBar: '/assets/charging bar.png'
      };
      
      const loadedImages: {[key: string]: HTMLImageElement} = {};
      
      for (const [key, url] of Object.entries(imageUrls)) {
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        loadedImages[key] = img;
      }
      
      setImages(loadedImages);
    };
    
    loadImages();
  }, []);
  
  // Initialize platforms
  const generatePlatforms = useCallback(() => {
    const newPlatforms: Platform[] = [];
    
    // Generate platforms going up (no ground platform - using CSS ground instead)
    for (let i = 1; i < 50; i++) {
      newPlatforms.push({
        id: i,
        x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
        y: (CANVAS_HEIGHT - GROUND_HEIGHT) - (i * 120), // Platforms every 120 pixels up from ground
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        velocity: (Math.random() - 0.5) * 2 // Random left/right movement
      });
    }
    
    return newPlatforms;
  }, []);
  
  // Initialize game
  const initializeGame = useCallback(() => {
    const initialPlatforms = generatePlatforms();
    setPlatforms(initialPlatforms);
    setPlayer({
      x: 400,
      y: CANVAS_HEIGHT - GROUND_HEIGHT - 40, // On top of brown ground
      width: 40,
      height: 40,
      velocityY: 0,
      isJumping: false,
      isCharging: false,
      onPlatform: null // Start on ground (no platform object)
    });
    setCamera({ y: 0 }); // Start with camera at bottom
    setHeight(0);
    setMaxHeight(0);
    setGameTime(0);
    setChargeAmount(0);
    setIsCharging(false);
    setGameStarted(true);
    setGameOver(false);
  }, [generatePlatforms]);

  // Auto-initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle jump input
  const handleJumpInput = useCallback(() => {
    if (gameOver) return;
    
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
    const isOnGroundOrPlatform = player.onPlatform || (player.y + player.height >= groundY - 5);
    
    if (!isCharging && !player.isJumping && isOnGroundOrPlatform) {
      // Start charging
      setIsCharging(true);
      setChargeAmount(0);
      setChargeDirection(1);
    } else if (isCharging) {
      // Release jump
      setIsCharging(false);
      const jumpPower = JUMP_POWER_MIN + (chargeAmount * (JUMP_POWER_MAX - JUMP_POWER_MIN));
      
      setPlayer(prev => ({
        ...prev,
        velocityY: -jumpPower,
        isJumping: true,
        onPlatform: null
      }));
      setChargeAmount(0);
      setChargeDirection(1);
    }
  }, [isCharging, player.isJumping, player.onPlatform, player.y, chargeAmount, gameOver]);
  
  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameOver) return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    // Update game time
    setGameTime(prev => prev + deltaTime / 1000);
    
    // Update charge if charging (oscillate up and down)
    if (isCharging) {
      setChargeAmount(prev => {
        const newAmount = prev + (CHARGE_SPEED * chargeDirection);
        
        // Reverse direction when hitting limits
        if (newAmount >= 1) {
          setChargeDirection(-1);
          return 1;
        } else if (newAmount <= 0) {
          setChargeDirection(1);
          return 0;
        }
        
        return newAmount;
      });
    }
    
    // Update platforms
    setPlatforms(prev => prev.map(platform => ({
      ...platform,
      x: platform.velocity === 0 ? platform.x : 
          platform.x + platform.velocity,
      // Wrap around screen
      ...(platform.velocity !== 0 && {
        x: platform.x + platform.velocity < -platform.width ? CANVAS_WIDTH :
           platform.x + platform.velocity > CANVAS_WIDTH ? -platform.width :
           platform.x + platform.velocity
      })
    })));
    
    // Update player
    setPlayer(prev => {
      let newPlayer = { ...prev };
      
      // Apply gravity if not on platform
      if (!newPlayer.onPlatform) {
        newPlayer.velocityY += GRAVITY;
        newPlayer.y += newPlayer.velocityY;
      } else {
        // Move with platform
        newPlayer.x += newPlayer.onPlatform.velocity;
      }
      
      // Screen wrap-around (like Doodle Jump) - only when completely off screen
      if (newPlayer.x < -newPlayer.width) {
        newPlayer.x = CANVAS_WIDTH;
        // Clear platform when wrapping to avoid glitches
        newPlayer.onPlatform = null;
      } else if (newPlayer.x > CANVAS_WIDTH) {
        newPlayer.x = -newPlayer.width;
        // Clear platform when wrapping to avoid glitches
        newPlayer.onPlatform = null;
      }
      
      // Check if player should fall off platform (simple bounds check)
      if (newPlayer.onPlatform) {
        const platform = newPlayer.onPlatform;
        const playerCenter = newPlayer.x + newPlayer.width / 2;
        
        // Player falls off if center is outside platform bounds
        if (playerCenter < platform.x || playerCenter > platform.x + platform.width) {
          newPlayer.onPlatform = null;
        }
      }
      
      // Check ground collision
      const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
      if (newPlayer.y + newPlayer.height >= groundY && newPlayer.velocityY > 0) {
        newPlayer.y = groundY - newPlayer.height;
        newPlayer.velocityY = 0;
        newPlayer.isJumping = false;
        newPlayer.onPlatform = null; // On ground, not on platform
      }
      
      // Check platform collisions (for landing on platforms) - simple collision only
      if (newPlayer.velocityY > 0 && newPlayer.y + newPlayer.height < groundY) { // Only when falling and above ground
        platforms.forEach(platform => {
          if (newPlayer.x < platform.x + platform.width &&
              newPlayer.x + newPlayer.width > platform.x &&
              newPlayer.y + newPlayer.height > platform.y &&
              newPlayer.y + newPlayer.height < platform.y + platform.height + 10) {
            
            newPlayer.y = platform.y - newPlayer.height;
            newPlayer.velocityY = 0;
            newPlayer.isJumping = false;
            newPlayer.onPlatform = platform;
          }
        });
      }
      
      return newPlayer;
    });
    
    // Update camera to follow player (only after first jump)
    setCamera(prev => {
      // Only start following camera if player has jumped above ground level
      if (player.y < CANVAS_HEIGHT - 100) {
        const targetY = player.y - CANVAS_HEIGHT * 0.6;
        return { y: targetY };
      }
      // Stay at ground level until first jump
      return { y: 0 };
    });
    
    // Update height score (based on brown ground position)
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
    const currentHeight = Math.max(0, Math.floor((groundY - player.y) / 10));
    setHeight(currentHeight);
    setMaxHeight(prev => Math.max(prev, currentHeight));
    
    // Check game over (much stricter death mechanic)
    // Player dies if they fall below their highest point by more than half a screen
    const highestY = groundY - (maxHeight * 10); // Convert height back to Y position
    if (player.y > highestY + CANVAS_HEIGHT * 0.7) {
      console.log('🎮 Game Over - fell too far!', { playerY: player.y, highestY, threshold: highestY + CANVAS_HEIGHT * 0.7 });
      setGameOver(true);
      onGameEnd?.(maxHeight, gameTime);
      return;
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, isCharging, chargeDirection, player, platforms, camera, maxHeight, gameTime, onGameEnd]);
  
  // Start game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);
  
  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !images.background) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Save context for camera transform
    ctx.save();
    ctx.translate(0, -camera.y);
    
    // Draw background (tiled)
    const bgHeight = images.background.height;
    const startY = Math.floor(camera.y / bgHeight) * bgHeight;
    for (let y = startY; y < camera.y + CANVAS_HEIGHT + bgHeight; y += bgHeight) {
      ctx.drawImage(images.background, 0, y);
    }
    
    // Draw brown ground
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
    ctx.fillStyle = '#8B4513'; // Brown color
    ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Draw platforms (gray only)
    platforms.forEach(platform => {
      if (platform.y > camera.y - 50 && platform.y < camera.y + CANVAS_HEIGHT + 50) {
        ctx.fillStyle = '#888888'; // Gray platforms
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      }
    });
    
    // Draw player (with wrap-around)
    const playerImage = player.isJumping ? images.jumping : images.standing;
    if (playerImage) {
      ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
      
      // Draw player on opposite side when wrapping around
      if (player.x < player.width) {
        // Player is partially off left edge, draw on right edge
        ctx.drawImage(playerImage, player.x + CANVAS_WIDTH, player.y, player.width, player.height);
      } else if (player.x > CANVAS_WIDTH - player.width) {
        // Player is partially off right edge, draw on left edge
        ctx.drawImage(playerImage, player.x - CANVAS_WIDTH, player.y, player.width, player.height);
      }
    }
    
    // Restore context
    ctx.restore();
    
    // Draw UI (not affected by camera)
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px LL Baguid, Arial, sans-serif';
    ctx.fillText(`HEIGHT: ${height}`, 20, 40);
    ctx.fillText(`TIME: ${gameTime.toFixed(1)}`, CANVAS_WIDTH - 200, 40);
    
    // Draw charge bar
    if (isCharging && images.chargingBar) {
      const barWidth = 30;
      const barHeight = 200;
      const barX = CANVAS_WIDTH - 50;
      const barY = 100;
      
      // Background
      ctx.fillStyle = '#333';
      ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);
      
      // Charge fill
      const fillHeight = chargeAmount * barHeight;
      ctx.drawImage(
        images.chargingBar, 
        0, images.chargingBar.height - (chargeAmount * images.chargingBar.height),
        images.chargingBar.width, chargeAmount * images.chargingBar.height,
        barX, barY + (barHeight - fillHeight),
        barWidth, fillHeight
      );
    }
  }, [player, platforms, camera, height, gameTime, isCharging, chargeAmount, images]);
  
  // Render loop
  useEffect(() => {
    const renderLoop = () => {
      render();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }, [render]);
  
  // Ref to avoid stale closures
  const handleJumpInputRef = useRef(handleJumpInput);
  useEffect(() => {
    handleJumpInputRef.current = handleJumpInput;
  }, [handleJumpInput]);

  // Set up Firebase communication
  useEffect(() => {
    if (gameStarted && sessionId) {
      console.log('🎮 Platformer game initializing Firebase with session:', sessionId);
      firebaseService.initializeSession(sessionId, 'MainDisplay', 'main-display');
      
      const unsubscribe = firebaseService.onNewInteractions((interaction) => {
        console.log('🎮 Platformer received interaction:', interaction);
        if (interaction.action === 'jump-action') {
          setCurrentPlayer(interaction.playerName);
          handleJumpInputRef.current();
        }
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [gameStarted, sessionId]);
  
  if (!gameStarted) {
    return (
      <div style={{
        backgroundColor: '#74c5ff',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
        fontFamily: 'LL Baguid, Arial, sans-serif',
        overflow: 'hidden'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '10px 0',
          color: '#000',
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>
          Platformer Game
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          marginBottom: '20px',
          textAlign: 'center',
          color: '#000',
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>
          Jump from platform to platform and reach new heights!<br/>
          Tap once to start charging, tap again to jump!
        </p>
        <button
          onClick={initializeGame}
          style={{
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '1.2rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: 'LL Baguid, Arial, sans-serif',
            fontWeight: 'bold'
          }}
        >
          Start Game
        </button>
      </div>
    );
  }
  
  if (gameOver) {
    return (
      <div style={{
        backgroundColor: '#74c5ff',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
        fontFamily: 'LL Baguid, Arial, sans-serif',
        overflow: 'hidden'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '10px 0',
          color: '#000',
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>
          Game Over!
        </h1>
        <div style={{ 
          fontSize: '1.2rem', 
          marginBottom: '20px',
          textAlign: 'center',
          color: '#000',
          fontFamily: 'LL Baguid, Arial, sans-serif'
        }}>
          <p style={{margin: '5px 0'}}>Player: {currentPlayer}</p>
          <p style={{margin: '5px 0'}}>Final Height: {maxHeight}</p>
          <p style={{margin: '5px 0'}}>Time: {gameTime.toFixed(1)}s</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={initializeGame}
            style={{
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1.2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: 'LL Baguid, Arial, sans-serif',
              fontWeight: 'bold'
            }}
          >
            Play Again
          </button>
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              style={{
                backgroundColor: '#74c5ff',
                color: 'black',
                border: '2px solid #000000',
                padding: '15px 30px',
                fontSize: '1.2rem',
                borderRadius: '12px',
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
    );
  }
  
  return (
    <div style={{
      backgroundColor: '#74c5ff',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px',
      fontFamily: 'LL Baguid, Arial, sans-serif',
      overflow: 'hidden',
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
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleJumpInput}
        style={{
          border: '3px solid #000',
          borderRadius: '12px',
          cursor: 'pointer',
          backgroundColor: '#87CEEB',
          maxHeight: 'calc(100vh - 100px)'
        }}
      />
      <div style={{
        marginTop: '10px',
        textAlign: 'center',
        color: '#000',
        fontSize: '0.9rem',
        fontFamily: 'LL Baguid, Arial, sans-serif'
      }}>
        <p style={{margin: '5px 0'}}>Tap once to start charging, tap again to jump!</p>
        <p style={{margin: '5px 0'}}>Use your phone to control the character!</p>
      </div>
    </div>
  );
};

export default PlatformerGame;
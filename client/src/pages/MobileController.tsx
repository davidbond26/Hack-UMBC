import React, { useState } from 'react';

const MobileController: React.FC = () => {
  const [buttonPressed, setButtonPressed] = useState(false);
  const [pressCount, setPressCount] = useState(0);

  const handleButtonPress = () => {
    setButtonPressed(true);
    setPressCount(prev => prev + 1);
    
    // Reset the press state after animation
    setTimeout(() => {
      setButtonPressed(false);
    }, 150);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col items-center justify-center p-4"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #9333ea, #2563eb)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          🎮 Game Controller
        </h1>
        <p className="text-purple-100 text-lg">
          Your mobile game controller
        </p>
      </div>

      {/* Main Button */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={handleButtonPress}
          className={`
            w-48 h-48 rounded-full text-white font-bold text-xl
            transition-all duration-150 ease-in-out
            shadow-2xl border-4 border-white/20
            ${buttonPressed 
              ? 'bg-green-500 scale-95 shadow-lg' 
              : 'bg-red-500 hover:bg-red-400 active:scale-95'
            }
          `}
        >
          {buttonPressed ? '✅' : '🔴'}
          <div className="text-sm mt-2">
            {buttonPressed ? 'PRESSED!' : 'TAP ME'}
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 w-full max-w-sm">
        <div className="text-center text-white">
          <p className="text-sm opacity-80">Button Presses</p>
          <p className="text-3xl font-bold">{pressCount}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-purple-200 text-sm">
          Connected to Game Session
        </p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
          <span className="text-white text-xs">Online</span>
        </div>
      </div>
    </div>
  );
};

export default MobileController;
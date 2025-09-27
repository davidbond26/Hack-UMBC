import React from 'react';

const MainDisplay: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="p-6 text-center border-b border-white/20">
        <h1 className="text-4xl font-bold mb-2">🎮 Hackathon Game Hub</h1>
        <p className="text-xl text-blue-200">Multi-Device Gaming Experience</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Welcome to the Game!</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Scan the QR code with your phone to join the game and control it from your mobile device.
            Play through mini-games and fill out your personalized bingo board!
          </p>
        </div>

        {/* QR Code Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto mb-12">
          <h3 className="text-xl font-semibold mb-4 text-center">Join with Your Phone</h3>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-black text-sm mb-2">QR Code will go here</div>
            <div className="w-48 h-48 bg-gray-200 rounded mx-auto flex items-center justify-center">
              <span className="text-gray-500">📱 QR CODE</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-300 mt-4">
            Scan to access mobile controller
          </p>
        </div>

        {/* Game Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <h4 className="text-lg font-semibold mb-2">Players Connected</h4>
            <div className="text-3xl font-bold text-green-400">0</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <h4 className="text-lg font-semibold mb-2">Current Game</h4>
            <div className="text-xl text-yellow-400">Waiting to Start</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <h4 className="text-lg font-semibold mb-2">Games Completed</h4>
            <div className="text-3xl font-bold text-blue-400">0</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 text-gray-400">
        <p>Built for UMBC Hackathon • Multi-device gaming experience</p>
      </footer>
    </div>
  );
};

export default MainDisplay;
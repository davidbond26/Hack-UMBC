import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainDisplay from './components/MainDisplay';
import Controller from './components/Controller';
import QRCodeGenerator from './components/QRCodeGenerator';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'game'>('start');

  const handlePlayerJoin = (playerId: string) => {
    console.log('Player joined:', playerId);
    // Handle player joining logic here
  };

  const handleScreenClick = () => {
    if (currentScreen === 'start') {
      setCurrentScreen('game');
    }
  };

  const StartScreen = () => (
    <div
      className="w-screen h-screen bg-[#74c5ff] flex flex-col justify-between items-center px-10 py-15 cursor-pointer text-black"
      onClick={handleScreenClick}
    >
      {/* Title at top */}
      <div className="text-7xl font-bold text-center mt-10" style={{ fontFamily: 'LL Baguid, Arial, sans-serif' }}>
        Game Mash
      </div>

      {/* QR Code in center */}
      <div className="flex justify-center items-center flex-1">
        <QRCodeGenerator onPlayerJoin={handlePlayerJoin} />
      </div>

      {/* Press to Start at bottom */}
      <div className="text-3xl text-center mb-10 animate-pulse" style={{ fontFamily: 'LL Baguid, Arial, sans-serif' }}>
        (Press to Start)
      </div>
    </div>
  );

  const GameScreen = () => (
    <div className="w-screen h-screen bg-[#74c5ff] flex justify-center items-center text-black">
      <div className="text-5xl text-center">
        Game Started!
        <div className="text-2xl mt-5">
          This is where minigames will appear
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              currentScreen === 'start' ? <StartScreen /> : <GameScreen />
            }
          />
          <Route
            path="/controller/:sessionId"
            element={<Controller />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

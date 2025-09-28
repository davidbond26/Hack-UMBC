import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainDisplay from './components/MainDisplay';
import Controller from './components/Controller';
import QRCodeGenerator from './components/QRCodeGenerator';
import MemoryGame from './components/games/MemoryGame';
import PlatformerGame from './components/games/PlatformerGame';
import RacingGame from './components/games/RacingGame';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'memory' | 'racing' | 'platformer'>('start');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Generate session ID when app starts
    const newSessionId = 'game-session-' + Date.now();
    setSessionId(newSessionId);
  }, []);

  const handlePlayerJoin = (playerId: string) => {
    console.log('Player joined:', playerId);
    // Handle player joining logic here
  };

  const handleGameEnd = (score: number, moves: number) => {
    console.log('Memory game completed!', { score, moves });
    // TODO: Send game stats to Firebase for bingo board
  };

  const handleScreenClick = () => {
    if (currentScreen === 'start') {
      setCurrentScreen('memory'); // Default to memory game for now
    }
  };

  const switchToRacing = () => {
    setCurrentScreen('racing');
  };

  const switchToMemory = () => {
    setCurrentScreen('memory');
  };

  const switchToPlatformer = () => {
    setCurrentScreen('platformer');
  };

  const backToMenu = () => {
    setCurrentScreen('start');
  };

  const StartScreen = () => (
    <div
      className="w-screen h-screen bg-[#74c5ff] flex flex-col justify-between items-center px-10 py-15 text-black"
    >
      {/* Title at top */}
      <div className="text-7xl font-bold text-center mt-10" style={{ fontFamily: 'LL Baguid, Arial, sans-serif' }}>
        Game Mash
      </div>

      {/* QR Code in center */}
      <div className="flex justify-center items-center flex-1">
        <QRCodeGenerator onPlayerJoin={handlePlayerJoin} sessionId={sessionId} />
      </div>

      {/* Game selection buttons - temporary for testing */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={switchToMemory}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          style={{ fontFamily: 'LL Baguid, Arial, sans-serif' }}
        >
          Memory Game
        </button>
        <button
          onClick={switchToRacing}
          className="bg-yellow-600 text-white px-4 py-2 rounded"
          style={{ fontFamily: 'LL Baguid, Arial, sans-serif' }}
        >
          Racing Game
        </button>
        <button
          onClick={switchToPlatformer}
          className="bg-green-600 text-white px-4 py-2 rounded"
          style={{ fontFamily: 'LL Baguid, Arial, sans-serif' }}
        >
          Platformer Game
        </button>
      </div>
    </div>
  );

  const GameScreen = () => {
    if (currentScreen === 'racing') {
      return <RacingGame onGameEnd={handleGameEnd} onBackToMenu={backToMenu} sessionId={sessionId} />;
    }
    if (currentScreen === 'platformer') {
      return <PlatformerGame onGameEnd={handleGameEnd} onBackToMenu={backToMenu} sessionId={sessionId} />;
    }
    return <MemoryGame onGameEnd={handleGameEnd} onBackToMenu={backToMenu} sessionId={sessionId} />;
  };

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

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QRCodeGenerator from './components/QRCodeGenerator';
import Controller from './components/Controller';
import './App.css';

function App() {
  const handlePlayerJoin = (playerId: string) => {
    console.log('Player joined:', playerId);
    // Handle player joining logic here
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <div className="main-game">
                <header className="App-header">
                  <h1>Hack UMBC Game</h1>
                  <QRCodeGenerator onPlayerJoin={handlePlayerJoin} />
                  <div className="game-area">
                    <p>Main game will be displayed here</p>
                  </div>
                </header>
              </div>
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

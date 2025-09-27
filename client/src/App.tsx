import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainDisplay from './components/MainDisplay';
import Controller from './components/Controller';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainDisplay />} />
          <Route path="/controller/:sessionId" element={<Controller />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

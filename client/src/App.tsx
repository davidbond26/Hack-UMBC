import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainDisplay from './pages/MainDisplay';
import MobileController from './pages/MobileController';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDisplay />} />
        <Route path="/mobile" element={<MobileController />} />
      </Routes>
    </Router>
  );
}

export default App;

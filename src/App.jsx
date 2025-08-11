// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import './styles/main.css';
import { AuthProvider } from './context/AuthContext';
import RouletteGame from './pages/ruleta/Roulette';
import BlackjackGame from './pages/blackjack/blackjack';
import ProtectedRoute from './components/ProtectedRoute';
import Saldo from './pages/saldo/Saldo';

 // testeo 3
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app bg-dark text-light">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/ruleta" element={<RouletteGame />} />
              <Route path="/blackjack" element={<BlackjackGame />} />
              <Route path="/saldo" element={<Saldo />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
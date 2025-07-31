// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import './styles/main.css';
import { AuthContext } from './context/AuthContext';
import RouletteGame from './pages/ruleta/Roulette';
import BlackjackGame from './pages/blackjack/blackjack';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
      <Router>
        <div className="app bg-dark text-light">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/ruleta' element={<RouletteGame />}/>
            <Route path='/blackjack' element={< BlackjackGame/>}/>
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
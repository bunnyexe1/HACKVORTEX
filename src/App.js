// src/App.js
import React, { useState, useEffect } from 'react'; // Added useEffect, though not used in this version
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'; // Added useNavigate
import './AppStyles.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import CollectionPage from './pages/CollectionPage';
import AboutPage from './pages/AboutPage';
import HowToUsePage from './pages/HowToUsePage';

function AppContent() { // Create a new component to use useNavigate
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState(null);

  // This function will be called by Header's "Connect Wallet" button
  const handleHeaderConnectWallet = () => {
    // If on home page, HomePage's useEffect will handle connection.
    // If on other pages, navigate to home to trigger connection logic.
    if (!walletAddress) {
      // Check if already on HomePage to avoid redundant navigation
      if (window.location.pathname !== "/") {
        navigate('/');
      }
      // If already on HomePage, its own connectWallet logic should be triggered/is active.
      // Optionally, HomePage could expose a manual trigger function via context/ref if needed here.
      // For now, navigating to home ensures HomePage is mounted and its connect logic runs.
      console.log("Header's Connect Wallet clicked. Navigating to Home if not already there.");
    }
  };

  return (
    <div className="App">
      <Header walletAddress={walletAddress} onConnectWallet={handleHeaderConnectWallet} />
      <main className="App-main">
        <Routes>
          <Route path="/" element={<HomePage setWalletAddressInHeader={setWalletAddress} />} />
          {/* AdminPage might also need wallet features eventually, e.g. to know the lister's address */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/collection" element={<CollectionPage setWalletAddressInHeader={setWalletAddress} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
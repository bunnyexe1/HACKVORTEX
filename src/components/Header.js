// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import Navigation from './Navigation';

// Props: walletAddress (string|null), onConnectWallet (function)
function Header({ walletAddress, onConnectWallet }) {
  return (
    <header className="site-header">
      <div className="header-main">
        <div className="header-logo">
          <Link to="/">NFTMarketplace</Link>
        </div>
        <div className="header-search">
          <input type="text" placeholder="Search" className="search-input input-base" />
        </div>
        <Navigation />
        <div className="header-account-actions">
          {walletAddress ? (
            <div className="wallet-display" title={walletAddress}> {/* Added title for full address on hover */}
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          ) : (
            <button
              onClick={onConnectWallet} // This is connected to App.js's handler
              className="connect-wallet-button button-base button-primary"
            >
              Connect Wallet
            </button>
          )}
          <Link to="/collection" className="header-button-link button-base button-light">My Collection</Link>
          <Link to="/admin" className="header-button-link button-base button-light">Admin</Link>
        </div>
      </div>
    </header>
  );
}
export default Header;

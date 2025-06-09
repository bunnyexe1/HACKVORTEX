import React from 'react';
import './Header.css';
import Navigation from './Navigation'; // We'll create this next

function Header() {
  return (
    <header className="site-header">
      <div className="header-main">
        <div className="header-logo">
          {/* Placeholder for logo, can be text or SVG/img later */}
          <a href="/">NFTMarketplace</a>
        </div>
        <div className="header-search">
          {/* Search bar placeholder */}
          <input type="text" placeholder="Search" className="search-input" />
        </div>
        <Navigation />
        <div className="header-account-actions">
          {/* Placeholders for account actions */}
          <button>Log In</button>
          <button>Create Account</button>
          {/* Placeholder for location preferences - might be a button or link */}
          <span>Location</span>
        </div>
      </div>
    </header>
  );
}

export default Header;

import React from 'react';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="main-navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li className="dropdown-container">
          <a href="/shop">Shop</a>
          {/* Basic dropdown placeholder - actual dropdowns are more complex */}
          <ul className="dropdown-menu basic-dropdown">
            <li>Categories</li>
            <li>Collections</li>
            <li>Featured Brands</li>
          </ul>
        </li>
        <li><a href="/editorial">Editorial</a></li>
        <li className="dropdown-container">
          <a href="/timeline">Timeline</a>
          <ul className="dropdown-menu basic-dropdown">
            <li>Upcoming Releases</li>
            <li>New Releases</li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;

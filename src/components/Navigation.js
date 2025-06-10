// src/components/Navigation.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './Navigation.css';

function Navigation() {
  return (
    <nav className="main-navigation">
      <ul>
        <li><Link to="/">Home</Link></li> {/* Changed to Link */}
        <li className="dropdown-container">
          {/* The main "Shop" link might also go to a general shop page */}
          <Link to="/shop">Shop</Link> {/* Changed to Link, assuming /shop is a valid route placeholder */}
          <ul className="dropdown-menu basic-dropdown">
            {/* These could be Links too if they lead to specific filtered pages */}
            <li><Link to="/shop/categories">Categories</Link></li>
            <li><Link to="/shop/collections">Collections</Link></li>
            <li><Link to="/shop/brands">Featured Brands</Link></li>
          </ul>
        </li>
        <li><Link to="/editorial">Editorial</Link></li> {/* Changed to Link */}
        <li className="dropdown-container">
          <Link to="/timeline">Timeline</Link> {/* Changed to Link */}
          <ul className="dropdown-menu basic-dropdown">
            <li><Link to="/timeline/upcoming">Upcoming Releases</Link></li>
            <li><Link to="/timeline/new">New Releases</Link></li>
          </ul>
        </li>
        {/* Adding About and HowToUse to the main nav as per original App.js structure */}
        <li><Link to="/about">About</Link></li>
        <li><Link to="/how-to-use">How to Use</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;

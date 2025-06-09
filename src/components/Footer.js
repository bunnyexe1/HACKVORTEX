import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-newsletter">
          <h5>Sign up for exclusive promos, popular releases & more</h5>
          <form className="newsletter-form">
            <input type="email" placeholder="Email Address" className="newsletter-input" />
            <button type="submit" className="newsletter-button">Sign Up</button>
          </form>
          <p className="newsletter-disclaimer">
            By signing up, you confirm you want to receive emails about GOAT's products and services and you agree to our Terms & Conditions and Privacy Policy.
          </p>
        </div>

        <div className="footer-links-wrapper">
          <div className="footer-links-section">
            <h6>About</h6>
            <ul>
              <li><a href="/about-us">About Us</a></li>
              <li><a href="https://boards.greenhouse.io/goatgroup" target="_blank" rel="noopener noreferrer">Careers</a></li>
              <li><a href="/app">GOAT App</a></li>
            </ul>
          </div>
          <div className="footer-links-section">
            <h6>Support</h6>
            <ul>
              <li><a href="https://support.goat.com/hc/en-us" target="_blank" rel="noopener noreferrer">GOAT Support</a></li>
              <li><a href="/gift-cards/balance">Check Gift Card Balance</a></li>
            </ul>
          </div>
          <div className="footer-links-section">
            <h6>Buy</h6>
            <ul>
              <li><a href="/verification">Assurance of Authenticity</a></li>
              <li><a href="/buyer-protection-guarantee">Buyer Protection Policy</a></li>
              <li><a href="/goat-clean">GOAT Clean</a></li>
              <li><a href="/gift-cards">Gift Cards</a></li>
              <li><a href="/returns">Shipping and Returns</a></li>
            </ul>
          </div>
          <div className="footer-links-section">
            <h6>Sell</h6>
            <ul>
              <li><a href="/selling">Selling on GOAT</a></li>
              <li><a href="/fees">Fee Policy</a></li>
              <li><a href="/goat-group-dropoff-policy">Drop Off</a></li>
            </ul>
          </div>
          <div className="footer-links-section">
            <h6>Terms and Preferences</h6>
            <ul>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/privacy">Your Privacy Choices</a></li>
              <li><button className="link-button">Location Preferences</button></li>
              <li><a href="/accessibility">Accessibility</a></li>
              <li><a href="/sitemap-html">Sitemap</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-app-download">
          <p>Never miss a drop again. Download the GOAT app for reminders and exclusive promotions.</p>
          <a href="https://goat.app.link/C8eM8PorVbb" target="_blank" rel="noopener noreferrer" className="download-app-button">Download App</a>
        </div>
      </div>
      <div className="footer-copyright">
        <span>© {new Date().getFullYear()} NFTMarketplace, Inc. All Rights Reserved</span>
      </div>
    </footer>
  );
}

export default Footer;

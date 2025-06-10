// src/pages/HowToUsePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HowToUsePage.css'; // Create this CSS file

function HowToUsePage() {
  return (
    <div className="static-page-container how-to-use-container">
      <div className="how-to-use-hero">
        <h1 className="how-to-use-title">Getting Started with Authentix</h1>
        <p className="how-to-use-subtitle">A step-by-step guide to using our NFT marketplace</p>
      </div>

      <div className="steps-container">
        {/* Step 1 */}
        <div className="step-card">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Install MetaMask</h3>
            <p>First, you'll need a cryptocurrency wallet. We recommend MetaMask, which is available as a browser extension.</p>
            <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer" className="step-link">
              Download MetaMask
            </a>
          </div>
        </div>
        {/* Step 2 */}
        <div className="step-card">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Connect to Sepolia Testnet</h3>
            <p>Our marketplace currently operates on the Sepolia test network. In MetaMask:</p>
            <ul className="step-instructions">
              <li>Click the network dropdown (usually says "Ethereum Mainnet")</li>
              <li>Select "Show test networks"</li>
              <li>Choose "Sepolia Test Network"</li>
            </ul>
          </div>
        </div>
        {/* Step 3 */}
        <div className="step-card">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Get Test ETH</h3>
            <p>You'll need Sepolia ETH to make transactions. Visit a faucet and enter your wallet address to receive test ETH.</p>
            {/* Using a generic search link for faucets as direct links can become outdated */}
            <a href="https://www.google.com/search?q=sepolia+eth+faucet" target="_blank" rel="noopener noreferrer" className="step-link">
              Find a Sepolia Faucet
            </a>
          </div>
        </div>
        {/* Step 4 */}
        <div className="step-card">
          <div className="step-number">4</div>
          <div className="step-content">
            <h3>Connect Your Wallet</h3>
            <p>Click the "Connect Wallet" button in the top right corner of our marketplace and follow the prompts in MetaMask.</p>
          </div>
        </div>
        {/* Step 5 */}
        <div className="step-card">
          <div className="step-number">5</div>
          <div className="step-content">
            <h3>Browse and Buy NFTs</h3>
            <p>Once connected, you can browse available NFTs. Click "Buy Now" on any item to purchase it using your test ETH.</p>
          </div>
        </div>
        {/* Step 6 */}
        <div className="step-card">
          <div className="step-number">6</div>
          <div className="step-content">
            <h3>View Your Collection</h3>
            <p>After purchasing, visit the "My Collection" page to see your owned NFTs and request physical delivery if available.</p>
            <Link to="/collection" className="step-link">
              Go to My Collection
            </Link>
          </div>
        </div>
      </div>

      <div className="troubleshooting-section">
        <h2 className="troubleshooting-title">Troubleshooting</h2>
        <div className="troubleshooting-content-grid">
          <div className="issue-card">
            <h4>Transactions failing?</h4>
            <p>Make sure you have enough Sepolia ETH and are connected to the Sepolia network.</p>
          </div>
          <div className="issue-card">
            <h4>Images not loading?</h4>
            <p>IPFS can sometimes be slow. Try refreshing the page or waiting a few moments.</p>
          </div>
          <div className="issue-card">
            <h4>Wallet not connecting?</h4>
            <p>Try refreshing the page and ensuring MetaMask is properly installed.</p>
          </div>
        </div>
      </div>

      <div className="cta-section"> {/* Reusing .cta-section from AboutPage.css for consistency */}
        <Link to="/" className="cta-button">
          Start Exploring the Marketplace
        </Link>
      </div>
    </div>
  );
}

export default HowToUsePage;

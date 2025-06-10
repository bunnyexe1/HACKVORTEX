// src/pages/AboutPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css'; // Create this CSS file

function AboutPage() {
  // hoveredButton state and handlers are removed for simplicity, CSS hover effects will be used.
  return (
    <div className="static-page-container about-container">
      {/* Header is globally rendered by App.js, so no specific back link needed here unless design dictates */}
      <div className="about-hero">
        <h1 className="about-title">Authentix: Ensuring Luxury Authenticity</h1>
        <p className="about-subtitle">Securing Luxury Products with Digital Twins</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2 className="section-title">The Counterfeit Challenge in Luxury Goods</h2>
          <p className="section-text">
            The luxury goods market is plagued by counterfeit products that undermine brand integrity and deceive consumers.
            Fake luxury items dilute the value of authentic products and erode trust in the industry.
          </p>
        </section>

        <section className="about-section">
          <h2 className="section-title">Our Blockchain Solution</h2>
          <p className="section-text">
            Authentix combats counterfeiting by creating a digital twin for every luxury product in the form of an NFT.
            As long as you own the physical item, you hold its corresponding NFT, ensuring undeniable proof of authenticity.
          </p>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Digital Twin Ownership</h3>
              <p>Each luxury product is paired with a unique NFT, verifying its authenticity.</p>
            </div>
            <div className="feature-card">
              <h3>Immutable Provenance</h3>
              <p>Blockchain records provide a tamper-proof history of ownership.</p>
            </div>
            <div className="feature-card">
              <h3>Secure Resale</h3>
              <p>Transfer NFT ownership with the physical product for verified resale.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">Eliminating Counterfeit Goods</h2>
          <p className="section-text">
            By linking each luxury product to its NFT, Authentix ensures only verified digital twins enter the resale market.
            When you sell your item, the NFT is transferred to the new owner, maintaining a secure chain of custody. Buyers can verify:
          </p>
          <ul className="benefits-list">
            <li>◉ Authenticity of the product</li>
            <li>◉ Original purchase details</li>
            <li>◉ Ownership history</li>
            <li>◉ Limited edition status</li>
          </ul>
        </section>

        <section className="about-section">
          <h2 className="section-title">Redefining Luxury Ownership</h2>
          <p className="section-text">
            Authentix is more than a marketplace—it's a new standard for luxury ownership.
            Our NFTs serve as certificates of authenticity and unlock exclusive benefits, ensuring your investment is protected:
          </p>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>Verified Resale Market</h3>
              <p>Trade luxury goods with confidence, backed by blockchain verification.</p>
            </div>
            <div className="benefit-card">
              <h3>Exclusive Access</h3>
              <p>NFT holders gain access to private sales and limited-edition drops.</p>
            </div>
            <div className="benefit-card">
              <h3>Physical Redemption</h3>
              <p>Request delivery of your luxury item with its verified digital twin.</p>
            </div>
          </div>
        </section>

        <div className="cta-section">
          <h2 className="cta-title">Join the Authenticity Revolution</h2>
          <p className="cta-text">
            Be part of Authentix, where luxury meets transparency, and every product is guaranteed authentic
            through blockchain-backed digital twins.
          </p>
          <Link to="/" className="cta-button">
            Explore the Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;

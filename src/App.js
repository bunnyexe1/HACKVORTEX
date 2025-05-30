import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import NFTMarketplace from "./NFTMarketplace.json";
import './AppStyles.css';

const CONTRACT_ADDRESS = "0x280cfD737f25B769ACDeF66593fbC8cB8feF99AC";
const PINATA_API_KEY = "306776bc7e53b9919849";
const PINATA_SECRET_KEY = "5e4e0f567f83838489afd66d67678e48d694062469871ee4f00d9dbcff0ab821";

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const loadNFTs = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, provider);
      const count = await contract.listingCount();

      let items = [];
      for (let i = 0; i < count; i++) {
        const listing = await contract.listings(i);
        const imageUrl = listing.imageURL;
        items.push({
          id: i,
          tokenId: listing.tokenId.toString(),
          price: ethers.utils.formatEther(listing.price),
          imageUrl: imageUrl,
          seller: listing.seller.toLowerCase(),
          buyer: listing.buyer.toLowerCase(),
          sold: listing.sold,
          redeemed: listing.redeemed
        });
      }
      setListings(items);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    }
    setLoading(false);
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address.toLowerCase());
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }, []);

  useEffect(() => {
    connectWallet();
    loadNFTs();
  }, [connectWallet, loadNFTs]);

  function extractCid(url) {
    if (!url) return "";
    if (url.includes("ipfs/")) {
      const parts = url.split("ipfs/");
      return parts[parts.length - 1];
    } else if (url.startsWith("ipfs://")) {
      return url.replace("ipfs://", "");
    } else if (url.match(/^[a-zA-Z0-9]{46}$/)) {
      return url;
    }
    return url;
  }

  async function buyNFT(listingId, price) {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, signer);

      const tx = await contract.buyNFT(listingId, { value: ethers.utils.parseEther(price) });
      await tx.wait();
      alert("NFT Purchased!");
      loadNFTs();
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Error purchasing NFT: " + error.message);
    }
  }

  async function redeemNFT(listingId) {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, signer);

      const tx = await contract.redeemNFT(listingId);
      await tx.wait();
      alert("Physical redemption request submitted!");
      loadNFTs();
    } catch (error) {
      console.error("Redemption failed:", error);
      alert("Error redeeming NFT: " + error.message);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="headerContainer">
          <h1 className="headerTitle">Authentix</h1>
          <div className="headerActions">
            <div className="walletAddress">
              {walletAddress ? 
                `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
                "Not Connected"
              }
            </div>
            <Link 
              to="/collection" 
              className="adminButton"
              onMouseEnter={() => setHoveredButton('collection')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{ marginRight: '10px' }}
            >
              My Collection
            </Link>
            <Link 
              to="/admin" 
              className="adminButton"
              onMouseEnter={() => setHoveredButton('admin')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{ marginRight: '10px' }}
            >
              Admin
            </Link>
            <Link 
              to="/about" 
              className="adminButton"
              onMouseEnter={() => setHoveredButton('about')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{ marginRight: '10px' }}
            >
              About
            </Link>
            <Link 
              to="/how-to-use" 
              className="adminButton"
              onMouseEnter={() => setHoveredButton('how-to-use')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              How to Use
            </Link>
          </div>
        </div>
      </header>

      <main className="mainContent">
        {loading ? (
          <div className="loadingContainer">
            <div className="spinner"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="emptyState">
            <h2 className="emptyStateTitle">No NFTs available.</h2>
            <p className="emptyStateText">Visit the Admin page to list some!</p>
            <Link 
              to="/admin" 
              className="emptyStateButton"
              onMouseEnter={() => setHoveredButton('emptyAdmin')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Go to Admin
            </Link>
          </div>
        ) : (
          <div className="cardGrid">
            {listings.map((nft) => {
              const cid = extractCid(nft.imageUrl);
              const isOwner = nft.sold && nft.buyer === walletAddress;
              const isHovered = hoveredCard === nft.id;

              return (
                <div
                  key={nft.id}
                  className={`card ${isHovered ? 'cardHover' : ''} ${nft.sold ? 'soldCard' : ''}`}
                  onMouseEnter={() => setHoveredCard(nft.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="imageContainer">
                    {cid ? (
                      <img
                        src={`https://ipfs.io/ipfs/${cid}`}
                        alt={`NFT ${nft.tokenId}`}
                        className="image"
                        onError={(e) => {
                          console.error("Image failed to load:", e);
                          e.target.src = nft.imageUrl;
                        }}
                      />
                    ) : (
                      <img 
                        src={nft.imageUrl} 
                        alt={`NFT ${nft.tokenId}`} 
                        className="image" 
                      />
                    )}
                    {nft.sold && (
                      <div className="statusBadge">
                        {nft.redeemed ? "Redeemed" : "Sold"}
                      </div>
                    )}
                  </div>
                  
                  <div className="cardContent">
                    <div className="cardHeader">
                      <div className="tokenId">Token ID: {nft.tokenId}</div>
                      <div className="price">{nft.price} ETH</div>
                    </div>

                    <div className="sellerInfo">
                      <div className="address">
                        Seller: {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
                      </div>
                      {nft.sold && nft.buyer !== "0x0000000000000000000000000000000000000000" && (
                        <div className="address">
                          Buyer: {nft.buyer.slice(0, 6)}...{nft.buyer.slice(-4)}
                        </div>
                      )}
                    </div>

                    {!nft.sold ? (
                      <button
                        onClick={() => buyNFT(nft.id, nft.price)}
                        className={`buyButton ${hoveredButton === `buy-${nft.id}` ? 'buyButtonHover' : ''}`}
                        onMouseEnter={() => setHoveredButton(`buy-${nft.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Buy Now
                      </button>
                    ) : isOwner && !nft.redeemed ? (
                      <button
                        onClick={() => redeemNFT(nft.id)}
                        className={`redeemButton ${hoveredButton === `redeem-${nft.id}` ? 'redeemButtonHover' : ''}`}
                        onMouseEnter={() => setHoveredButton(`redeem-${nft.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Request Physical Delivery
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Admin() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewCid, setPreviewCid] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  async function uploadToPinata() {
    if (!file) return alert("Please select a file");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          "Content-Type": "multipart/form-data",
        },
      });
      const cid = res.data.IpfsHash;
      setPreviewCid(cid);
      return cid;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      setUploading(false);
      return null;
    }
  }

  async function listNFT() {
    if (!name || !price || !file) return alert("Please fill all fields");

    try {
      const imageCid = await uploadToPinata();
      if (!imageCid) {
        alert("Failed to upload image. Please try again.");
        setUploading(false);
        return;
      }

      const imageUrl = `ipfs://${imageCid}`;

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, signer);

      const priceInWei = ethers.utils.parseEther(price);
      const tx = await contract.createAndListNFT(priceInWei, imageUrl);
      await tx.wait();

      setName("");
      setPrice("");
      setFile(null);
      setFilePreview(null);
      setPreviewCid("");

      alert("NFT Listed Successfully!");
    } catch (error) {
      console.error("Error listing NFT:", error);
      alert("Error listing NFT: " + error.message);
    }
    setUploading(false);
  }

  return (
    <div className="container">
      <header className="header">
        <div className="headerContainer">
          <Link 
            to="/" 
            className="backLink"
            onMouseEnter={() => setHoveredButton('back')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="backIcon">←</span> Back to Marketplace
          </Link>
        </div>
      </header>

      <main className="adminContainer">
        <div className="formContainer">
          <div className="formHeader">
            <h1 className="formTitle">List New NFT</h1>
          </div>
          
          <div className="formContent">
            <div className="formGroup">
              <label htmlFor="nft-name" className="label">
                NFT Name
              </label>
              <input
                id="nft-name"
                type="text"
                placeholder="Enter NFT name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>
            
            <div className="formGroup">
              <label htmlFor="nft-price" className="label">
                Price (ETH)
              </label>
              <input
                id="nft-price"
                type="text"
                placeholder="0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input"
              />
            </div>
            
            <div className="formGroup">
              <label className="label">
                NFT Image
              </label>
              <div className="fileUpload">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="uploadIcon"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Drag & drop your file here, or click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  id="file-input"
                />
                <button 
                  onClick={() => document.getElementById('file-input').click()}
                  className={`buyButton ${hoveredButton === 'browse' ? 'buyButtonHover' : ''}`}
                  onMouseEnter={() => setHoveredButton('browse')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Browse Files
                </button>
                {file && <p style={{ marginTop: "8px" }}>{file.name}</p>}
              </div>
            </div>
            
            <button
              onClick={listNFT}
              disabled={uploading || !name || !price || !file}
              className={uploading || !name || !price || !file 
                ? "disabledButton"
                : `buyButton ${hoveredButton === 'list' ? 'buyButtonHover' : ''}`}
              onMouseEnter={() => {
                if (!uploading && name && price && file) {
                  setHoveredButton('list');
                }
              }}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {uploading ? "Uploading & Listing..." : "List NFT"}
            </button>
          </div>
        </div>

        {(filePreview || previewCid) && (
          <div className="previewGrid" style={{ 
            gridTemplateColumns: filePreview && previewCid ? "1fr 1fr" : "1fr" 
          }}>
            {filePreview && (
              <div className="previewCard">
                <h3 className="previewTitle">Local Preview</h3>
                <img
                  src={filePreview}
                  alt="Local Preview"
                  className="previewImage"
                />
              </div>
            )}

            {previewCid && (
              <div className="previewCard">
                <h3 className="previewTitle">IPFS Preview</h3>
                <img
                  src={`https://ipfs.io/ipfs/${previewCid}`}
                  alt="IPFS Preview"
                  className="previewImage"
                />
                <p className="cidText">
                  CID: {previewCid}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function About() {
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div className="container">
      <header className="header">
        <div className="headerContainer">
          <Link 
            to="/" 
            className="backLink"
            onMouseEnter={() => setHoveredButton('back')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="backIcon">←</span> Back to Marketplace
          </Link>
        </div>
      </header>

      <main className="aboutContainer">
        <div className="aboutHero">
          <h1 className="aboutTitle">Authentix: Ensuring Luxury Authenticity</h1>
          <p className="aboutSubtitle">Securing Luxury Products with Digital Twins</p>
        </div>

        <div className="aboutContent">
          <section className="aboutSection">
            <h2 className="sectionTitle">The Counterfeit Challenge in Luxury Goods</h2>
            <p className="sectionText">
              The luxury goods market is plagued by counterfeit products that undermine brand integrity and deceive consumers. 
              Fake luxury items dilute the value of authentic products and erode trust in the industry.
            </p>
          </section>

          <section className="aboutSection">
            <h2 className="sectionTitle">Our Blockchain Solution</h2>
            <p className="sectionText">
              Authentix combats counterfeiting by creating a digital twin for every luxury product in the form of an NFT. 
              As long as you own the physical item, you hold its corresponding NFT, ensuring undeniable proof of authenticity.
            </p>
            <div className="featureGrid">
              <div className="featureCard">
                <h3>Digital Twin Ownership</h3>
                <p>Each luxury product is paired with a unique NFT, verifying its authenticity.</p>
              </div>
              <div className="featureCard">
                <h3>Immutable Provenance</h3>
                <p>Blockchain records provide a tamper-proof history of ownership.</p>
              </div>
              <div className="featureCard">
                <h3>Secure Resale</h3>
                <p>Transfer NFT ownership with the physical product for verified resale.</p>
              </div>
            </div>
          </section>

          <section className="aboutSection">
            <h2 className="sectionTitle">Eliminating Counterfeit Goods</h2>
            <p className="sectionText">
              By linking each luxury product to its NFT, Authentix ensures only verified digital twins enter the resale market. 
              When you sell your item, the NFT is transferred to the new owner, maintaining a secure chain of custody. Buyers can verify:
            </p>
            <ul className="benefitsList">
              <li>◉ Authenticity of the product</li>
              <li>◉ Original purchase details</li>
              <li>◉ Ownership history</li>
              <li>◉ Limited edition status</li>
            </ul>
          </section>

          <section className="aboutSection">
            <h2 className="sectionTitle">Redefining Luxury Ownership</h2>
            <p className="sectionText">
              Authentix is more than a marketplace—it's a new standard for luxury ownership. 
              Our NFTs serve as certificates of authenticity and unlock exclusive benefits, ensuring your investment is protected:
            </p>
            <div className="benefitsGrid">
              <div className="benefitCard">
                <h3>Verified Resale Market</h3>
                <p>Trade luxury goods with confidence, backed by blockchain verification.</p>
              </div>
              <div className="benefitCard">
                <h3>Exclusive Access</h3>
                <p>NFT holders gain access to private sales and limited-edition drops.</p>
              </div>
              <div className="benefitCard">
                <h3>Physical Redemption</h3>
                <p>Request delivery of your luxury item with its verified digital twin.</p>
              </div>
            </div>
          </section>

          <div className="ctaSection">
            <h2 className="ctaTitle">Join the Authenticity Revolution</h2>
            <p className="ctaText">
              Be part of Authentix, where luxury meets transparency, and every product is guaranteed authentic 
              through blockchain-backed digital twins.
            </p>
            <Link 
              to="/" 
              className={`ctaButton ${hoveredButton === 'explore' ? 'ctaButtonHover' : ''}`}
              onMouseEnter={() => setHoveredButton('explore')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Explore the Marketplace
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function HowToUse() {
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div className="container">
      <header className="header">
        <div className="headerContainer">
          <Link 
            to="/" 
            className="backLink"
            onMouseEnter={() => setHoveredButton('back')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="backIcon">←</span> Back to Marketplace
          </Link>
        </div>
      </header>

      <main className="howToUseContainer">
        <div className="howToUseHero">
          <h1 className="howToUseTitle">Getting Started with Authentix</h1>
          <p className="howToUseSubtitle">A step-by-step guide to using our NFT marketplace</p>
        </div>

        <div className="stepsContainer">
          <div className="stepCard">
            <div className="stepNumber">1</div>
            <div className="stepContent">
              <h3>Install MetaMask</h3>
              <p>
                First, you'll need a cryptocurrency wallet. We recommend MetaMask, which is available as a browser extension.
              </p>
              <a 
                href="https://metamask.io/download.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`stepLink ${hoveredButton === 'metamask' ? 'stepLinkHover' : ''}`}
                onMouseEnter={() => setHoveredButton('metamask')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Download MetaMask
              </a>
            </div>
          </div>

          <div className="stepCard">
            <div className="stepNumber">2</div>
            <div className="stepContent">
              <h3>Connect to Sepolia Testnet</h3>
              <p>
                Our marketplace currently operates on the Sepolia test network. In MetaMask:
              </p>
              <ul className="stepInstructions">
                <li>Click the network dropdown (usually says "Ethereum Mainnet")</li>
                <li>Select "Show test networks"</li>
                <li>Choose "Sepolia Test Network"</li>
              </ul>
            </div>
          </div>

          <div className="stepCard">
            <div className="stepNumber">3</div>
            <div className="stepContent">
              <h3>Get Test ETH</h3>
              <p>
                You'll need Sepolia ETH to make transactions. Visit a faucet and enter your wallet address to receive test ETH.
              </p>
              <a 
                href="https://www.bing.com/search?pglt=299&q=sepolia+eth+faucet&cvid=4abc976bdddb41a6860e06e971446663&gs_lcrp=EgRlZGdlKgYIABBFGDkyBggAEEUYOTIGCAEQABhAMgYIAhAAGEAyBggDEAAYQDIGCAQQABhAMgYIBRAAGEAyBggGEAAYQDIGCAcQABhAMgYICBAAGEDSAQg0MDc5ajBqMagCALACAA&FORM=ANNTA1&PC=DCTS" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`stepLink ${hoveredButton === 'faucet' ? 'stepLinkHover' : ''}`}
                onMouseEnter={() => setHoveredButton('faucet')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Get Sepolia ETH
              </a>
            </div>
          </div>

          <div className="stepCard">
            <div className="stepNumber">4</div>
            <div className="stepContent">
              <h3>Connect Your Wallet</h3>
              <p>
                Click the "Connect Wallet" button in the top right corner of our marketplace and follow the prompts in MetaMask.
              </p>
            </div>
          </div>

          <div className="stepCard">
            <div className="stepNumber">5</div>
            <div className="stepContent">
              <h3>Browse and Buy NFTs</h3>
              <p>
                Once connected, you can browse available NFTs. Click "Buy Now" on any item to purchase it using your test ETH.
              </p>
            </div>
          </div>

          <div className="stepCard">
            <div className="stepNumber">6</div>
            <div className="stepContent">
              <h3>View Your Collection</h3>
              <p>
                After purchasing, visit the "My Collection" page to see your owned NFTs and request physical delivery if available.
              </p>
              <Link 
                to="/collection" 
                className={`stepLink ${hoveredButton === 'collection' ? 'stepLinkHover' : ''}`}
                onMouseEnter={() => setHoveredButton('collection')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Go to My Collection
              </Link>
            </div>
          </div>
        </div>

        <div className="troubleshooting">
          <h2 className="troubleshootingTitle">Troubleshooting</h2>
          <div className="troubleshootingContent">
            <div className="issueCard">
              <h4>Transactions failing?</h4>
              <p>Make sure you have enough Sepolia ETH and are connected to the Sepolia network.</p>
            </div>
            <div className="issueCard">
              <h4>Images not loading?</h4>
              <p>IPFS can sometimes be slow. Try refreshing the page or waiting a few moments.</p>
            </div>
            <div className="issueCard">
              <h4>Wallet not connecting?</h4>
              <p>Try refreshing the page and ensuring MetaMask is properly installed.</p>
            </div>
          </div>
        </div>

        <div className="ctaSection">
          <Link 
            to="/" 
            className={`ctaButton ${hoveredButton === 'explore' ? 'ctaButtonHover' : ''}`}
            onMouseEnter={() => setHoveredButton('explore')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Start Exploring the Marketplace
          </Link>
        </div>
      </main>
    </div>
  );
}

function Collection() {
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address.toLowerCase());
      return address.toLowerCase();
    } catch (error) {
      console.error("Wallet connection failed:", error);
      return null;
    }
  }, []);

  const loadOwnedNFTs = useCallback(async (address) => {
    if (!address) return;
    
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, provider);
      const count = await contract.listingCount();

      let items = [];
      for (let i = 0; i < count; i++) {
        const listing = await contract.listings(i);
        if (listing.buyer.toLowerCase() === address.toLowerCase() && listing.sold) {
          const imageUrl = listing.imageURL;
          items.push({
            id: i,
            tokenId: listing.tokenId.toString(),
            price: ethers.utils.formatEther(listing.price),
            imageUrl: imageUrl,
            seller: listing.seller.toLowerCase(),
            buyer: listing.buyer.toLowerCase(),
            sold: listing.sold,
            redeemed: listing.redeemed
          });
        }
      }
      setOwnedNFTs(items);
    } catch (error) {
      console.error("Error loading owned NFTs:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const address = await connectWallet();
      if (address) {
        loadOwnedNFTs(address);
      }
    }
    init();
  }, [connectWallet, loadOwnedNFTs]);

  function extractCid(url) {
    if (!url) return "";
    if (url.includes("ipfs/")) {
      const parts = url.split("ipfs/");
      return parts[parts.length - 1];
    } else if (url.startsWith("ipfs://")) {
      return url.replace("ipfs://", "");
    } else if (url.match(/^[a-zA-Z0-9]{46}$/)) {
      return url;
    }
    return url;
  }

  async function redeemNFT(listingId) {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, signer);

      const tx = await contract.redeemNFT(listingId);
      await tx.wait();
      alert("Physical redemption request submitted!");
      const address = await signer.getAddress();
      loadOwnedNFTs(address.toLowerCase());
    } catch (error) {
      console.error("Redemption failed:", error);
      alert("Error redeeming NFT: " + error.message);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="headerContainer">
          <h1 className="headerTitle">My Collection</h1>
          <div className="headerActions">
            <div className="walletAddress">
              {walletAddress ? 
                `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
                "Not Connected"
              }
            </div>
            <Link 
              to="/" 
              className="adminButton"
              onMouseEnter={() => setHoveredButton('marketplace')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{ marginRight: '10px' }}
            >
              Marketplace
            </Link>
            <Link 
              to="/about" 
              className="adminButton"
              onMouseEnter={() => setHoveredButton('about')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{ marginRight: '10px' }}
            >
              About
            </Link>
            <Link 
              to="/how-to-use" 
              className="adminButton"
              onMouseEnter={() => setHoveredButton('how-to-use')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              How to Use
            </Link>
          </div>
        </div>
      </header>

      <main className="mainContent">
        {loading ? (
          <div className="loadingContainer">
            <div className="spinner"></div>
          </div>
        ) : ownedNFTs.length === 0 ? (
          <div className="emptyState">
            <h2 className="emptyStateTitle">No NFTs in your collection.</h2>
            <p className="emptyStateText">Visit the Marketplace to buy some!</p>
            <Link 
              to="/" 
              className="emptyStateButton"
              onMouseEnter={() => setHoveredButton('emptyMarketplace')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Go to Marketplace
            </Link>
          </div>
        ) : (
          <div className="cardGrid">
            {ownedNFTs.map((nft) => {
              const cid = extractCid(nft.imageUrl);
              const isHovered = hoveredCard === nft.id;

              return (
                <div
                  key={nft.id}
                  className={`card ${isHovered ? 'cardHover' : ''}`}
                  onMouseEnter={() => setHoveredCard(nft.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="imageContainer">
                    {cid ? (
                      <img
                        src={`https://ipfs.io/ipfs/${cid}`}
                        alt={`NFT ${nft.tokenId}`}
                        className="image"
                        onError={(e) => {
                          console.error("Image failed to load:", e);
                          e.target.src = nft.imageUrl;
                        }}
                      />
                    ) : (
                      <img 
                        src={nft.imageUrl} 
                        alt={`NFT ${nft.tokenId}`} 
                        className="image" 
                      />
                    )}
                    {nft.redeemed && (
                      <div className="statusBadge">
                        Redeemed
                      </div>
                    )}
                  </div>
                  
                  <div className="cardContent">
                    <div className="cardHeader">
                      <div className="tokenId">Token ID: {nft.tokenId}</div>
                      <div className="price">Purchased for {nft.price} ETH</div>
                    </div>

                    <div className="sellerInfo">
                      <div className="address">
                        Seller: {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
                      </div>
                    </div>

                    {!nft.redeemed && (
                      <button
                        onClick={() => redeemNFT(nft.id)}
                        className={`redeemButton ${hoveredButton === `redeem-${nft.id}` ? 'redeemButtonHover' : ''}`}
                        onMouseEnter={() => setHoveredButton(`redeem-${nft.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                      >
                        Request Physical Delivery
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/how-to-use" element={<HowToUse />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
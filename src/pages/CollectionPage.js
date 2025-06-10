// src/pages/CollectionPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import NFTMarketplaceJson from '../NFTMarketplace.json';
import { CONTRACT_ADDRESS } from '../config';
import ProductGrid from '../components/ProductGrid'; // Reusing ProductGrid
import './CollectionPage.css'; // Create this CSS file

// Make sure App.js passes setWalletAddressInHeader
function CollectionPage({ setWalletAddressInHeader }) {
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState(null);


  const connectWallet = useCallback(async () => {
    try {
      const web3Modal = new Web3Modal({ cacheProvider: true, providerOptions: {} });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const lowerAddr = address.toLowerCase();
      setWalletAddress(lowerAddr);
      if (setWalletAddressInHeader) {
        setWalletAddressInHeader(lowerAddr);
      }
      return lowerAddr;
    } catch (error) {
      console.error("Wallet connection failed:", error);
      // Don't set a generic error here, let UI guide user to connect.
      if (setWalletAddressInHeader) {
        setWalletAddressInHeader(null);
      }
      return null;
    }
  }, [setWalletAddressInHeader]);

  const loadOwnedNFTs = useCallback(async (currentAddress) => {
    if (!currentAddress) {
      setLoading(false);
      // Error is set by connectWallet or useEffect if connection fails.
      // setError("Please connect your wallet to view your collection.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Ensure provider is available
      if (!window.ethereum) {
          setError("Ethereum provider (like MetaMask) not found.");
          setLoading(false);
          return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplaceJson.abi, provider);
      const count = await contract.listingCount();
      let items = [];
      for (let i = 0; i < count.toNumber(); i++) {
        const listing = await contract.listings(i);
        if (listing.buyer.toLowerCase() === currentAddress && listing.sold) {
          items.push({
            id: i,
            listingId: i,
            tokenId: listing.tokenId.toString(),
            price: ethers.utils.formatEther(listing.price),
            imageUrl: listing.imageURL,
            seller: listing.seller.toLowerCase(),
            buyer: listing.buyer.toLowerCase(),
            sold: listing.sold,
            redeemed: listing.redeemed,
            name: `NFT #${listing.tokenId.toString()}`
          });
        }
      }
      setOwnedNFTs(items);
    } catch (err) {
      console.error("Error loading owned NFTs:", err);
      setError("Could not load your NFTs. Ensure you are on the Sepolia network.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const addr = await connectWallet(); // Attempt to connect and get address
      if (addr) {
        loadOwnedNFTs(addr);
      } else {
         // If connectWallet returns null (e.g., user closes modal), set error.
         setError("Please connect your wallet to view your collection.");
         setLoading(false);
      }
    }
    init();

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            const lowerAddr = accounts[0].toLowerCase();
            setWalletAddress(lowerAddr);
            if (setWalletAddressInHeader) setWalletAddressInHeader(lowerAddr);
            loadOwnedNFTs(lowerAddr);
        } else {
            setWalletAddress("");
            if (setWalletAddressInHeader) setWalletAddressInHeader(null);
            setOwnedNFTs([]);
            setError("Wallet disconnected. Please connect to view your collection.");
        }
    };

    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        // Consider adding chainChanged listener here too, similar to HomePage
        return () => {
             if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
             }
        };
    }
  }, [connectWallet, loadOwnedNFTs, setWalletAddressInHeader]);

  function extractCid(url) {
    if (!url) return "";
    if (url.includes("ipfs/")) return url.split("ipfs/").pop();
    if (url.startsWith("ipfs://")) return url.replace("ipfs://", "");
    if (url.match(/^[a-zA-Z0-9]{46}$/)) return url; // Basic CID v0 check
    return url; // Fallback to original URL
  }

  async function redeemNFT(listingId) {
    if (!walletAddress) {
        alert("Please connect your wallet first.");
        // Optionally, try to connect wallet here if not connected
        // const addr = await connectWallet();
        // if (!addr) return;
        return;
    }
    setLoading(true); // Indicate process start
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplaceJson.abi, signer);

      const tx = await contract.redeemNFT(listingId);
      await tx.wait();
      alert("Physical redemption request submitted!");
      loadOwnedNFTs(walletAddress);
    } catch (error) {
      console.error("Redemption failed:", error);
      alert("Error redeeming NFT: " + (error.data ? error.data.message : error.message));
    }
    setLoading(false); // Reset loading state
  }

  const pageTitle = walletAddress ? "My Collection" : "Connect Wallet";

  return (
    <div className="collection-page-container">
      <div className="collection-header">
        <h1>{pageTitle}</h1>
        <div className="collection-nav-links">
            <Link to="/" className="nav-button button-base button-light">Marketplace</Link> {/* Styled as a button */}
        </div>
      </div>

      {error && <p className="error-message error-message-global">{error}</p>} {/* Added global message class */}

      {loading ? (
        <div className="loading-message">Loading your collection...</div>
      ) : !walletAddress ? (
         <div className="info-message info-message-global"> {/* Added global message class */}
            <h2>Wallet Not Connected</h2>
            <p>Please connect your wallet to view your NFTs.</p>
            {/* <button onClick={connectWallet} className="action-button button-base button-primary">Connect Wallet</button> */}
         </div>
      ) : ownedNFTs.length === 0 && !error ? (
        <div className="info-message info-message-global"> {/* Added global message class */}
          <h2>No NFTs in Your Collection Yet.</h2>
          <p>Once you purchase an NFT from the marketplace, it will appear here.</p>
          <Link to="/" className="action-button explore-button button-base button-primary">Explore Marketplace</Link> {/* Styled as a button */}
        </div>
      ) : (
        <ProductGrid
          nfts={ownedNFTs}
          walletAddress={walletAddress}
          onRedeemNFT={redeemNFT}
          extractCidFn={extractCid}
          isCollectionPage={true}
        />
      )}
    </div>
  );
}

export default CollectionPage;

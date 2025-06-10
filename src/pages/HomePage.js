// src/pages/HomePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import ProductGrid from '../components/ProductGrid';
import NFTMarketplaceJson from '../NFTMarketplace.json'; // ABI
import { CONTRACT_ADDRESS } from '../config'; // Contract address

// Make sure App.js passes setWalletAddressInHeader or a similar prop
function HomePage({ setWalletAddressInHeader }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  // walletAddress state will be local to HomePage for its direct needs,
  // but we also call setWalletAddressInHeader to update App.js state for the Header.
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions: {} // required
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const lowerAddr = address.toLowerCase();
      setWalletAddress(lowerAddr);
      if (setWalletAddressInHeader) {
        setWalletAddressInHeader(lowerAddr); // Update App.js state for Header
      }
      return lowerAddr;
    } catch (error) {
      console.error("Wallet connection failed:", error);
      if (setWalletAddressInHeader) {
        setWalletAddressInHeader(null); // Clear in header on failure
      }
      // Do not set generic error here, allow UI to show "Connect Wallet"
      return null;
    }
  }, [setWalletAddressInHeader]);

  const loadNFTs = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      let provider;
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        // Attempting to use a public, read-only provider if no wallet is present.
        // Replace 'YOUR_INFURA_PROJECT_ID' with your actual Infura Project ID for Sepolia.
        // Note: This is a fallback for read-only purposes. Transactions will still require a wallet.
        console.warn("No Ethereum wallet provider found. Using public RPC for read-only mode.");
        provider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID`);
        // If you don't have an Infura ID or prefer another public RPC, configure accordingly.
        // If no public RPC is configured, read-only mode might fail if window.ethereum is also absent.
        // For this exercise, if the above public RPC is not set up, it will likely fail here.
        // A better approach would be to ensure a valid public RPC URL or handle this case gracefully.
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplaceJson.abi, provider);
      const count = await contract.listingCount();
      let items = [];
      for (let i = 0; i < count.toNumber(); i++) { // Ensure count is a number
        const listing = await contract.listings(i);
        items.push({
          id: i, // Using index as id
          listingId: i, // Explicitly for contract calls
          tokenId: listing.tokenId.toString(),
          price: ethers.utils.formatEther(listing.price),
          imageUrl: listing.imageURL,
          seller: listing.seller.toLowerCase(),
          buyer: listing.buyer.toLowerCase(),
          sold: listing.sold,
          redeemed: listing.redeemed,
          name: `NFT #${listing.tokenId.toString()}` // Placeholder name, ideally from metadata
        });
      }
      setListings(items);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setError("Could not load NFTs. Ensure you are on the Sepolia network and check console for details.");
    }
    setLoading(false);
  }, []);


  useEffect(() => {
    async function init() {
      // Try to connect wallet silently if user has connected before (cached provider)
      // or prompt if no cached provider.
      // loadNFTs will be called regardless of wallet connection for public view.
      const web3Modal = new Web3Modal({ cacheProvider: true, providerOptions: {} });
      if (web3Modal.cachedProvider) {
        await connectWallet();
      }
      loadNFTs();
    }
    init();

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            const lowerAddr = accounts[0].toLowerCase();
            setWalletAddress(lowerAddr);
            if (setWalletAddressInHeader) setWalletAddressInHeader(lowerAddr);
            // loadNFTs(); // Optionally reload NFTs or update UI based on account
        } else {
            setWalletAddress("");
            if (setWalletAddressInHeader) setWalletAddressInHeader(null);
        }
    };

    const handleChainChanged = (chainId) => {
        console.log('Network changed to:', chainId);
        // It's good practice to reload NFTs or even the app,
        // as the contract might be on a different network or state might be invalid.
        loadNFTs();
    };

    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
        if (window.ethereum && window.ethereum.removeListener) {
             window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
             window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
    };
  }, [connectWallet, loadNFTs, setWalletAddressInHeader]);

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
    // console.warn("URL does not seem to be a standard IPFS gateway URL or CID:", url);
    return url;
  }

  async function buyNFT(listingId, price) {
    if (!walletAddress) {
        alert("Please connect your wallet to purchase NFTs.");
        await connectWallet(); // Attempt to connect wallet
        if(!await ethers.getDefaultProvider().getSigner().getAddress()) return; // check again
    }
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplaceJson.abi, signer);

      const tx = await contract.buyNFT(listingId, { value: ethers.utils.parseEther(price) });
      setLoading(true); // Show loading state for transaction
      await tx.wait();
      alert("NFT Purchased!");
      loadNFTs(); // Refresh listings
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Error purchasing NFT: " + (error.data ? error.data.message : error.message));
      setLoading(false);
    }
  }

  async function redeemNFT(listingId) {
     if (!walletAddress) {
        alert("Please connect your wallet to redeem NFTs.");
        await connectWallet();
        if(!await ethers.getDefaultProvider().getSigner().getAddress()) return;
    }
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplaceJson.abi, signer);

      setLoading(true); // Show loading state for transaction
      const tx = await contract.redeemNFT(listingId);
      await tx.wait();
      alert("Physical redemption request submitted!");
      loadNFTs(); // Refresh listings
    } catch (error) {
      console.error("Redemption failed:", error);
      alert("Error redeeming NFT: " + (error.data ? error.data.message : error.message));
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Discover NFTs</h1>
      {error && <p className="error-message" style={{textAlign: 'center', color: 'red', padding: '10px'}}>{error}</p>}
      {loading && listings.length === 0 ? ( // Show loading only if there are no listings yet
        <div style={{textAlign: 'center', padding: '50px', fontSize: '1.2em'}}>Loading NFTs...</div>
      ) : (
        <ProductGrid
          nfts={listings}
          walletAddress={walletAddress}
          onBuyNFT={buyNFT}
          onRedeemNFT={redeemNFT}
          extractCidFn={extractCid}
        />
      )}
    </div>
  );
}

export default HomePage;

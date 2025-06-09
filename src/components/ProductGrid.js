import React, { useEffect, useState } from 'react';
import './ProductGrid.css';
import NFTMarketplace from '../NFTMarketplace.json'; // Path confirmed

function ProductGrid() {
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (Array.isArray(NFTMarketplace)) {
        setNfts(NFTMarketplace);
      } else if (NFTMarketplace && typeof NFTMarketplace === 'object' && NFTMarketplace.nfts && Array.isArray(NFTMarketplace.nfts)) {
        setNfts(NFTMarketplace.nfts);
      } else if (NFTMarketplace && typeof NFTMarketplace === 'object' && !Array.isArray(NFTMarketplace)) {
         // If it's an object but not an array and no 'nfts' key, try to convert its values.
        console.warn("NFTMarketplace.json is an object; attempting to display its values as NFTs.");
        setNfts(Object.values(NFTMarketplace));
      }
      else {
        console.error("NFTMarketplace.json is not in a recognized format (array or object with 'nfts' array).");
        setError("NFT data is not in a recognized format.");
        setNfts([]);
      }
    } catch (e) {
      console.error("Error loading or parsing NFTMarketplace.json:", e);
      setError("Failed to load NFT data. Please check the console.");
      setNfts([]);
    }
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!nfts || nfts.length === 0) {
    return <p className="info-message">No NFTs found or data is empty.</p>;
  }

  return (
    <div className="product-grid">
      {nfts.map((nft, index) => (
        <div key={nft.id || nft.name || index} className="product-card">
          {/* Image placeholder/display */}
          {nft.image ? (
            <img src={nft.image} alt={nft.name || 'NFT Image'} className="product-image" onError={(e) => e.target.style.display='none'} />
          ) : (
            <div className="product-image-placeholder">No Image</div>
          )}
          <div className="product-info">
            <h5 className="product-name">{nft.name || 'Unnamed NFT'}</h5>
            <p className="product-price">{nft.price ? `${nft.price}` : 'Price not available'}</p>
            {/* Optional: Display description if available */}
            {nft.description && <p className="product-description">{nft.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;

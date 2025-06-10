// src/components/ProductGrid.js
import React from 'react';
import './ProductGrid.css';

// Props received from HomePage: nfts, walletAddress, onBuyNFT, onRedeemNFT, extractCidFn
function ProductGrid({ nfts, walletAddress, onBuyNFT, onRedeemNFT, extractCidFn }) {

  if (!nfts || nfts.length === 0) {
    return <p className="info-message">No NFTs currently available in the marketplace.</p>;
  }

  return (
    <div className="product-grid">
      {nfts.map((nft) => {
        // Use a more robust check for image URL and prefer nft.imageUrl if it's already a gateway link
        let displayImageUrl = nft.imageUrl; // Default to contract URL
        if (nft.imageUrl && nft.imageUrl.startsWith('ipfs://')) {
            const cid = extractCidFn(nft.imageUrl);
            displayImageUrl = `https://ipfs.io/ipfs/${cid}`;
        }
        // If nft.imageUrl is already a http(s) gateway link, extractCidFn might return it as is or a CID.
        // This part ensures that if extractCidFn returns a CID, it's converted to a gateway URL.
        else if (nft.imageUrl) {
            const potentialCid = extractCidFn(nft.imageUrl);
            if (potentialCid && !potentialCid.startsWith('http')) {
                 displayImageUrl = `https://ipfs.io/ipfs/${potentialCid}`;
            }
        }


        const isOwner = nft.sold && nft.buyer === walletAddress;

        return (
          <div key={nft.id + '-' + nft.tokenId} className={`product-card ${nft.sold ? 'sold' : ''}`}>
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt={nft.name || `NFT ${nft.tokenId}`}
                className="product-image"
                // It's often better to have a placeholder component show up on error
                // rather than just hiding the img tag, but for simplicity:
                onError={(e) => { e.target.style.display = 'none';
                                  const placeholder = e.target.nextSibling;
                                  if(placeholder && placeholder.classList.contains('product-image-placeholder-fallback')) {
                                    placeholder.style.display='flex';
                                  }
                                }}
              />
            ) : null}
            {/* Fallback placeholder, initially hidden if image tries to load */}
            <div
                className="product-image-placeholder-fallback"
                style={{display: displayImageUrl ? 'none' : 'flex'}}
            >
                No Image
            </div>
            <div className="product-info">
              <h5 className="product-name" title={nft.name || `Token ID: ${nft.tokenId}`}>{nft.name || `Token ID: ${nft.tokenId}`}</h5>
              <p className="product-price">{nft.price} ETH</p>
              {nft.seller && <p className="product-seller" title={nft.seller}>Seller: {nft.seller.slice(0,6)}...{nft.seller.slice(-4)}</p>}
              {nft.sold && nft.buyer !== "0x0000000000000000000000000000000000000000" && (
                <p className="product-buyer" title={nft.buyer}>Buyer: {nft.buyer.slice(0,6)}...{nft.buyer.slice(-4)}</p>
              )}

              <div className="product-actions">
                {!nft.sold ? (
                  <button
                    onClick={() => onBuyNFT(nft.listingId, nft.price)}
                    className="action-button buy-button"
                    disabled={!walletAddress || walletAddress === nft.seller} // Disable if wallet not connected or if user is the seller
                  >
                    Buy Now
                  </button>
                ) : isOwner && !nft.redeemed ? (
                  <button
                    onClick={() => onRedeemNFT(nft.listingId)}
                    className="action-button redeem-button"
                  >
                    Request Delivery
                  </button>
                ) : (
                  <p className="status-text">{nft.redeemed ? "Redeemed" : "Sold"}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductGrid;

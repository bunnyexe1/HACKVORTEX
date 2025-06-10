// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import NFTMarketplaceJson from '../NFTMarketplace.json';
import { CONTRACT_ADDRESS, PINATA_API_KEY, PINATA_SECRET_KEY } from '../config';
import './AdminPage.css'; // Create this CSS file

function AdminPage() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewCid, setPreviewCid] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  // hoveredButton state can be simplified or removed if complex hover styles are not a priority for this step
  // For simplicity, direct CSS hover effects will be preferred for now.

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
    if (!file) {
      alert("Please select a file first.");
      return null;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity", // Required for large files
        headers: {
          // It's better to let axios set the Content-Type header for FormData
          // 'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      });
      setPreviewCid(res.data.IpfsHash);
      setUploading(false);
      return res.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error.response ? error.response.data : error.message);
      alert(`Error uploading file: ${error.response ? (error.response.data.error || JSON.stringify(error.response.data)) : error.message}`);
      setUploading(false);
      return null;
    }
  }

  async function listNFT() {
    if (!name || !price || !file) {
      alert("Please fill all fields and select a file.");
      return;
    }

    setUploading(true);
    let imageCid = previewCid;
    if (!imageCid && file) { // If not previewed (or preview failed), but file exists, upload now
        imageCid = await uploadToPinata();
    }

    if (!imageCid) {
      alert("Image upload to IPFS failed. Cannot list NFT.");
      setUploading(false);
      return;
    }

    const imageUrl = `ipfs://${imageCid}`;

    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplaceJson.abi, signer);

      const priceInWei = ethers.utils.parseEther(price);
      const tx = await contract.createAndListNFT(priceInWei, imageUrl);
      await tx.wait();

      alert("NFT Listed Successfully!");
      // Reset form
      setName("");
      setPrice("");
      setFile(null);
      setFilePreview(null);
      setPreviewCid("");
    } catch (error) {
      console.error("Error listing NFT:", error);
      alert("Error listing NFT: " + (error.data ? error.data.message : error.message));
    }
    setUploading(false);
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreviewCid(""); // Reset CID preview if new file is chosen
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <Link to="/" className="back-link">
          &larr; Back to Marketplace
        </Link>
        <h1>List New NFT</h1>
      </div>

      <div className="form-and-preview-container">
        <div className="form-container-admin">
          <div className="form-group">
            <label htmlFor="nft-name">NFT Name</label>
            <input
              id="nft-name" type="text" placeholder="Enter NFT name"
              value={name} onChange={(e) => setName(e.target.value)}
              className="input-base"
            />
          </div>
          <div className="form-group">
            <label htmlFor="nft-price">Price (ETH)</label>
            <input
              id="nft-price" type="text" placeholder="0.05"
              value={price} onChange={(e) => setPrice(e.target.value)}
              className="input-base"
            />
          </div>
          <div className="form-group">
            <label htmlFor="file-input-admin" className="file-label">
              NFT Image
              <div className="file-upload-area" onClick={() => document.getElementById('file-input-admin').click()}>
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="file-preview-image" />
                ) : (
                  <p>Drag & drop or click to browse</p>
                )}
                <input
                  id="file-input-admin" type="file" accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </label>
             {file && <p className="file-name-display">Selected: {file.name}</p>}
          </div>
          <button
            onClick={listNFT}
            disabled={uploading || !name || !price || !file}
            className="list-button button-base button-primary"
          >
            {uploading ? (file && !previewCid ? "Uploading to IPFS..." : "Processing Transaction...") : "List NFT"}
          </button>
        </div>

        {/* Preview uploaded image from IPFS */}
        {previewCid && file && ( // Show only if CID is generated AND a file was selected (implies upload was attempted for current file)
          <div className="ipfs-preview-container">
            <h3>IPFS Upload Successful</h3>
            <img
              src={`https://ipfs.io/ipfs/${previewCid}`}
              alt="IPFS Preview"
              className="ipfs-preview-image"
            />
            <p className="cid-text">IPFS CID: {previewCid}</p>
            <p style={{fontSize: '0.8em', color: '#555'}}>(This image is now pinned on IPFS. You can proceed to list.)</p>
          </div>
        )}
        {/* Button to trigger Pinata upload separately if needed for UX */}
        {file && !previewCid && !uploading && (
             <div className="form-container-admin" style={{marginTop: '20px', textAlign: 'center'}}>
                <p style={{fontSize: '0.9em', color: '#555'}}>Preview your image on IPFS before listing (optional):</p>
                <button
                  onClick={uploadToPinata}
                  disabled={uploading}
                  className="upload-preview-button button-base" // Removed inline style, uses CSS class now
                >
                    {uploading ? "Uploading..." : "Upload & Preview on IPFS"}
                </button>
            </div>
        )}

      </div>
    </div>
  );
}

export default AdminPage;

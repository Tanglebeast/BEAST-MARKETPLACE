import React, { useState } from 'react';
import '../styles/ProfilePicturePopup.css'; // Verwenden Sie dasselbe Styling wie das ursprüngliche Popup

const ProfilePicturePopup = ({ nfts, handleSave, closePopup }) => {
  const [selectedNFT, setSelectedNFT] = useState(null);

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
  };

  const handleSaveClick = () => {
    if (selectedNFT) {
      handleSave(selectedNFT.contractAddress, selectedNFT.tokenId, selectedNFT.image);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content-image">
        <button className="close-button" onClick={closePopup}>
          &times;
        </button>
        {nfts.length === 0 ? (
          <>
            <h2>You don't own any NFTs</h2>
            {/* Keine NFTs vorhanden, also keinen Save-Button anzeigen */}
          </>
        ) : (
          <>
            <h2>Select your NFT</h2>
            <div className="nft-selection-popup">
              {nfts.map(nft => (
                <div
                  key={nft.tokenId}
                  className={`NFT-item ${selectedNFT && selectedNFT.tokenId === nft.tokenId ? 'selected' : ''}`}
                  onClick={() => handleNFTSelect(nft)}
                >
                  <div className='NFT-item-image'>
                    <img src={nft.image} alt={nft.name} />
                  </div>
                </div>
              ))}
            </div>
            <button className="actionbutton w10" onClick={handleSaveClick} disabled={!selectedNFT}>
              SAVE
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePicturePopup;

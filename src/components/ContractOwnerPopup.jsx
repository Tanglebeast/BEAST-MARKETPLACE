import React, { useState } from 'react';
import '../styles/ListingPopup.css';
import SetArtistWalletPopup from './SetartistWalletPopup';

const ContractOwnerPopup = ({ closePopup }) => {
  const [showSetArtistWalletPopup, setShowSetArtistWalletPopup] = useState(false);

  const handleOpenSetArtistWalletPopup = () => {
    setShowSetArtistWalletPopup(true);
  };

  const handleCloseSetArtistWalletPopup = () => {
    setShowSetArtistWalletPopup(false);
  };

  const handleSaveArtistWallet = (contractAddress, artistWallet) => {
    // Handle the save logic here
    console.log('Saved contract address:', contractAddress);
    console.log('Saved artist wallet:', artistWallet);
    handleCloseSetArtistWalletPopup();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={closePopup}>
          &times;
        </button>
        <h2>Contract Admin</h2>
        <div className="button-container">
          <button className="pausable-button">
            <h3 className='margin-0 s16'>Pausable</h3>
          </button>
          <button className="artistwallet-button" onClick={handleOpenSetArtistWalletPopup}>
            <h3 className='margin-0 s16'>Artistwallet</h3>
          </button>
        </div>
      </div>
      {showSetArtistWalletPopup && (
        <SetArtistWalletPopup
          handleSave={handleSaveArtistWallet}
          closePopup={handleCloseSetArtistWalletPopup}
        />
      )}
    </div>
  );
};

export default ContractOwnerPopup;

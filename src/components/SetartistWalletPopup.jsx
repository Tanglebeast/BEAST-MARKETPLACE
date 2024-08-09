import React, { useState } from 'react';
import '../styles/ListingPopup.css';
import ArtistWalletDefinitionPopup from './ArtistWalletdefinitionPopup';

const SetArtistWalletPopup = ({ handleSave, closePopup }) => {
  const [contractAddress, setContractAddress] = useState('');
  const [artistWallet, setArtistWallet] = useState('');
  const [artistFeePercent, setArtistFeePercent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isArtistWalletPopupOpen, setIsArtistWalletPopupOpen] = useState(false);

  const onSave = async () => {
    setLoading(true);
    try {
      await handleSave(contractAddress, artistWallet, artistFeePercent);
      closePopup();
    } catch (error) {
      console.error('Failed to set artist wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const openArtistWalletPopup = () => {
    setIsArtistWalletPopupOpen(true);
  };

  const closeArtistWalletPopup = () => {
    setIsArtistWalletPopupOpen(false);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={() => !loading && closePopup()}>
          &times;
        </button>
        <h2>Set Artist Wallet</h2>
        <input
          className="listinginput-list"
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="Contract Address"
        />
        <input
          className="listinginput-list mt5"
          type="text"
          value={artistWallet}
          onChange={(e) => setArtistWallet(e.target.value)}
          placeholder="Artist Wallet"
        />
        <input
          className="listinginput-list mt5"
          type="number"
          value={artistFeePercent}
          onChange={(e) => setArtistFeePercent(e.target.value)}
          placeholder="Artist Fee in %"
        />
        <button className="sell-button" onClick={onSave} disabled={loading}>
          <h3 className='margin-0 s16'>{loading ? 'Processing...' : 'SET WALLET'}</h3>
        </button>
        <button className="artistwallet-button" onClick={openArtistWalletPopup}>
          <h3 className='margin-0 s16'>ARTISTLIST</h3>
        </button>
        {isArtistWalletPopupOpen && (
          <ArtistWalletDefinitionPopup closePopup={closeArtistWalletPopup} />
        )}
      </div>
    </div>
  );
};

export default SetArtistWalletPopup;

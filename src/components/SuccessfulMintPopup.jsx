import React from 'react';
import '../styles/SuccessfulMintPopup.css'; // CSS für das Popup-Design

const SuccessPopup = ({ message, tokenDetails, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content-mint">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>{message}</h2>
        {tokenDetails.length > 0 && (
          <div className='token-details'>
            <h3>Your minted NFTs</h3>
            <div className='nft-items-mint'>
              {tokenDetails.map(({ tokenId, title, description, image, attributes }) => (
                <div key={tokenId.toString()} className='nft-item-mint'>
                  <img src={image} alt={title} className='nft-image' />
                  <div className='nft-info'>
                    <h4>{title}</h4>
                    {attributes && attributes.length > 0 && (
                      <ul className='nft-attributes'>
                        {attributes.map((attr, index) => (
                          <li key={index}>{attr.trait_type}: {attr.value}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button className="action-button w10" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;

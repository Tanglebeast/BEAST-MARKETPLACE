import React from 'react';
import '../styles/ListingPopup.css';

const Popup = ({ listingPrice, setListingPrice, handleList, closePopup }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={closePopup}>
          &times;
        </button>
        <h2>LIST NFT</h2>
        <input
          className="listinginput-list"
          type="text"
          value={listingPrice}
          onChange={(e) => setListingPrice(e.target.value)}
          placeholder="Enter listing price"
        />
        <button className="sell-button" onClick={handleList}>
          <h3 className='margin-0 s16'>LIST</h3>
        </button>
        <h5 className='grey'>
          *6% Total Fee ︱ 3% Artist Fee + 3% Service Fee
        </h5>
      </div>
    </div>
  );
};

export default Popup;

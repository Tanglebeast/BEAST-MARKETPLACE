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
          className="listinginput"
          type="text"
          value={listingPrice}
          onChange={(e) => setListingPrice(e.target.value)}
          placeholder="Enter listing price"
        />
        <button className="actionbutton" onClick={handleList}>
          SELL
        </button>
        <h5>
          <div className='Fee-details'>
          3% Artist Fee<br></br> 3% Service Fee
          </div>
        <span className='TotalFees'>6% Total Fee</span>
        </h5>
      </div>
    </div>
  );
};

export default Popup;

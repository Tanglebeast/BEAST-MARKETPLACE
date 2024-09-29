import React, { useEffect, useState } from 'react';
import BeastToIotaPrice from '../components/BeastToIotaPrice'; // Import the price conversion component
import '../styles/ListingPopup.css';

const Popup = ({ listingPrice, setListingPrice, handleList, closePopup, currency }) => {
  const [paymentToken, setPaymentToken] = useState("0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15");
  const [fees, setFees] = useState('');
  const [convertedPrice, setConvertedPrice] = useState(null); // State for converted price in IOTA

  useEffect(() => {
    if (paymentToken === "0x0000000000000000000000000000000000000000") { // IOTA
      setFees('4% Total Fee ︱ 2% Artist Fee + 2% Service Fee');
    } else if (paymentToken === "0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15") { // Beast
      setFees('0% Total Fee');
    } else {
      setFees('*6% Total Fee ︱ 3% Artist Fee + 3% Service Fee'); // Standardwert
    }
  }, [paymentToken]);

  const getPaymentTokenLabel = () => {
    if (paymentToken === "0x0000000000000000000000000000000000000000") {
      return 'IOTA';
    } else if (paymentToken === "0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15") {
      return 'BEAST';
    }
    return 'UNKNOWN TOKEN';
  };

  const handleBeastConversion = (iotaPrice) => {
    setConvertedPrice(iotaPrice); // Set the converted price in IOTA
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={closePopup}>
          &times;
        </button>
        <h2>LIST NFT</h2>
        <div className='centered w90'>
          <div className="input-container w100">
            <input
              className="listinginput-list"
              type="text"
              value={listingPrice}
              onChange={(e) => setListingPrice(e.target.value)}
              placeholder="Enter listing price"
            />
            {currency && (
              <img src={currency} alt="Currency Icon" className="currency-icon-popup" />
            )}
          </div>
          
          <div className="input-container w50">
            <div className="custom-dropdown">
              <div className="dropdown-selected" onClick={() => document.querySelector('.dropdown-options').classList.toggle('show')}>
                {paymentToken === "0x0000000000000000000000000000000000000000" ? (
                  <span className='centered'><img src="/currency-iota.png" alt="IOTA Icon" className="token-icon w25" /> IOTA</span>
                ) : (
                  <span className='centered'><img src="/currency-beast.webp" alt="BEAST Icon" className="token-icon w25" /> BEAST</span>
                )}
              </div>
              <div className="dropdown-options">
                <div 
                  className="dropdown-option center-ho"
                  onClick={() => { setPaymentToken("0x0000000000000000000000000000000000000000"); document.querySelector('.dropdown-options').classList.remove('show'); }}
                >
                  <img src="/currency-iota.png" alt="IOTA Icon" className="token-icon w25" /> IOTA
                </div>
                <div 
                  className="dropdown-option center-ho"
                  onClick={() => { setPaymentToken("0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15"); document.querySelector('.dropdown-options').classList.remove('show'); }}
                >
                  <img src="/currency-beast.webp" alt="BEAST Icon" className="token-icon w25" /> BEAST
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="sell-button w40media" onClick={() => handleList(paymentToken)}>
          <h3 className='margin-0 s16'>
            LIST FOR {listingPrice || '...'} {getPaymentTokenLabel()}
            {paymentToken === "0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15" && convertedPrice && (
              ` (${convertedPrice} IOTA)` // Show the converted price in IOTA
            )}
          </h3>
        </button>
        <h5 className='grey'>
          {fees}
        </h5>

        {paymentToken === "0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15" && (
          <BeastToIotaPrice listingPrice={listingPrice} onConversion={handleBeastConversion} />
        )}
      </div>
    </div>
  );
};

export default Popup;

import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/NetworkSelectionPopup.css';

const NetworkSelectionPopup = ({ onClose, onSelectNetwork }) => {
  // Funktion zum Auswählen des Netzwerks und Neuladen der Seite nach einer Verzögerung
  const handleNetworkSelect = (network) => {
    onSelectNetwork(network);
    
  };

  return ReactDOM.createPortal(
    <div className="popup-overlayconnect">
      <div className="popup-contentconnect">
        <h2>Select Network</h2>
        <button onClick={() => handleNetworkSelect('shimmerTestnet')}>SHIMMER TESTNET</button>
        <button onClick={() => handleNetworkSelect('iotaTestnet')}>IOTA TESTNET</button>
        <button onClick={onClose}>CANCEL</button>
      </div>
    </div>,
    document.body
  );
};

export default NetworkSelectionPopup;

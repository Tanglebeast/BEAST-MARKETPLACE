// RedeemPopup.js
import React from 'react';
import '../styles/RedeemPopup.css'; // Erstelle ein passendes CSS-Stylesheet für dein Popup
import RedeemFunction from './RedeemFunction'; // Importiere die RedeemFunction-Komponente

const RedeemPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="redeem-popup-overlay">
      <div className="redeem-popup-content">
        <button className="close-button" onClick={onClose}>X</button>
        {/* Render die RedeemFunction-Komponente hier */}
        <RedeemFunction />
      </div>
    </div>
  );
};

export default RedeemPopup;

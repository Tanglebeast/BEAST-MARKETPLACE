// src/components/CustomPopup.js
import React from 'react';
import '../styles/AlertPopup.css'; // CSS für das Popup-Design

const CustomPopup = ({ message, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>INFO</h2>
        <img className ="info-icon" src="/info.gif"></img>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default CustomPopup;

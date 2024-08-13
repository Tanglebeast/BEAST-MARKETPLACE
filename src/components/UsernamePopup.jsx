import React from 'react';
import '../styles/ListingPopup.css'; // Verwenden Sie dasselbe Styling wie das ursprüngliche Popup

const UsernamePopup = ({ username, setUsername, handleSave, closePopup }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={closePopup}>
          &times;
        </button>
        <h2>Change Username</h2>
        <input
          className="listinginput-name"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter new username"
        />
        <button className="actionbutton w20 w40media" onClick={handleSave}>
          SAVE
        </button>
      </div>
    </div>
  );
};

export default UsernamePopup;

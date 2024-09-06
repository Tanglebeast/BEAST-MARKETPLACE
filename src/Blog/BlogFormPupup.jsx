import React from 'react';
import '../styles/BlogFormPopupContainer.css';

const PopupContainer = ({ children, onClose }) => {
  return (
    <div className="BlogFormpopup-overlay" onClick={onClose}>
      <div className="BlogFormpopup-content" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="close-button" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default PopupContainer;

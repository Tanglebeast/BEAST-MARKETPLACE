import React, { useState } from 'react';
import NFTCollectionForm from './UploadNFTCollectionForm';
import '../styles/SubmitCollectionPopup.css'; // Füge hier deine Styles hinzu

const SubmitCollectionPopup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="Collectionsubmitpopup-overlay">
            <div className="Collectionsubmitpopup-content">
                <button className="close-button" onClick={onClose}>X</button>
                <NFTCollectionForm />
            </div>
        </div>
    );
};

export default SubmitCollectionPopup;

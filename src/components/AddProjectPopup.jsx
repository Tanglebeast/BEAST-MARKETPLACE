// src/components/AddProjectPopup.jsx
import React, { useState } from 'react';
// import '../styles/AddProjectPopup.css';

const AddProjectPopup = ({ isOpen, onClose, handleSave }) => {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = async () => {
    if (projectName.trim() === '') {
      alert('Projektname darf nicht leer sein.');
      return;
    }
    await handleSave(projectName.trim());
    setProjectName('');
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Projekt hinzufügen</h2>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Projektname eingeben"
        />
        <div className="popup-buttons">
          <button onClick={handleSubmit} className="button save-button">Speichern</button>
          <button onClick={() => {
            setProjectName('');
            onClose();
          }} className="button cancel-button">Abbrechen</button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectPopup;

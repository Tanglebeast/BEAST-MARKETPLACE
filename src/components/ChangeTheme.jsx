import React, { useState, useEffect } from 'react';
import '../index.css';
import '../styles/BrandingColorDiv.css';

const ChangeTheme = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState(getSavedColor().color);
  const [hoverColor, setHoverColor] = useState(getSavedColor().hoverColor);

  // Funktion zum Laden der Farbe aus dem localStorage
  function getSavedColor() {
    const savedColor = localStorage.getItem('branding-color');
    const savedHoverColor = localStorage.getItem('branding-color-hover');
    return {
      color: savedColor || '#535bf2', // Standardfarbe, wenn keine gespeichert
      hoverColor: savedHoverColor || '#535bf2bf' // Standard Hover-Farbe
    };
  }

  // Funktion zum Ändern der Farben
  const handleColorChange = (newColor, newHoverColor) => {
    setColor(newColor);
    setHoverColor(newHoverColor);
    localStorage.setItem('branding-color', newColor);
    localStorage.setItem('branding-color-hover', newHoverColor);
  };

  // Update der CSS-Variablen bei Farbänderung
  useEffect(() => {
    document.documentElement.style.setProperty('--branding-color', color);
    document.documentElement.style.setProperty('--branding-color-hover', hoverColor);
  }, [color, hoverColor]);

  return (
    <div className='brandingColorContainer'>
      <div className={`brandingColorDiv ${isOpen ? 'open' : ''}`}>

        <div>
        <div className="colorOptions">
          <div
            className={`colorOption ${color === '#535bf2' ? 'selected' : ''}`}
            style={{ backgroundColor: '#535bf2' }}
            onClick={() => handleColorChange('#535bf2', '#535bf2bf')}
          />
          <div
            className={`colorOption ${color === '#f39c12' ? 'selected' : ''}`}
            style={{ backgroundColor: '#f39c12' }}
            onClick={() => handleColorChange('#f39c12', '#f39c12bf')}
          />
          <div
            className={`colorOption ${color === '#2ecc71' ? 'selected' : ''}`}
            style={{ backgroundColor: '#2ecc71' }}
            onClick={() => handleColorChange('#2ecc71', '#2ecc71bf')}
          />
          <div
            className={`colorOption ${color === '#f1c40f' ? 'selected' : ''}`}
            style={{ backgroundColor: '#f1c40f' }}
            onClick={() => handleColorChange('#f1c40f', '#f1c40fbf')}
          />
        </div>
        </div>
        <button className="toggleButton" onClick={() => setIsOpen(!isOpen)}>
        <img src="/setting.png" alt="Color Picker Icon" />
        </button>
      </div>
    </div>
  );
};

export default ChangeTheme;

import React, { useState, useEffect } from 'react';
import '../index.css';
import '../styles/BrandingColorDiv.css';

const ChangeTheme = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState(getSavedColor().color);
  const [hoverColor, setHoverColor] = useState(getSavedColor().hoverColor);
  const [backgroundColor, setBackgroundColor] = useState(getSavedColor().backgroundColor);

  // Funktion zum Laden der Farben aus dem localStorage
  function getSavedColor() {
    const savedColor = localStorage.getItem('branding-color');
    const savedHoverColor = localStorage.getItem('branding-color-hover');
    const savedBackgroundColor = localStorage.getItem('branding-background-color');
    return {
      color: savedColor || '#535bf2', // Standardfarbe, wenn keine gespeichert
      hoverColor: savedHoverColor || '#535bf2bf', // Standard Hover-Farbe
      backgroundColor: savedBackgroundColor || '#0C1215' // Standard-Hintergrundfarbe
    };
  }

  // Funktion zum Ändern der Farben
  const handleColorChange = (newColor, newHoverColor, newBackgroundColor) => {
    setColor(newColor);
    setHoverColor(newHoverColor);
    setBackgroundColor(newBackgroundColor);
    localStorage.setItem('branding-color', newColor);
    localStorage.setItem('branding-color-hover', newHoverColor);
    localStorage.setItem('branding-background-color', newBackgroundColor);
  };

  // Update der CSS-Variablen und des body-Backgrounds bei Farbänderung
  useEffect(() => {
    document.documentElement.style.setProperty('--branding-color', color);
    document.documentElement.style.setProperty('--branding-color-hover', hoverColor);
    document.body.style.backgroundColor = backgroundColor;
  }, [color, hoverColor, backgroundColor]);

  return (
    <div className='brandingColorContainer'>
      <div className={`brandingColorDiv ${isOpen ? 'open' : ''}`}>
        <div>
          <div className="colorOptions">
            <div
              className={`colorOption ${color === '#535bf2' ? 'selected' : ''}`}
              style={{ backgroundColor: '#535bf2' }}
              onClick={() => handleColorChange('#535bf2', '#535bf2bf', '#0C1215')}
            />
            <div
              className={`colorOption ${color === '#404375' ? 'selected' : ''}`}
              style={{ backgroundColor: '#404375' }}
              onClick={() => handleColorChange('#404375', '#404375bf', '#151e22')}
            />
            <div
              className={`colorOption ${color === '#f39c12' ? 'selected' : ''}`}
              style={{ backgroundColor: '#f39c12' }}
              onClick={() => handleColorChange('#f39c12', '#f39c12bf', '#1C2022')}
            />
            <div
              className={`colorOption ${color === '#2ecc71' ? 'selected' : ''}`}
              style={{ backgroundColor: '#2ecc71' }}
              onClick={() => handleColorChange('#2ecc71', '#2ecc71bf', '#142B2B')}
            />
            <div
              className={`colorOption ${color === '#f1c40f' ? 'selected' : ''}`}
              style={{ backgroundColor: '#f1c40f' }}
              onClick={() => handleColorChange('#f1c40f', '#f1c40fbf', '#2a2b17')}
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

import React, { useState, useEffect } from 'react'; 
import '../index.css';
import '../styles/BrandingColorDiv.css';
import '../styles/ToggleSwitch.css'; // Stelle sicher, dass du die CSS-Datei importierst
import SettingsIcon from '../Assets/SettingsIcon';

const ChangeTheme = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState(getSavedColor().color);
  const [hoverColor, setHoverColor] = useState(getSavedColor().hoverColor);
  const [mode, setMode] = useState(getSavedMode());
  const [resultsPerPage, setResultsPerPage] = useState(getSavedResultsPerPage());

  // Funktion zum Laden der Branding-Farbe aus dem localStorage
  function getSavedColor() {
    const savedColor = localStorage.getItem('branding-color');
    const savedHoverColor = localStorage.getItem('branding-color-hover');
    return {
      color: savedColor || '#535bf2', // Standardfarbe
      hoverColor: savedHoverColor || '#535bf2bf', // Standard Hover-Farbe
    };
  }

  // Funktion zum Laden des Modus aus dem localStorage
  function getSavedMode() {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || 'dark'; // Standardmodus ist Dunkelmodus
  }

  // Funktion zum Laden der Ergebnisse pro Seite aus dem localStorage
  function getSavedResultsPerPage() {
    const savedResults = localStorage.getItem('results-per-page');
    const parsedResults = savedResults ? Number(savedResults) : 30; // Standardwert ist 30
    return parsedResults >= 10 && parsedResults <= 1000 && parsedResults % 10 === 0 
      ? parsedResults 
      : 30; // Sicherstellen, dass der Wert ein Vielfaches von 10 ist
  }

  // Funktion zum Ändern der Branding-Farbe
  const handleColorChange = (newColor, newHoverColor) => {
    setColor(newColor);
    setHoverColor(newHoverColor);
    localStorage.setItem('branding-color', newColor);
    localStorage.setItem('branding-color-hover', newHoverColor);
  };

  // Funktion zum Umschalten zwischen Dark- und Lightmode
  const handleModeChange = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  // Handler für den Slider
  const handleSliderChange = (event) => {
    let newValue = Number(event.target.value);
    // Sicherstellen, dass der Wert ein Vielfaches von 10 ist
    if (newValue % 10 !== 0) {
      newValue = Math.round(newValue / 10) * 10;
    }
    setResultsPerPage(newValue);
    localStorage.setItem('results-per-page', newValue);
    
    // Optional: Event zur Aktualisierung anderer Komponenten senden
    window.dispatchEvent(new Event('storage'));
  };

  // Aktualisiert CSS-Variablen und den Modus bei Änderung
  useEffect(() => {
    document.documentElement.style.setProperty('--branding-color', color);
    document.documentElement.style.setProperty('--branding-color-hover', hoverColor);

    if (mode === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [color, hoverColor, mode]);

  // Berechne den Prozentsatz basierend auf dem minimalen und maximalen Wert
  const min = 10;
  const max = 1000;
  const percentage = ((resultsPerPage - min) * 100) / (max - min);

  // Inline-Stil für den Slider
  const sliderStyle = {
    background: `linear-gradient(to right, #535bf2 0%, #535bf2 ${percentage}%, #d3d3d3 ${percentage}%, #d3d3d3 100%)`
  };

  return (
    <div
      className='brandingColorContainer'
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className={`brandingColorDiv ${isOpen ? 'open' : ''}`}>
        <div className="optionsContainer">
          <div className="colorOptions">
            {/* Farboptionen bleiben unverändert */}
            <div
              className={`colorOption ${color === '#535bf2' ? 'selected' : ''}`}
              style={{ backgroundColor: '#535bf2' }}
              onClick={() => handleColorChange('#535bf2', '#535bf2bf')}
            />
            <div
              className={`colorOption ${color === '#404375' ? 'selected' : ''}`}
              style={{ backgroundColor: '#404375' }}
              onClick={() => handleColorChange('#404375', '#404375bf')}
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
          <div className="modeOptions">
            {/* Toggle Switch für Dark und Light Mode */}
            <div className="toggle-switch">
              <label className="switch-label">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={mode === 'light'}
                  onChange={handleModeChange}
                />
                <span className="slider"></span>
              </label>
            </div>
            {/* Slider für Ergebnisse pro Seite */}
            <div className="results-per-page-slider flex center-ho space-between column">
              <label htmlFor="results-slider">
                <span className='white s14'>Results per page: </span>
                <span className='s14 white'>{resultsPerPage}</span>
              </label>
              <input
                type="range"
                id="results-slider"
                min={min}
                max={max}
                step="10" // Schrittweite auf 10 setzen
                value={resultsPerPage}
                onChange={handleSliderChange}
                style={sliderStyle} // Füge den Stil hinzu
              />
            </div>
          </div>
        </div>
      </div>
      <button className="toggleButton">
        <SettingsIcon
          filled={false} 
          textColor="currentColor" 
          size={28} 
          className="currency-icon"
        />
      </button>
    </div>
  );
};

export default ChangeTheme;

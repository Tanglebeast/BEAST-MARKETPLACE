import React from 'react';
import '../styles/ArtworkGrid.css';
import { Link } from 'react-router-dom';
import ShortenAddress from './ShortenAddress';

const ArtworkGrid = ({ cols, rows, width, height, images, collectionaddress, currencyIcon, userAddress }) => {
  const placeholderImage = '/available.png'; // Platzhalterbild für leere Plätze

  // Berechnung der optimalen Bildbreite und -höhe
  const optimalWidth = (width - (cols - 1) * 2) / cols; // Subtrahiere die Gesamtabstände (cols - 1) * 2 für Lücken
  const aspectRatio = images[0] ? images[0].height / images[0].width : 1; // Verhältnis von Höhe zu Breite des Bildes
  const optimalHeight = optimalWidth * aspectRatio;

  // Erstelle ein Array, das alle Grid-Plätze abdeckt
  const gridItems = Array.from({ length: rows * cols }, (_, index) => {
    const image = images[index] || { src: placeholderImage, name: 'Placeholder', tokenid: null, owner: null, preis: null };
    const isPlaceholder = !images[index]; // Überprüfe, ob es sich um ein Platzhalterbild handelt

    return (
      <div
        className='grid-item'
        key={index}
        style={{
          width: optimalWidth,
          height: optimalHeight
        }}
      >
        <div className='points-container'>
          {image.preis > 0 && <div className='blue-dot'></div>}
          {image.owner && image.owner.toLowerCase() === userAddress.toLowerCase() && <div className='green-dot'></div>}
        </div>
        <Link to={isPlaceholder ? `/fairmint/${collectionaddress}` : `/collections/${collectionaddress}/${String(image.tokenid)}`}>
          <div className='flip-card'>
            <div className='flip-card-inner'>
              <div className='flip-card-front'>
                <img
                  src={image.src}
                  alt={`Artwork ${index}`}
                  style={{
                    width: `${optimalWidth}px`,
                    height: `${optimalHeight}px`,
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div className='flip-card-back'>
                {isPlaceholder ? (
                  <div className='placeholder-back'>
                    <h2>MINT NOW</h2>
                  </div>
                ) : (
                  <div className='centered s20'>
                    <img src={currencyIcon} alt="Currency Icon" className="currency-icon" />
                    <h3>{image.preis || '0'}</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  });

  return (
    <div className='CollectionGrid'
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${optimalWidth}px)`,
        gridTemplateRows: `repeat(${rows}, ${optimalHeight}px)`,
        width: 'auto',
        height: 'auto',
        gap: '2px',
      }}
    >
      {gridItems}
    </div>
  );
};

export default ArtworkGrid;

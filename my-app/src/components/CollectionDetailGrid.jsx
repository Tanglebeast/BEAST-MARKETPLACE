import React from 'react';
import '../styles/ArtworkGrid.css';
import { Link } from 'react-router-dom';
import ShortenAddress from './ShortenAddress';

const ArtworkGrid = ({ cols, rows, width, height, images, collectionaddress, currencyIcon, userAddress }) => {
  // Berechnung der optimalen Bildbreite und -höhe
  const optimalWidth = (width - (cols - 1) * 2) / cols; // Subtrahiere die Gesamtabstände (cols - 1) * 2 für Lücken
  const aspectRatio = images[0].height / images[0].width; // Verhältnis von Höhe zu Breite des Bildes
  const optimalHeight = optimalWidth * aspectRatio;

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
      {images.map((image, index) => (
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
            {image.owner.toLowerCase() === userAddress.toLowerCase() && <div className='green-dot'></div>}
          </div>
          
          <Link to={`/collections/${collectionaddress}/${String(image.tokenid)}`}>
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
                  <h2 className='NFTGridName'>{image.name}</h2>
                  <div className='centered space-between w90'>
                    <p>OWNER<br /><ShortenAddress address={image.owner} /></p>
                    <div className='seperator'></div>
                    <p>TOKEN-ID<br /><ShortenAddress address={String(image.tokenid)} /></p>
                  </div>
                  <div className='centered s20'>
                    <img src={currencyIcon} alt="Currency Icon" className="currency-icon" />
                    <h3>{image.preis || '0'}</h3>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ArtworkGrid;

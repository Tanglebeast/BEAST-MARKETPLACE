import React from 'react';
import '../styles/ArtworkGrid.css';
import { Link } from 'react-router-dom'; // Assuming you are using React Router for navigation

const ArtworkGrid = ({ cols, rows, width, height, images }) => {
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const getFileNameWithoutExtension = (filePath) => {
    return filePath.split('/').pop().split('.').shift().toUpperCase();
  };

  return (
    <div className='CollectionGrid'
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellWidth}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellHeight}px)`,
        width: `${width}px`,
        height: `${height}px`,
        gap: '2px', // Optional: Adjust gap between cells
      }}
    >
      {images.map((image, index) => (
        <div className='grid-item' key={index} style={{ width: cellWidth, height: cellHeight }}>
          <Link to={`/collections/0x1bC3cB82829408454db779f6a94427FF38f378eC/${image.tokenid}`}>
            <div className='flip-card'>
              <div className='flip-card-inner'>
                <div className='flip-card-front'>
                  <img src={image.src} alt={`Artwork ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className='flip-card-back'>
                  <p>POSITION<br></br>{getFileNameWithoutExtension(image.src)}</p>
                  <p>FIELD-OWNERSHIP<br></br>8.33%</p>
                  <p>FIELD-SIZE<br></br>17.5x13.3cm</p>
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

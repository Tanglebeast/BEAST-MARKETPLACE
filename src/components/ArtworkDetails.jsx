import React, { useState, useEffect } from 'react';
import '../styles/ArtworkDetails.css';
import { PhysicalItems } from '../PhysicalItems'; // Pfad anpassen

const ArtworkDetails = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        previousImage();
      } else if (event.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentImageIndex]);

  const extractContractAddress = () => {
    const url = window.location.pathname; // Beispiel: /collections/0x8331dF63603d9d2dA72FCcEE73f4434C792ec529/tokenid
    const parts = url.split('/');
    return parts.length >= 3 ? parts[2] : null;
  };

  const contractAddress = extractContractAddress();

  const artwork = PhysicalItems.find(item => item.contractaddress === contractAddress) || {
    title: 'unknown',
    artist: 'unknown',
    category: 'unknown',
    size: 'unknown',
    medium: 'unknown',
    certificate: 'unknown',
    images: ['/unknown.jpg']
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? artwork.images.length - 1 : prevIndex - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === artwork.images.length - 1 ? 0 : prevIndex + 1));
    const nextIndex = (currentImageIndex + 1) % artwork.images.length;
    preloadImage(artwork.images[nextIndex]);
  };

  const preloadImage = (src) => {
    const img = new Image();
    img.src = src;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="artwork-details">
      <div className="ArtworkdetailsBody">
        <table>
        <h2 className='mt5'>Artwork details</h2>
          <tbody>
            <tr>
              <td>Title</td>
              <td>{artwork.title}</td>
            </tr>
            <tr>
              <td>Artist</td>
              <td>{artwork.artist}</td>
            </tr>
            <tr>
              <td>Category</td>
              <td>{artwork.category}</td>
            </tr>
            <tr>
              <td>Size</td>
              <td>{artwork.size}</td>
            </tr>
            <tr>
              <td>Medium</td>
              <td>{artwork.medium}</td>
            </tr>
            <tr>
              <td>Certificate of Authenticity</td>
              <td className='VisibleLink'>{artwork.certificate !== 'unknown' ? <a href={artwork.certificate}>See here</a> : 'unknown'}</td>
            </tr>
          </tbody>
        </table>
        <div className="ArtworkImages">
          <button className="nav-button left" onClick={previousImage}>&lt;</button>
          <div className="image-container" onClick={toggleFullscreen}>
            <img src={artwork.images[currentImageIndex]} alt="Artwork" loading="lazy" />
          </div>
          <button className="nav-button right" onClick={nextImage}>&gt;</button>
        </div>
      </div>
      {isFullscreen && (
        <div className="fullscreen-overlay" onClick={toggleFullscreen}>
          <img src={artwork.images[currentImageIndex]} alt="Artwork" className="fullscreen-image" loading="lazy" />
        </div>
      )}
    </div>
  );
};

export default ArtworkDetails;

import React, { useState, useEffect } from 'react';
import '../styles/ArtworkDetails.css';
import { PhysicalItems } from '../PhysicalItems'; // Pfad anpassen
import { isRedeemed } from '../components/utils'; // Neue isRedeemed Funktion importieren

const ArtworkDetails = ({ marketplace, account }) => { // marketplace und account als Props
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [redeemedStatus, setRedeemedStatus] = useState('pending'); // Status-Variable für Redeemed hinzufügen

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

  // Funktion zur Extraktion der Contract-Adresse
  const extractContractAddress = () => {
    const url = window.location.pathname; // Beispiel: /collections/0x8331dF63603d9d2dA72FCcEE73f4434C792ec529/tokenid
    const parts = url.split('/');
    console.log("URL parts:", parts); // Log für die Teile der URL
    return parts.length >= 3 ? parts[2] : null;
  };

  const contractAddress = extractContractAddress();

  // Artwork basierend auf der Contract-Adresse finden
  const artwork = PhysicalItems.find(item => item.contractaddress === contractAddress) || {
    title: 'unknown',
    artist: 'unknown',
    category: 'unknown',
    size: 'unknown',
    medium: 'unknown',
    certificate: 'unknown',
    images: ['/unknown.jpg'],
    status: 'unknown'
  };

  // Redeemed-Status abfragen
  useEffect(() => {
    const checkRedeemedStatus = async () => {
      if (contractAddress && marketplace) {
        try {
          console.log(`Checking redeemed status for contract address: ${contractAddress}`); // Log hier hinzufügen
          const isRedeemedStatus = await isRedeemed(contractAddress, marketplace);
          console.log(`Redeemed status for ${contractAddress}: ${isRedeemedStatus}`); // Log für den Status
          setRedeemedStatus(isRedeemedStatus ? 'redeemed' : artwork.status);
        } catch (error) {
          console.error('Error checking redeemed status:', error);
        }
      } else {
        console.log("Contract address or marketplace is not defined."); // Log hinzufügen
      }
    };

    if (contractAddress && marketplace) {
      checkRedeemedStatus();
    } else {
      console.log("Waiting for contract address and marketplace to be defined...");
    }
  }, [contractAddress, artwork.status, marketplace]);

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
            <td>Status</td>
            <td 
              className={`text-uppercase ${redeemedStatus === 'redeemed' ? 'redeemed-status' : 'normal-status'}`}>
              {redeemedStatus}
            </td>
          </tr>

                        {/* Bedingte Anzeige der Location-Spalte */}
                        {redeemedStatus !== 'redeemed' && (
              <tr>
                <td>Location</td>
                <td className='VisibleLink'>
                  <a href={artwork.location} target="_blank" rel="noopener noreferrer">{artwork.location_name}</a>
                </td>
              </tr>
            )}
            <tr></tr>
            <tr>
              <td>Certificate of Authenticity</td>
              <td className='VisibleLink'>
                {artwork.certificate !== 'unknown' ? <a href={artwork.certificate}>See here</a> : 'unknown'}
              </td>
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

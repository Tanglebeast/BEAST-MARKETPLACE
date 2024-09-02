import React, { useState, useEffect } from 'react';

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
  }, [currentImageIndex]); // Dependency Array

  // (Der Rest Ihres Codes bleibt unverändert)

  return (
    <div className="artwork-details">
      {/* Ihr bestehender Code hier */}
    </div>
  );
};

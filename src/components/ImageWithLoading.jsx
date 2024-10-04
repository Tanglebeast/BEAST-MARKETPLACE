import React, { useState } from 'react';

const ImageWithLoading = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleOnLoad = () => {
    setLoaded(true);
  };

  const handleOnError = () => {
    setHasError(true);
    setLoaded(true); // Wir setzen loaded auf true, um den Ladeplatzhalter zu entfernen
  };

  return (
    <div className={`${className || ''}`}>
      {!loaded && !hasError && (
        <img src="/image-loading.jpg" alt="Loading..." className="loading-image" />
      )}
      {(!hasError) && (
        <img
          src={src}
          alt={alt}
          style={!loaded ? { display: 'none' } : {}}
          onLoad={handleOnLoad}
          onError={handleOnError}
          className="actual-image"
        />
      )}
      {hasError && (
        <img src="/image-loading.jpg" alt="Error loading image" className="error-image" />
      )}
    </div>
  );
};

export default ImageWithLoading;

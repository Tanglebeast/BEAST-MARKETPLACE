// src/components/ProfilePicturePopup.jsx
import React, { useState, useMemo } from 'react';
import '../styles/ProfilePicturePopup.css'; // Verwenden Sie dasselbe Styling wie das ursprüngliche Popup

const ProfilePicturePopup = ({ nfts, handleSave, closePopup }) => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('All');

  // Extrahiere alle einzigartigen Kollektionennamen aus den NFTs
  const collectionNames = useMemo(() => {
    const names = nfts.map(nft => nft.collectionName); // Jedes NFT hat jetzt ein 'collectionName' Feld
    return ['All', ...new Set(names)];
  }, [nfts]);

  // Filtere die NFTs basierend auf der Suchabfrage und der ausgewählten Kollektion
  const filteredNFTs = useMemo(() => {
    return nfts.filter(nft => {
      const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCollection = selectedCollection === 'All' || nft.collectionName === selectedCollection;
      return matchesSearch && matchesCollection;
    });
  }, [nfts, searchQuery, selectedCollection]);

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
  };

  const handleSaveClick = () => {
    if (selectedNFT) {
      handleSave(selectedNFT.contractAddress, selectedNFT.tokenId, selectedNFT.image);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content-image">
        <button className="close-button" onClick={closePopup}>
          &times;
        </button>
        
        {nfts.length === 0 ? (
          <>
            <h2>Du besitzt keine NFTs</h2>
            {/* Keine NFTs vorhanden, also keinen Save-Button anzeigen */}
          </>
        ) : (
          <>
            <h2>Choose your PFP!</h2>
            
            {/* Such- und Filterbereich */}
            <div className="filter-search-container flex center-ho gap15 w50 mb50">
              {/* Suchleiste */}
              <input
                type="text"
                placeholder="Search for NFT names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              
              {/* Dropdown für Kollektionenauswahl */}
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="collection-select"
              >
                {collectionNames.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Anzeige der gefilterten NFTs */}
            <div className="nft-selection-popup">
              {filteredNFTs.length === 0 ? (
                <p>Keine NFTs entsprechen den Suchkriterien.</p>
              ) : (
                filteredNFTs.map(nft => (
                  <div
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    className={`NFT-item ${selectedNFT && selectedNFT.tokenId === nft.tokenId ? 'selected' : ''}`}
                    onClick={() => handleNFTSelect(nft)}
                  >
                    <div className='NFT-item-image'>
                      <img 
                        src={nft.image} 
                        alt={nft.name} 
                        title={nft.name} // Tooltip hinzufügen
                      />
                    </div>
                    {/* Optional: Wenn Sie weitere Informationen anzeigen möchten */}
                    {/* <div className='NFT-item-info'>
                      <h3>{nft.name}</h3>
                      <p>{nft.collectionName}</p>
                    </div> */}
                  </div>
                ))
              )}
            </div>

            {/* Save-Button */}
            <button
              className="actionbutton w10 w40media"
              onClick={handleSaveClick}
              disabled={!selectedNFT}
            >
              SAVE
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePicturePopup;

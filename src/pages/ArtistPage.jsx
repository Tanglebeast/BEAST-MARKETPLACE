// src/pages/ArtistPage.jsx
import React, { useState, useEffect } from 'react';
import { artistList } from '../ArtistList';
import { nftCollections } from '../NFTCollections';
import { Link } from 'react-router-dom';
import '../styles/ArtistPage.css';
import SearchBar from '../components/SearchBar';
import ArtistFilter from '../components/ArtistFilter';

const ArtistPage = () => {
  // Suchzustand
  const [searchQuery, setSearchQuery] = useState('');
  // Sortierzustand
  const [sortOrder, setSortOrder] = useState('');
  // Pagination-Zustände
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 30;
  const [loading, setLoading] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Handler für Sortieränderungen
  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1); // Reset auf erste Seite bei Sortieränderung
  };

  // Filtern der Künstler basierend auf dem Suchbegriff
  const filteredArtists = artistList.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sortieren der gefilterten Künstler basierend auf sortOrder
  const sortedArtists = [...filteredArtists].sort((a, b) => {
    if (sortOrder === 'newest') {
      return parseInt(b.timestamp) - parseInt(a.timestamp);
    } else if (sortOrder === 'oldest') {
      return parseInt(a.timestamp) - parseInt(b.timestamp);
    } else {
      return 0; // Keine Sortierung
    }
  });

  // Berechnung der Gesamtseiten
  const totalPages = Math.ceil(sortedArtists.length / resultsPerPage);

  // Begrenzen der angezeigten Künstler basierend auf der aktuellen Seite
  const artistsToShow = sortedArtists.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Funktion, um einzigartige Chains für einen Künstler zu erhalten
  const getArtistChains = (artistName) => {
    const collections = nftCollections.filter(collection => collection.artist === artistName);
    const uniqueChains = [...new Set(collections.map(collection => collection.network))];
    return uniqueChains;
  };

  // Funktion zum Simulieren des Ladevorgangs und Aktualisieren der Progressbar
  const loadPage = (page) => {
    setLoading(true);
    setProgressPercentage(0);
    const interval = setInterval(() => {
      setProgressPercentage(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 50); // Simuliere Fortschritt alle 50ms
  };

  // Effekt zum Laden der Seite bei Seitenwechsel
  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, sortOrder, searchQuery]);

  return (
    <div className="collection-nfts">
      {/* Banner hinzufügen, falls gewünscht */}
  
      <div className="nft-list centered hidden">
        <div className='w95 flex space-between CollectionDetail-mediaDiv'>
          <div className='w20 Coll-FilterDiv ButtonandFilterMedia'>
            <ArtistFilter onSortChange={handleSortChange} />
            {/* Falls du zusätzliche Filter hast */}
          </div>
          <div className='w100 flex column flex-start ml20 ml0-media'>
  
            <div className='w95 flex center-ho space-between'>
              <h2 className='mt15 OnlyDesktop mb15'>PROJECTS</h2>
  
              <div className="collection-stats gap15">
                {/* Optional: Statistiken anzeigen */}
                <div className='collection-stats-div text-align-left'>
                  <p className='s16 grey'>TOTAL PROJECTS</p>
                  <div className='bold ml5'>{artistList.length}</div>
                </div>
                {/* Weitere Statistiken können hier hinzugefügt werden */}
              </div>
            </div>
  
            <div className='flex space-between w95'>
              <div className='SearchbarDesktop text-align-left w30 w100media'>
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              </div>
              <div className="custom-pagination">
                <button 
                  className="custom-pagination-btn previous-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  &lt; 
                </button>
                <span className="custom-pagination-info">
                  {currentPage} OF {totalPages}
                </span>
  
                <button 
                  className="custom-pagination-btn next-btn custom-pagination-info-2 margin0"
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(prev => prev + 1);
                    }
                  }} 
                  disabled={currentPage === totalPages || loading}
                >
                  {loading ? (
                    <img src="/basic-loading.gif" alt="Loading..." className="loading-gif" />
                  ) : (
                    '>'
                  )}
                </button>
              </div>
            </div>
  
            {/* Progress-Bar während des Ladens */}
            {loading && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
  
            {/* Hauptinhalt der Artist-Collection */}
            {!loading && (
              <div className='NFT-Collection-Div gap10'>
                {artistsToShow.length === 0 ? (
                  <div className="no-nfts-container flex centered column">
                    <h2 className="no-nfts-message">No projects found...</h2>
                    <img src="/no-artist.png" alt="no artist Icon" className="no-nfts-image" />
                  </div>
                ) : (
                  artistsToShow.map((artist, index) => (
                    <Link to={`/projects/${artist.name}`} key={index} className="nft-card">
                      <div className='artistCard-image'>
                        <img src={artist.profilepicture} alt={`${artist.name} profile`} className="artist-profile-picture" />
                      </div>
                      <div className='w95'>
                        <h3 className="artist-name text-align-left blue">{artist.name}</h3>
                        {/* Optional: Chains anzeigen */}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
  
            {/* Lade-Overlay */}
            {loading && (
              <div className="loading-overlay">
                <img src="/loading.gif" alt="Loading..." className="loading-gif" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Pagination Controls am unteren Ende
      {!loading && (
        <div className="custom-pagination">
          <button 
            className="custom-pagination-btn previous-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1 || loading}
          >
            &lt; 
          </button>
          <span className="custom-pagination-info">
            {currentPage} OF {totalPages}
          </span>
  
          <button 
            className="custom-pagination-btn next-btn"
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
              }
            }} 
            disabled={currentPage === totalPages || loading}
          >
            &gt;
          </button>
        </div>
      )} */}
    </div>
  );
  
};

export default ArtistPage;

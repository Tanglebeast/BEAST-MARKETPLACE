import React, { useState, useEffect } from 'react';
import { artistList } from '../ArtistList';
import { nftCollections } from '../NFTCollections';
import { Link } from 'react-router-dom';
import '../styles/ArtistPage.css';
import SearchBar from '../components/SearchBar';
import ArtistFilter from '../components/ArtistFilter';
import Web3 from 'web3';

const contractABI = [ { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" } ], "name": "addProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" } ], "name": "followProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" } ], "name": "unfollowProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" } ], "name": "getFollowers", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" } ];
const contractAddress = '0x01d7D562A905A53f5855C0FEa2a1C00aAF0Fc4dC';

const ArtistPage = () => {
  // Suchzustand
  const [searchQuery, setSearchQuery] = useState('');
  // Sortierzustand
  const [sortOrder, setSortOrder] = useState('communityRank');
  // Pagination-Zustände
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 30;
  const [loading, setLoading] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  // Zustand für Follower-Anzahlen
  const [followerCounts, setFollowerCounts] = useState({});
  // Zustand, um das Laden beim Sortieren zu überspringen
  const [skipLoading, setSkipLoading] = useState(false);

  // Funktion zur Initialisierung von web3
  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      return web3;
    } else if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      return web3;
    } else {
      alert('Bitte installieren Sie MetaMask!');
      return null;
    }
  };

  // Funktion zum Abrufen der Follower-Anzahlen für alle Künstler
  const fetchAllFollowerCounts = async () => {
    const web3 = await initWeb3();
    if (!web3) return;

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const counts = {};

    try {
      // Für jeden Künstler die Follower-Anzahl abrufen
      for (let artist of artistList) {
        const followers = await contract.methods
          .getFollowers(artist.name.toLowerCase())
          .call();

        counts[artist.name.toLowerCase()] = followers.length;
      }

      setFollowerCounts(counts);
    } catch (error) {
      console.error('Fehler beim Abrufen der Follower-Daten:', error);
    }
  };

  // Handler für Sortieränderungen
  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1); // Reset auf erste Seite bei Sortieränderung
    setSkipLoading(true); // Verhindert das Laden beim Sortieren
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
    } else if (sortOrder === 'communityRank') {
      const followersA = followerCounts[a.name.toLowerCase()] || 0;
      const followersB = followerCounts[b.name.toLowerCase()] || 0;
      return followersB - followersA;
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

  // Effekt zum Laden der Seite bei Seitenwechsel
  useEffect(() => {
    if (!skipLoading) {
      loadPage(currentPage);
    } else {
      setSkipLoading(false);
    }
  }, [currentPage, searchQuery]); // Entfernen von sortOrder aus den Abhängigkeiten

  // Abrufen der Follower-Anzahlen beim Laden der Komponente
  useEffect(() => {
    fetchAllFollowerCounts();
  }, []);

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
  
              <div className="project-stats gap15">
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
                        <p>{followerCounts[artist.name.toLowerCase()] || 0} Follower</p>
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

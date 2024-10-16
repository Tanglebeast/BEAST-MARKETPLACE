// src/pages/ArtistPage.js

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { artistList } from '../ArtistList';
import { Link } from 'react-router-dom';
import '../styles/ArtistPage.css';
import SearchBar from '../components/SearchBar';
import ArtistFilter from '../components/ArtistFilter';
import { getFollowers, isFollowingProject, getCurrentAccount } from '../components/utils'; // Import der Utility-Funktionen

// Funktion zum Abrufen der Ergebnisse pro Seite aus dem localStorage
const getSavedResultsPerPage = () => {
  const savedResults = localStorage.getItem('results-per-page');
  return savedResults ? Number(savedResults) : 30; // Standardwert ist 30
};

const ArtistPage = () => {
  // Suchzustand
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sortierzustand
  const [sortOrder, setSortOrder] = useState('communityRank');
  
  // Pagination-Zustände
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(getSavedResultsPerPage());
  
  // Ladezustände
  const [loading, setLoading] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [skipLoading, setSkipLoading] = useState(false);
  
  // Zustand für Follower-Anzahlen
  const [followerCounts, setFollowerCounts] = useState({});
  
  // Neuer Zustand für den Following-Filter
  const [showFollowing, setShowFollowing] = useState(false);
  const [followedProjects, setFollowedProjects] = useState([]);
  const [userAddress, setUserAddress] = useState(null);

  const userCache = useRef({}); // Falls du Caching benötigst

  useEffect(() => {
    console.log('showFollowing:', showFollowing);
    console.log('followedProjects:', followedProjects);
  }, [showFollowing, followedProjects]);

  // Funktion zum Abrufen der Benutzeradresse
  const fetchUserAddress = async () => {
    const account = await getCurrentAccount();
    if (account) {
      const lowerCaseAccount = account.toLowerCase();
      setUserAddress(lowerCaseAccount);
      console.log('User Address:', lowerCaseAccount); // Debugging-Log
    } else {
      console.log('Keine Benutzeradresse gefunden'); // Debugging-Log
    }
  };

  // Funktion zum Abrufen der Follower-Anzahlen für alle Künstler
  const fetchAllFollowerCounts = async () => {
    const counts = {};

    try {
      // Für jeden Künstler die Follower-Anzahl abrufen
      for (let artist of artistList) {
        const followers = await getFollowers(artist.name.toLowerCase());
        counts[artist.name.toLowerCase()] = followers.length;
      }

      setFollowerCounts(counts);
    } catch (error) {
      console.error('Fehler beim Abrufen der Follower-Daten:', error);
    }
  };

  // Funktion zum Abrufen der gefolgten Projekte
  const fetchFollowedProjects = async () => {
    if (!userAddress) {
      console.log('Keine Benutzeradresse vorhanden');
      return;
    }

    const followed = [];

    try {
      for (let artist of artistList) {
        const isFollowing = await isFollowingProject(artist.name.toLowerCase(), userAddress);
        console.log(`Is following ${artist.name}:`, isFollowing); // Debugging-Log
        if (isFollowing) {
          followed.push(artist.name.toLowerCase());
        }
      }
      setFollowedProjects(followed);
      console.log('Gefolgte Projekte:', followed); // Debugging-Log
    } catch (error) {
      console.error('Fehler beim Abrufen der gefolgten Projekte:', error);
    }
  };

  // Handler für Sortieränderungen
  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1); // Reset auf erste Seite bei Sortieränderung
    setSkipLoading(true); // Verhindert das Laden beim Sortieren
  };

  // Handler für Following-Filteränderungen
  const handleFollowingChange = (value) => {
    setShowFollowing(value);
    setCurrentPage(1); // Reset auf erste Seite bei Filteränderung
    setSkipLoading(true); // Verhindert das Laden beim Filter
  };

  // Filtern der Künstler basierend auf dem Suchbegriff und dem "Following"-Filter
  const filteredArtists = artistList.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(artist => {
    if (showFollowing) {
      return followedProjects.includes(artist.name.toLowerCase());
    }
    return true;
  });

  // Sortieren der gefilterten Künstler basierend auf sortOrder
  const sortedArtists = useMemo(() => {
    return [...filteredArtists].sort((a, b) => {
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
  }, [filteredArtists, sortOrder, followerCounts]);

  // Berechnung der Gesamtseiten
  const totalPagesCalculated = useMemo(() => {
    return Math.ceil(sortedArtists.length / resultsPerPage) || 1;
  }, [sortedArtists.length, resultsPerPage]);

  // Begrenzen der angezeigten Künstler basierend auf der aktuellen Seite
  const artistsToShow = useMemo(() => {
    return sortedArtists.slice(
      (currentPage - 1) * resultsPerPage,
      currentPage * resultsPerPage
    );
  }, [sortedArtists, currentPage, resultsPerPage]);

  // Effekt zum Laden der Seite bei Seitenwechsel
  useEffect(() => {
    if (!skipLoading) {
      loadPage(currentPage);
    } else {
      setSkipLoading(false);
    }
  }, [currentPage]);

  // Abrufen der Follower-Anzahlen beim Laden der Komponente
  useEffect(() => {
    fetchAllFollowerCounts();
  }, []);

  // Abrufen der Benutzeradresse beim Laden der Komponente
  useEffect(() => {
    fetchUserAddress();
  }, []);

  // Abrufen der gefolgten Projekte, wenn showFollowing aktiviert ist
  useEffect(() => {
    if (showFollowing && userAddress) {
      fetchFollowedProjects();
    } else {
      setFollowedProjects([]);
    }
  }, [showFollowing, userAddress]);

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

  // useEffect zur Überwachung von Änderungen im localStorage
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'results-per-page') {
        const newResults = event.newValue ? Number(event.newValue) : 30;
        setResultsPerPage(newResults);
        setCurrentPage(1); // Optional: Setze die aktuelle Seite zurück, wenn sich die Ergebnisse pro Seite ändern
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="collection-nfts">
      {/* Banner hinzufügen, falls gewünscht */}

      <div className="nft-list centered hidden">
        <div className='w95 flex space-between CollectionDetail-mediaDiv'>
          <div className='w20 Coll-FilterDiv ButtonandFilterMedia'>
            {/* Angepasste Filterkomponente mit "Following" */}
            <ArtistFilter 
              sortOrder={sortOrder} 
              onSortChange={handleSortChange} 
              showFollowing={showFollowing}
              onFollowingChange={handleFollowingChange}
            />
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

            <div className='flex space-between w95 mediacolumn2'>
              <div className='SearchbarDesktop text-align-left w30 w100media'>
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              </div>

              {/* Paginierung */}
              <div className="custom-pagination">
                <button 
                  className="custom-pagination-btn previous-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                  aria-label="Vorherige Seite"
                >
                  &lt; 
                </button>
                <span className="custom-pagination-info">
                  {currentPage} OF {totalPagesCalculated}
                </span>

                <button 
                  className="custom-pagination-btn next-btn custom-pagination-info-2 margin0"
                  onClick={() => {
                    if (currentPage < totalPagesCalculated) {
                      setCurrentPage(prev => prev + 1);
                    }
                  }} 
                  disabled={currentPage === totalPagesCalculated || loading}
                  aria-label="Nächste Seite"
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
                <span className="progress-text">{`${Math.round(progressPercentage)}%`}</span>
              </div>
            )}

            {/* Hauptinhalt der Artist-Collection */}
            {!loading && (
              <div className='NFT-Collection-Div gap10'>
                {artistsToShow.length === 0 ? (
                  <div className="no-nfts-container flex centered column">
                    <h2 className="no-nfts-message">No projects found...</h2>
                    <img src="/no-nft.png" alt="no artist Icon" className="no-nfts-image" />
                  </div>
                ) : (
                  artistsToShow.map((artist, index) => (
                    <Link to={`/projects/${artist.name.toLowerCase()}`} key={index} className="nft-card">
                      <div className='artistCard-image'>
                        <img src={artist.profilepicture} alt={`${artist.name} profile`} className="artist-profile-picture" />
                      </div>
                      <div className='w95'>
                        <h3 className="artist-name text-align-left blue">{artist.name}</h3>
                        <p className='followercount'>{followerCounts[artist.name.toLowerCase()] || 0} Follower</p>
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
      
      {/* Pagination Controls am unteren Ende (optional) */}
    </div>
  );
};

export default ArtistPage;

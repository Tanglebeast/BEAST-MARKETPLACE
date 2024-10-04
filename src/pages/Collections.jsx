import React, { useState, useEffect, useCallback } from 'react';
import { nftCollections } from '../NFTCollections';
import '../styles/Collections.css';
import ShortenAddress from '../components/ShortenAddress';
import SearchBar from '../components/SearchBar';
import { getCollectionDetails, getCollectionLikes, fetchCollectionSalesCount } from '../components/utils';
import CollectionFilter from '../components/CollectionFilter';
import { getCurrentNetwork } from '../components/networkConfig';
import ImageWithLoading from '../components/ImageWithLoading';

const CollectionCards = ({ limit, showSearchBar, showFilter }) => {
  // State für Suche und Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ artists: [], networks: [], sortOrder: 'community_rank' });
  const [selectedNetwork, setSelectedNetwork] = useState(getCurrentNetwork());
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // State für Daten
  const [collectionDetails, setCollectionDetails] = useState({});
  const [collectionSalesCounts, setCollectionSalesCounts] = useState({});
  
  // State für Loading und Pagination
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 30; // Anpassen nach Bedarf
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Neue States für optimiertes Laden
  const [loadedPages, setLoadedPages] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Optimierte fetchPageData Funktion mit parallelen Abfragen
  const fetchPageData = useCallback(async (page) => {
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const pageCollections = nftCollections.slice(startIndex, endIndex);

    try {
      const pageDetails = await Promise.all(
        pageCollections.map(async (collection, index) => {
          // Parallele Abfragen innerhalb jeder Sammlung
          const [details, likes, salesCount] = await Promise.all([
            getCollectionDetails(collection.address),
            getCollectionLikes(collection.address),
            fetchCollectionSalesCount(collection.address)
          ]);

          // Fortschrittsbalken aktualisieren
          setProgressPercentage(Math.round(((index + 1) / pageCollections.length) * 100));

          return { address: collection.address, ...details, likes, salesCount };
        })
      );

      // Daten zusammenführen
      const detailsMap = pageDetails.reduce((acc, detail) => {
        acc[detail.address] = { ...detail };
        return acc;
      }, {});

      const salesCountsMap = pageDetails.reduce((acc, detail) => {
        acc[detail.address] = detail.salesCount;
        return acc;
      }, {});

      // State aktualisieren
      setCollectionDetails(prevDetails => ({ ...prevDetails, ...detailsMap }));
      setCollectionSalesCounts(prevCounts => ({ ...prevCounts, ...salesCountsMap }));
      setLoadedPages(prevPages => [...prevPages, page]);
    } catch (error) {
      console.error('Fehler beim Laden der Seiten-Daten:', error);
    }
  }, [resultsPerPage]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchPageData(1);
      setIsInitialLoad(false);
      setIsLoading(false);
    };

    loadInitialData();
  }, [fetchPageData]);

  useEffect(() => {
    if (!isInitialLoad && !loadedPages.includes(currentPage)) {
      fetchPageData(currentPage);
    }
  }, [currentPage, isInitialLoad, loadedPages, fetchPageData]);

  // Update Network if it changes
  useEffect(() => {
    const updateNetwork = () => {
      const currentNetwork = getCurrentNetwork();
      setSelectedNetwork(currentNetwork);
    };

    updateNetwork();
    // Optional: Event-Listener für Netzwerkwechsel hinzufügen
  }, []);

  // Handle Filter Changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Zurücksetzen auf Seite 1 bei Filteränderung
  };

  // Filtern der Kollektionen basierend auf Suche und Filter
  const filteredCollections = nftCollections
    .filter(collection => {
      const matchesSearch = 
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesArtists = filters.artists.length === 0 || filters.artists.includes(collection.artist);
      const matchesNetworks = filters.networks.length === 0 || filters.networks.includes(collection.network);
      const matchesNetworkSelection = collection.network === selectedNetwork;

      // Kategorien filtern
      const categories = collection.category.split(',').map(cat => cat.trim());
      const matchesCategory = selectedCategory === 'ALL' || categories.includes(selectedCategory);

      return matchesSearch && matchesArtists && matchesNetworks && matchesNetworkSelection && matchesCategory;
    })
    .map(collection => ({
      ...collection,
      timestamp: parseInt(collection.timestamp, 10),
      likes: collectionDetails[collection.address]?.likes || 0,
      salesCount: collectionSalesCounts[collection.address] || 0
    }));

  // Sortieren basierend auf sortOrder
  const sortedCollections = [...filteredCollections];
  if (filters.sortOrder === 'community_rank') {
    sortedCollections.sort((a, b) => b.likes - a.likes);
  } else if (filters.sortOrder === 'newest') {
    sortedCollections.sort((a, b) => b.timestamp - a.timestamp);
  } else if (filters.sortOrder === 'oldest') {
    sortedCollections.sort((a, b) => a.timestamp - b.timestamp);
  } else if (filters.sortOrder === 'top_traded') {
    sortedCollections.sort((a, b) => b.salesCount - a.salesCount);
  }

  // Berechnung der totalPages
  const totalPages = Math.ceil(sortedCollections.length / resultsPerPage);

  // Aktuelle Seite der Kollektionen
  const currentCollections = sortedCollections.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Event Handler für Kategorie-Auswahl
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Zurücksetzen auf Seite 1 bei Kategorieänderung
  };

  return (
    <div className='CollectionDiv'>
      <h2 className='text-align-left mt15 onlymedia'>COLLECTIONS</h2>
      <div className='w95 space-between flex MediaGalleryDiv'>
        {showFilter && (
          <div className='w20 Coll-FilterDiv'>
            <CollectionFilter onFilterChange={handleFilterChange} />
          </div>
        )}
        <div className='centered w95 column flex flex-start ml20 MediaGalleryUnderDiv'>
          <h2 className='text-align-left mt15 OnlyDesktop'>COLLECTIONS</h2>
          <div className='SearchbarDesktop text-align-left w30 w100media'>
            {showSearchBar && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          </div>
          
          {/* Kategorie- und Pagination-Buttons */}
          <div className='flex center-ho mt15 mb5 space-between w95'>
            <div className='flex center-ho gap5'>
              {/* Kategorie Buttons */}
              {['ALL', 'ART', 'PFP', 'PHOTOGRAPHY', 'METAVERSE', 'GAMING', 'MUSIC'].map((category) => (
                <div
                  key={category}
                  className={`collectionCategoryDiv ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <h3>{category}</h3>
                </div>
              ))}
            </div>
            
            {/* Pagination Buttons */}
            <div className='pagination-buttons flex center-ho gap10'>
              <button 
                className="custom-pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
              >
                &lt; 
              </button>
              <span className="pagination-info">
                {currentPage} OF {totalPages}
              </span>
              <button 
                className="custom-pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
              >
                 &gt;
              </button>
            </div>
          </div>

          {/* Progress-Bar während des Ladens */}
          {isLoading && (
            <div className="collection-progress-bar-container mt10 mb10">
              <div 
                className="progress-bar" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          )}

          {/* Hauptinhalt der Kollektionen */}
          {isInitialLoad ? (
            <div className="loading-container flex centered">
              <img src="/loading.gif" alt="Loading..." className="loading-image" />
            </div>
          ) : sortedCollections.length === 0 ? (
            <div className="no-nfts-container flex centered column">
              <h2 className="no-nfts-message">No collections found...</h2>
              <img src="/no-nft.png" alt="No collections" className="no-nft-image" />
            </div>
          ) : (
            <div className={`collection-cards ${currentCollections.length < 5 ? 'centered-cards' : ''}`}>
              {currentCollections.map((collection, index) => (
                <a href={`/collections/${collection.address}`} key={index} className="collection-card">
                  <div className='collection-banner'>
                  <ImageWithLoading src={collection.banner} alt={collection.name} />
                  </div>

                  <div className='text-align-left w90 mb5 collection-infoCardDiv'>
                    <div className='mb5 card-footer-infoDiv'>
                      <h3 className='mb10'>{collection.name}</h3>
                      <span className='s18 grey'>{collection.artist}</span>
                    </div>
                    {collectionDetails[collection.address] && (
                      <>
                        {/* Zusätzliche Informationen können hier hinzugefügt werden */}
                        {/* Beispiel:
                        <div className='likes-info'>
                          <p className='mb5'>Likes</p>
                          <div className='s20'>
                            {collectionDetails[collection.address].likes}
                          </div>
                        </div>
                        */}
                      </>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Pagination Buttons am unteren Ende */}
          {/* 
          {!isLoading && sortedCollections.length > resultsPerPage && (
            <div className='flex center-ho gap10 mt15 mb5 w95 flex-end'>
              <button 
                className="custom-pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
              >
                &lt; 
              </button>
              <span className="pagination-info">
                {currentPage} OF {totalPages}
              </span>
              <button 
                className="custom-pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
              >
                 &gt;
              </button>
            </div>
          )} 
          */}
        </div>
      </div>
    </div>
  );
};

export default CollectionCards;

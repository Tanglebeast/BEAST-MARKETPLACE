// CollectionCards.jsx
import React, { useState, useEffect } from 'react'; 
import { nftCollections } from '../NFTCollections';
import '../styles/Collections.css';
import ShortenAddress from '../components/ShortenAddress';
import SearchBar from '../components/SearchBar';
import { getCollectionDetails, getCollectionLikes, fetchCollectionSalesCount } from '../components/utils'; // Stelle sicher, dass fetchCollectionSalesCount importiert ist
import CollectionFilter from '../components/CollectionFilter';
import { getCurrentNetwork } from '../components/networkConfig'; // Stelle sicher, dass der Import korrekt ist

const CollectionCards = ({ limit, showSearchBar, showFilter }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionDetails, setCollectionDetails] = useState({});
  const [filters, setFilters] = useState({ artists: [], networks: [], sortOrder: 'community_rank' }); // Inklusive sortOrder mit Default-Wert
  const [selectedNetwork, setSelectedNetwork] = useState(getCurrentNetwork()); // Nutze den aktuellen Netzwerkwert
  const [collectionSalesCounts, setCollectionSalesCounts] = useState({}); // Neue State für Verkaufszahlen

  useEffect(() => {
    const fetchCollectionData = async () => {
      const details = await Promise.all(
        nftCollections.map(async (collection) => {
          const details = await getCollectionDetails(collection.address);
          const likes = await getCollectionLikes(collection.address); // Likes abrufen
          const salesCount = await fetchCollectionSalesCount(collection.address); // Verkaufszahlen abrufen
          return { address: collection.address, ...details, likes, salesCount };
        })
      );
      const detailsMap = details.reduce((acc, detail) => {
        acc[detail.address] = { ...detail };
        return acc;
      }, {});
      setCollectionDetails(detailsMap);

      const salesCountsMap = details.reduce((acc, detail) => {
        acc[detail.address] = detail.salesCount;
        return acc;
      }, {});
      setCollectionSalesCounts(salesCountsMap);
    };

    fetchCollectionData();
  }, []);

  useEffect(() => {
    // Wenn selectedNetwork sich ändert, z.B. durch einen Netzwerkwechsel, führe eine Aktualisierung durch
    const updateNetwork = () => {
      const currentNetwork = getCurrentNetwork();
      setSelectedNetwork(currentNetwork);
    };

    updateNetwork();
    // Optional: Abhängig von deiner Netzwerk-Konfiguration könntest du Event-Listener hinzufügen

  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredCollections = nftCollections
    .filter(collection => {
      const matchesSearch = 
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesArtists = filters.artists.length === 0 || filters.artists.includes(collection.artist);
      const matchesNetworks = filters.networks.length === 0 || filters.networks.includes(collection.network);
      const matchesNetworkSelection = collection.network === selectedNetwork;

      return matchesSearch && matchesArtists && matchesNetworks && matchesNetworkSelection;
    })
    .map(collection => ({
      ...collection,
      timestamp: parseInt(collection.timestamp, 10), // Konvertiere timestamp zu Zahl für Sortierung
      likes: collectionDetails[collection.address]?.likes || 0, // Behalte likes bei
      salesCount: collectionSalesCounts[collection.address] || 0 // Behalte salesCount bei
    }));

  // Sorting based on sortOrder
  const sortedCollections = [...filteredCollections];
  if (filters.sortOrder === 'community_rank') {
    sortedCollections.sort((a, b) => b.likes - a.likes); // Sortiere nach den meisten Likes
  } else if (filters.sortOrder === 'newest') {
    sortedCollections.sort((a, b) => b.timestamp - a.timestamp); // Sortiere nach neuesten
  } else if (filters.sortOrder === 'oldest') {
    sortedCollections.sort((a, b) => a.timestamp - b.timestamp); // Sortiere nach ältesten
  } else if (filters.sortOrder === 'top_traded') {
    sortedCollections.sort((a, b) => b.salesCount - a.salesCount); // Sortiere nach den meisten Verkäufen
  }

  const collectionsToShow = limit ? sortedCollections.slice(0, limit) : sortedCollections;

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
          {collectionsToShow.length === 0 ? (
            <div className="no-nfts-container flex centered column">
              <h2 className="no-nfts-message">No collections found...</h2>
              <img src="/no-nft.png" alt="No collections" className="no-nft-image" />
            </div>
          ) : (
            <div className={`collection-cards ${collectionsToShow.length < 5 ? 'centered-cards' : ''}`}>
              {collectionsToShow.map((collection, index) => (
                <a href={`/collections/${collection.address}`} key={index} className="collection-card">
                  <div className='collection-banner'>
                    <img src={collection.banner} alt={collection.name} />
                  </div>

                  <div className='text-align-left w90 mb5 collection-infoCardDiv'>
                    <div className='mb5 card-footer-infoDiv'>
                      <h3 className='mb10'>{collection.name}</h3>
                      <span className='s18 grey'>{collection.artist}</span>
                    </div>
                    {collectionDetails[collection.address] && (
                      <>
                        {/* Zusätzliche Informationen können hier hinzugefügt werden */}
                        {/* <div className='likes-info'>
                          <p className='mb5'>Likes</p>
                          <div className='s20'>
                            {collectionDetails[collection.address].likes}
                          </div>
                        </div>
                        <div className='sales-info'>
                          <p className='mb5'>Sales</p>
                          <div className='s20'>
                            {collectionDetails[collection.address].salesCount}
                          </div>
                        </div>
                        <div className='timestamp-info'>
                          <p className='mb5'>Created:</p>
                          <div className='s20'>
                            {new Date(collection.timestamp * 1000).toLocaleDateString()}
                          </div>
                        </div> */}
                      </>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionCards;

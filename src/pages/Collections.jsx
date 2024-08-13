import React, { useState, useEffect } from 'react';
import { nftCollections } from '../NFTCollections';
import '../styles/Collections.css';
import ShortenAddress from '../components/ShortenAddress';
import SearchBar from '../components/SearchBar';
import { getCollectionDetails } from '../components/utils';
import CollectionFilter from '../components/CollectionFilter';

const CollectionCards = ({ limit, showSearchBar, showFilter, selectedNetwork }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionDetails, setCollectionDetails] = useState({});
  const [filters, setFilters] = useState({ artists: [], networks: [] });

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      const details = await Promise.all(
        nftCollections.map(async (collection) => {
          const details = await getCollectionDetails(collection.address);
          return { address: collection.address, ...details };
        })
      );
      const detailsMap = details.reduce((acc, detail) => {
        acc[detail.address] = detail;
        return acc;
      }, {});
      setCollectionDetails(detailsMap);
    };

    fetchCollectionDetails();
  }, []);

  const filteredCollections = nftCollections.filter(collection => 
    (collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     collection.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
     collection.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filters.artists.length === 0 || filters.artists.includes(collection.artist)) &&
    (filters.networks.length === 0 || filters.networks.includes(collection.network)) &&
    collection.network === selectedNetwork // Filter by selected network
  );

  const collectionsToShow = limit ? filteredCollections.slice(0, limit) : filteredCollections;

  return (
    <div className='CollectionDiv'>
      <h2 className='text-align-left mt15 onlymedia'>GALLERY</h2>
      <div className='w95 space-between flex MediaGalleryDiv'>
        {showFilter && (
          <div className='w20 Coll-FilterDiv'>
            <CollectionFilter onFilterChange={setFilters} />
          </div>
        )}
        <div className='centered w95 column flex flex-start ml20 MediaGalleryUnderDiv'>
          <h2 className='text-align-left mt15 OnlyDesktop'>GALLERY</h2>
          <div className='SearchbarDesktop text-align-left w30 w100media'>
          {showSearchBar && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          </div>
          {collectionsToShow.length === 0 ? (
            <div className="no-nfts-container flex centered column">
              <h2 className="no-nfts-message">No collections found...</h2>
              <img src="/no-nft.png" alt="No collections" className="no-nfts-image" />
            </div>
          ) : (
            <div className={`collection-cards ${collectionsToShow.length < 5 ? 'centered-cards' : ''}`}>
              {collectionsToShow.map((collection, index) => (
                <a href={`/collections/${collection.address}`} key={index} className="collection-card">
                  <div className='collection-banner'>
                    <img src={collection.banner} alt={collection.name} />
                    <div className='networklogo'>
                      <img src={collection.currency} alt="currency logo" className="currency-logo-coll" />
                    </div>
                  </div>

                  <div className='text-align-left w90 mb5 collection-infoCardDiv'>
                    <div className='mb15'>
                  <h3 className='mb10'>{collection.name}</h3>
                  <span className='s18 grey'>{collection.artist}</span>
                  </div>
                  {collectionDetails[collection.address] && (
                    <>
                      <div className='centered space-between w100 border-top'>
                        <div className='centered column'>
                          <p className='mb5 mt10px'>FLOOR</p>
                          <div className='centered s20'>
                            {collectionDetails[collection.address].floorPrice}
                            <img src={collection.currency} alt="currency logo" className="currency-logo-coll" />
                          </div>
                        </div>
                        <div className='centered column'>
                          <p className='mb5 mt10px'>LISTED</p>
                          <div className='s20'>
                            {collectionDetails[collection.address].listedCount}
                          </div>
                        </div>
                      </div>
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

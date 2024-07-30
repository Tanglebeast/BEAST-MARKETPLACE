import React, { useState, useEffect } from 'react';
import { nftCollections } from '../NFTCollections';
import '../styles/Collections.css';
import ShortenAddress from '../components/ShortenAddress';
import SearchBar from '../components/SearchBar';
import { getCollectionDetails } from '../components/utils';
import CollectionFilter from '../components/CollectionFilter';

const CollectionCards = ({ limit, showSearchBar, showFilter }) => {
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
    (filters.networks.length === 0 || filters.networks.includes(collection.network))
  );

  const collectionsToShow = limit ? filteredCollections.slice(0, limit) : filteredCollections;

  return (
    <div className='CollectionDiv'>
      <div className='w95 space-between flex'>
        {showFilter && (
          <div className='w20'>
            <CollectionFilter onFilterChange={setFilters} />
          </div>
        )}
        <div className='centered w95 column flex flex-start ml20'>
          <h2 className='text-align-left mt15'>GALLERY</h2>
          {showSearchBar && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          <div className={`collection-cards ${collectionsToShow.length < 5 ? 'centered-cards' : ''}`}>
            {collectionsToShow.map((collection, index) => (
              <a href={`/collections/${collection.address}`} key={index} className="collection-card">
                <div className='collection-banner'>
                  <img src={collection.banner} alt={`${collection.name}`} />
                  <div className='networklogo'><img src={collection.currency} alt="currency logo" className="currency-logo-coll" /></div>
                </div>
                <h3 className='mb5'>{collection.name}</h3>
                <p className='s18'>{collection.artist}</p>
                {collectionDetails[collection.address] && (
                  <>
                    <div className='centered space-between w80'>
                      <div className='centered column'>
                        <p className='mb5'>FLOOR</p>
                        <div className='centered s20'>{collectionDetails[collection.address].floorPrice}
                          <img src={collection.currency} alt="currency logo" className="currency-logo-coll" />
                        </div>
                      </div>
                      <div className='centered column'>
                        <p className='mb5'>LISTED</p>
                        <div className='s20'>
                          {collectionDetails[collection.address].listedCount}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCards;

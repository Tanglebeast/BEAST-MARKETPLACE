import React, { useState, useEffect } from 'react';
import { nftCollections } from '../Fairlaunch/PublicSaleNFTCollections';
import '../styles/Collections.css';
import ShortenAddress from '../components/ShortenAddress';
import SearchBar from '../components/SearchBar';
import { getCollectionDetails } from '../components/utils';

const PublicCollectionCards = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionDetails, setCollectionDetails] = useState({});

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
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='CollectionDiv'>
      <h2>GALLERY</h2>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="collection-cards">
        {filteredCollections.map((collection, index) => (
          <a href={`/fairlaunch/${collection.address}`} key={index} className="collection-card">
            <div className='collection-banner'>
              <img src={collection.banner} alt={`${collection.name}`} />
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
  );
};

export default PublicCollectionCards;

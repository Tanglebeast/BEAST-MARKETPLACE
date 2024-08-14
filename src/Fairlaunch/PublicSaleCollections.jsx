import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { nftCollections } from '../NFTCollections';
import '../styles/Collections.css';
import SearchBar from '../components/SearchBar';
import CollectionFilter from '../components/CollectionFilter';
import { web3OnlyRead } from '../components/utils';

const FairMintCollections = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionDetails, setCollectionDetails] = useState({});
  const [filters, setFilters] = useState({ artists: [], networks: [] });
  const [loading, setLoading] = useState(true); // Zustand für das Laden hinzufügen

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      // if (!window.ethereum) {
      //   console.error('MetaMask is not installed');
      //   setLoading(false); // Setze loading auf false, wenn MetaMask nicht installiert ist
      //   return;
      // }

      const web3 = web3OnlyRead

      try {
        const details = await Promise.all(
          nftCollections.map(async (collection) => {
            try {
              const contractAbi = collection.abi; // ABI aus nftCollections entnehmen
              const contract = new web3.eth.Contract(contractAbi, collection.address);

              // Daten als BigInt zurückgegeben; Umwandlung in reguläre Zahlen
              const totalSupply = Number(await contract.methods.totalSupply().call());
              const maxSupply = Number(await contract.methods.MAX_SUPPLY().call());
              const availableSupply = maxSupply - totalSupply;

              console.log('Contract Address:', collection.address);
              console.log('Total Supply:', totalSupply);
              console.log('Max Supply:', maxSupply);
              console.log('Available Supply:', availableSupply);

              return {
                address: collection.address,
                totalSupply,
                maxSupply,
                availableSupply, // Berechneter Wert für verfügbare Menge
              };
            } catch (error) {
              console.error('Error fetching contract details:', error);
              return {
                address: collection.address,
                totalSupply: null,
                maxSupply: null,
                availableSupply: null, // Setze verfügbaren Wert auf null im Fehlerfall
              };
            }
          })
        );

        const detailsMap = details.reduce((acc, detail) => {
          acc[detail.address] = detail;
          return acc;
        }, {});
        setCollectionDetails(detailsMap);
      } catch (error) {
        console.error('Error fetching collection details:', error);
      } finally {
        setLoading(false); // Setze loading auf false, wenn der Abruf abgeschlossen ist
      }
    };

    fetchCollectionDetails();
  }, []);

  const filteredCollections = nftCollections
    .filter(collection =>
      (collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filters.artists.length === 0 || filters.artists.includes(collection.artist)) &&
      (filters.networks.length === 0 || filters.networks.includes(collection.network))
    )
    .filter(collection => collectionDetails[collection.address] && collectionDetails[collection.address].availableSupply > 0); // Filter nach availableSupply

  if (loading) {
    return (
      <div className='loading-container flex centered column'>
        <img src="/loading.gif" alt="Loading..." className="loading-gif" />
        <h2 className="loading-message"></h2>
      </div>
    );
  }

  return (
    <div className='CollectionDiv'>
      <h2 className='text-align-left mt15 onlymedia'>FAIRMINT</h2>
      <div className='w95 space-between flex MediaGalleryDiv'>
        <div className='w20 ButtonandFilterMedia'>
          <CollectionFilter onFilterChange={setFilters} />
        </div>
        <div className='w95 column flex flex-start ml20 mlnull centered-media'>
          <h2 className='text-align-left mt15 OnlyDesktop'>FAIRMINT</h2>
          <div className='w30 w100media'>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
          {filteredCollections.length === 0 ? (
            <div className="no-nfts-container flex centered column">
              <h2 className="no-nfts-message">No collections found...</h2>
              <img src="/no-nft.png" alt="No collections" className="no-nfts-image" />
            </div>
          ) : (
            <div className={`collection-cards ${filteredCollections.length < 5 ? 'centered-cards' : ''}`}>
              {filteredCollections.map((collection, index) => (
                <a href={`/fairmint/${collection.address}`} key={index} className="collection-card">
                  <div className='collection-banner'>
                    <img src={collection.banner} alt={collection.name} />
                  </div>
                  <div className='w95 text-align-left'>
                    <h3 className='mb5'>{collection.name}</h3>
                    <span className='s18 grey'>{collection.artist}</span>
                    {collectionDetails[collection.address] && (
                      <>
                        <div className='center-ho w80 mt20'>
                          <div className='centered column'>
                            <div className='centered s20 text-uppercase'>
                              {collection.network}
                              <img src={collection.currency} alt="currency logo" className="currency-logo-coll" />
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

export default FairMintCollections;

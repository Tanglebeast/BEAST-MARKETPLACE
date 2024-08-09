import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllNFTs, initializeMarketplace, refreshData, getNFTDetails } from '../components/utils';
import SearchBar from '../components/SearchBar';
import { nftCollections } from '../NFTCollections';
import CollectionDetailCard from '../components/CollectionDetailCard';
import CollectionDetailFilter from '../components/CollectionDetailFilter';
import '../styles/CollectionDetail.css';

const AllNFTs = () => {
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [allNFTs, setAllNFTs] = useState([]);
  const [nftsForSale, setNftsForSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [priceFilter, setPriceFilter] = useState('none');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  useEffect(() => {
    if (account !== '') {
      initializeMarketplace(setMarketplace, async (marketplace) => await refreshData(marketplace, null, setNftsForSale, setAllNFTs, fetchAllNFTs));
    }
  }, [account]);

  useEffect(() => {
    const fetchNFTs = async () => {
      let allNFTs = [];
      for (const collection of nftCollections) {
        const nfts = await fetchAllNFTs(collection.address);
        allNFTs = [...allNFTs, ...nfts];
      }
      setAllNFTs(allNFTs);
      setLoading(false);
    };

    fetchNFTs();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (marketplace) {
        const updatedNftsForSale = await Promise.all(nftsForSale.map(async (nft) => {
          const details = await getNFTDetails(nft.contractAddress, nft.tokenId, marketplace);
          return { ...nft, ...details };
        }));
        setNftsForSale(updatedNftsForSale);
      }
    };

    fetchDetails();
  }, [marketplace, nftsForSale]);

  const getUniqueOwners = (nfts) => {
    const owners = nfts.map(nft => nft.owner.toLowerCase());
    return new Set(owners).size;
  };

  const getFloorPrice = (nfts) => {
    const prices = nfts.map(nft => parseFloat(nft.price)).filter(price => !isNaN(price));
    return prices.length > 0 ? Math.min(...prices) : '0';
  };

  const getFilteredNFTs = (nfts, priceFilter, availabilityFilter, searchQuery) => {
    let filteredNFTs = [...nfts];

    // Sort by price
    if (priceFilter === 'lowToHigh') {
      filteredNFTs.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (priceFilter === 'highToLow') {
      filteredNFTs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    // Filter by availability
    if (availabilityFilter === 'listed') {
      filteredNFTs = filteredNFTs.filter(nft => nftsForSale.some(forSale => forSale.tokenId === nft.tokenId && forSale.contractAddress === nft.contractAddress));
    } else if (availabilityFilter === 'myNFTs') {
      filteredNFTs = filteredNFTs.filter(nft => nft.owner.toLowerCase() === account.toLowerCase());
    }

    // Filter by search query
    if (searchQuery) {
      filteredNFTs = filteredNFTs.filter(nft => 
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.tokenId.toString().includes(searchQuery)
      );
    }

    return filteredNFTs;
  };

  const filteredNFTsForSale = getFilteredNFTs(nftsForSale, priceFilter, availabilityFilter, searchQuery);
  const filteredAllNFTs = getFilteredNFTs(allNFTs, priceFilter, availabilityFilter, searchQuery);

  return (
    <div className="all-nfts">
      <h2>All NFTs</h2>
      <div className="collection-stats">
        <div className='collection-stats-div'>
          <p>LIMITATION</p>
          {allNFTs.length}
        </div>
        <div className='splitter'></div>
        <div className='collection-stats-div'>
          <p>OWNERS</p>
          <div>{getUniqueOwners(allNFTs)}</div>
        </div>
        <div className='splitter'></div>
        <div className='collection-stats-div'>
          <p>FLOOR PRICE</p>
          <div className='floorpricediv'>
            <img src="/currency-icon.png" alt="Currency Icon" className="currency-icon" />{getFloorPrice(nftsForSale)}
          </div>
        </div>
      </div>
      
      <div className="nft-list">
        {loading ? (
          <div className="loading-container">
            <img src="/loading.gif" alt="Loading..." />
          </div>
        ) : (
          <>
          <div className='NFT-Collection-Div'>
            {filteredNFTsForSale.map(nft => (
              <Link key={nft.tokenId} to={`/collections/${nft.contractAddress}/${nft.tokenId}`} className="nft-card">
                <CollectionDetailCard nft={nft} account={account} currencyIcon="/currency-icon.png" />
              </Link>
            ))}
            {filteredAllNFTs.filter(nft => !nftsForSale.some(forSale => forSale.tokenId === nft.tokenId && forSale.contractAddress === nft.contractAddress)).map(nft => (
              <Link key={nft.tokenId} to={`/collections/${nft.contractAddress}/${nft.tokenId}`} className="nft-card">
                <CollectionDetailCard nft={nft} account={account} currencyIcon="/currency-icon.png" />
              </Link>
            ))}
            </div>
            <div className='SearchandFilterDiv'>
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <CollectionDetailFilter
                  priceFilter={priceFilter}
                  setPriceFilter={setPriceFilter}
                  availabilityFilter={availabilityFilter}
                  setAvailabilityFilter={setAvailabilityFilter}
                  filterVisible={filterVisible}
                  setFilterVisible={setFilterVisible}
                />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllNFTs;

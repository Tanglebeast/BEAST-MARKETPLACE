import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchAllNFTs,
  initializeMarketplace,
  refreshData,
  getUserName,
  getProfilePicture,
  getTokenIdsOfOwner
} from '../components/utils';
import { nftCollections } from '../NFTCollections';
import '../styles/MyNFTs.css';
import ShortenAddress from '../components/ShortenAddress';
import SearchBar from '../components/SearchBar';
import MyNFTsFilter from '../components/MyNFTsFilter';

const UserNFTs = () => {
  const [account, setAccount] = useState('');
  const [marketplace, setMarketplace] = useState(null);
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Unknown');
  const [profilePicture, setProfilePicture] = useState('/placeholder-PFP-black.png');
  const [bannerPicture, setBannerPicture] = useState('/placeholder-PFP-banner.png');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    availability: [],
    artist: [],
    artwork: []
  });
  const [ownedCollections, setOwnedCollections] = useState([]);
  const { walletAddress } = useParams();

  useEffect(() => {
    initializeMarketplace(setMarketplace, () => refreshData(marketplace, '', setAllNFTs, fetchAllNFTs));
  }, []);

  useEffect(() => {
    if (walletAddress) {
      setAccount(walletAddress.toLowerCase());
    }
    if (marketplace) {
      getUserName(walletAddress?.toLowerCase(), marketplace)
        .then(name => setUserName(name || 'Unknown'));

      getProfilePicture(walletAddress?.toLowerCase(), marketplace)
        .then(pictureUrl => {
          setProfilePicture(pictureUrl || '/placeholder-PFP-black.png');
          setBannerPicture(pictureUrl || '/placeholder-PFP-banner.png');
        });
    }
  }, [walletAddress, marketplace]);

  const fetchUserNFTs = async () => {
    try {
      let userNFTs = [];
      let ownedCollectionsSet = new Set();
      let seenNFTs = new Set(); // To track seen NFTs and avoid duplicates

      for (const collection of nftCollections) {
        const tokenIds = await getTokenIdsOfOwner(collection.address, account);
        console.log(`Token IDs for collection ${collection.address}:`, tokenIds);

        if (tokenIds.length > 0) {
          ownedCollectionsSet.add(collection.name);
        }

        const nfts = await Promise.all(tokenIds.map(tokenId => fetchAllNFTs(collection.address, marketplace)
          .then(nfts => nfts.find(nft => nft.tokenId === tokenId))
        ));

        nfts.forEach(nft => {
          if (nft && !seenNFTs.has(`${nft.contractAddress}-${nft.tokenId}`)) {
            seenNFTs.add(`${nft.contractAddress}-${nft.tokenId}`);
            userNFTs.push(nft);
          }
        });
      }

      setAllNFTs(userNFTs);
      setOwnedCollections(Array.from(ownedCollectionsSet));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching token IDs:', error);
    }
  };

  useEffect(() => {
    if (marketplace && account) {
      fetchUserNFTs();
    }
  }, [account, marketplace]);

  const getCollectionName = (address) => {
    const collection = nftCollections.find(col => col.address === address);
    return collection ? collection.name : 'Unknown Collection';
  };

  const filteredNFTs = allNFTs.filter(nft => {
    const matchesSearchQuery =
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCollectionName(nft.contractAddress).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAvailability = filters.availability.length === 0 || (
      (filters.availability.includes('LISTED') && nft.price > 0) ||
      (filters.availability.includes('NOT LISTED') && nft.price === 0)
    );

    const collection = nftCollections.find(col => col.address === nft.contractAddress);
    const matchesArtist = filters.artist.length === 0 || (collection && filters.artist.includes(collection.artist));
    const matchesArtwork = filters.artwork.length === 0 || (collection && filters.artwork.includes(collection.name));

    return matchesSearchQuery && matchesAvailability && matchesArtist && matchesArtwork;
  });

  return (
    <div className="my-nfts">
      {loading ? (
        <div className="loading-container flex centered column">
          <img src="/loading.gif" alt="Loading" className="loading-gif" />
        </div>
      ) : (
        <>
          <div className='ProfileBannerDiv'>
            <div className='ProfileBanner flex centered'>
              <img src={bannerPicture || '/placeholder-PFP-banner.png'} alt="Banner" />
            </div>
          </div>

          <div className='flex space-between w100 mt50 myNFTMainDivMedia'>
            
            <div className="profile-picture-section flex column mt5 onlymedia">
              <div className='flex center-ho'>
                <div className='ProfilePicture'>
                  <img className="profile-picture" src={profilePicture} alt={`${userName}'s profile`} />
                </div>
                <h2 className='mb5 mt5media'>{userName}</h2>
              </div>
              <span className='text-align-left grey mb15 mt5 s16'>{walletAddress}</span>
            </div>

            <div className='w20 ButtonandFilterMedia'>
              <MyNFTsFilter onFilterChange={setFilters} ownedCollections={ownedCollections} />
            </div>
            <div className='w80 flex column ml20 w100media'>
              <div className="profile-picture-section flex column mt5 OnlyDesktop">
                <div className='flex center-ho'>
                  <div className='ProfilePicture'>
                    <img className="profile-picture" src={profilePicture} alt={`${userName}'s profile`} />
                  </div>
                  <h2 className='mb5'>{userName}</h2>
                </div>
                <span className='text-align-left grey mb15 mt5 s16'>{walletAddress}</span>
              </div>
              <div className='w30 w100media'>
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              </div>
              <div className="nft-list-my">
                {filteredNFTs.length === 0 ? (
                  <div className="no-nfts-container flex centered column">
                    <h2 className="no-nfts-message">No NFTs found...</h2>
                    <img src="/no-nft.png" alt="No NFTs" className="no-nfts-image" />
                  </div>
                ) : (
                  filteredNFTs.map(nft => (
                    <div key={`${nft.contractAddress}-${nft.tokenId}`} className="user-nft-card">
                      <Link to={`/collections/${nft.contractAddress}/${nft.tokenId}`}>
                        <div className='my-nft-image'>
                          <img src={nft.image} alt={nft.name} />
                        </div>
                        <div className='text-align-left w95 pt12 My-nft-details-Div'>
                          <div>
                            <h3>{nft.name}</h3>
                            <div className='flex center-ho owner-note'>
                              <span>{getCollectionName(nft.contractAddress)}</span>
                            </div>
                            <div className='flex center-ho grey'>
                              <span className='mt5'>Position: {nft.position}</span>
                            </div>
                          </div>
                          <div>
                            {Number(nft.price) === 0 ? (
                              <p>NOT LISTED</p>
                            ) : (
                              <p className='my-nftListed'>LISTED</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserNFTs;

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchAllNFTs, initializeMarketplace, refreshData, getUserName, getProfilePicture } from '../components/utils';
import { nftCollections } from '../NFTCollections';
import '../styles/MyNFTs.css';
import ShortenAddress from '../components/ShortenAddress';

const UserNFTs = () => {
  const [account, setAccount] = useState('');
  const [marketplace, setMarketplace] = useState(null);
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Unknown'); // Default username to "USER"
  const [profilePicture, setProfilePicture] = useState('/placeholder-PFP-black.png'); // Default profile picture
  const [bannerPicture, setBannerPicture] = useState('/placeholder-PFP-banner.png'); // Default banner picture
  const { walletAddress } = useParams(); // Get walletAddress from URL params

  useEffect(() => {
    const savedAccount = localStorage.getItem('account');
    if (savedAccount) {
      setAccount(savedAccount);
      initializeMarketplace(setMarketplace, () => {
        refreshData(marketplace, '', setAllNFTs, fetchAllNFTs);
      });
    }
  }, []);

  useEffect(() => {
    // Update account state with walletAddress from URL params
    if (walletAddress) {
      setAccount(walletAddress.toLowerCase()); // Convert to lowercase for consistency
      // Fetch the username and profile picture for the given wallet address, but only if marketplace is initialized
      if (marketplace) {
        getUserName(walletAddress.toLowerCase(), marketplace)
          .then(name => {
            setUserName(name || 'Unknown');
          });

        getProfilePicture(walletAddress.toLowerCase(), marketplace)
          .then(pictureUrl => {
            setProfilePicture(pictureUrl || '/placeholder-PFP-black.png'); // Use /placeholder-PFP-black.png if no profile picture is set
            setBannerPicture(pictureUrl || '/placeholder-PFP-banner.png'); // Use /placeholder-Banner.png if no banner picture is set
          });
      }
    }
  }, [walletAddress, marketplace]);

  const fetchMyNFTs = async () => {
    let myNFTs = [];
    for (const collection of nftCollections) {
      const nfts = await fetchAllNFTs(collection.address, marketplace);
      myNFTs = myNFTs.concat(nfts.filter(nft => nft.owner.toLowerCase() === account));
    }
    setAllNFTs(myNFTs);
    setLoading(false);
  };

  useEffect(() => {
    if (account && marketplace) {
      fetchMyNFTs();
    }
  }, [account, marketplace]);

  const getCollectionName = (address) => {
    const collection = nftCollections.find(col => col.address === address);
    return collection ? collection.name : 'Unknown Collection';
  };

  return (
    <div className="my-nfts">
      <div className='ProfileBannerDiv'>
        <div className='ProfileBanner flex centered'>
          <img src={bannerPicture || "/placeholder-Banner.png"} alt="Banner" />
        </div>
      </div>
      <div className="profile-picture-section flex centered">
        <div className='ProfilePicture'>
          <img className="profile-picture" src={profilePicture} alt={`${userName}'s profile`} />
        </div>
        <h2 className='mb5'>{userName}</h2>
      </div>
      <p className='mb30'>{walletAddress}</p>
      {loading && <img className="loading-gif" src="/loading.gif" alt="Loading..." />}
      {!loading && allNFTs.length === 0 && (
        <p>No NFTs found for this account.</p>
      )}
      <div className="nft-list-my">
        {allNFTs.map(nft => (
          <div key={nft.tokenId} className="user-nft-card">
            <Link to={`/collections/${nft.contractAddress}/${nft.tokenId}`}>
              <div className='my-nft-image'>
                <img src={nft.image} alt={nft.name} />
              </div>
              <h3>{nft.name}</h3>

              <div className='flex center-ho'>
                <img className='w25 mr10' src='/artwork.png' alt='Artwork' />
                <p>{getCollectionName(nft.contractAddress)}</p>
              </div>

              <div className='flex center-ho'>
                <img className='w25 mr10' src='/id.png' alt='ID' />
                <p><ShortenAddress address={nft.tokenId.toString()} /></p>
              </div>

              {Number(nft.price) === 0 ? (
                <p>NOT LISTED</p>
              ) : (
                <p className='my-nftListed'>LISTED</p>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserNFTs;

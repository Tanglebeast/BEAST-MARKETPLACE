import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllNFTs, initializeMarketplace, refreshData, changeUserName, getUserName, getProfilePicture, setProfilePicture } from '../components/utils';
import { nftCollections } from '../NFTCollections';
import '../styles/MyNFTs.css';
import ShortenAddress from '../components/ShortenAddress';
import UsernamePopup from '../components/UsernamePopup';
import ProfilePicturePopup from '../components/ProfilePicturePopup';

const MyNFTs = () => {
  const [account, setAccount] = useState('');
  const [marketplace, setMarketplace] = useState(null);
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [profilePicture, setProfilePictureState] = useState('/placeholder-PFP-black.png'); // Default profile picture
  const [bannerPicture, setBannerPicture] = useState('/placeholder-PFP-banner.png'); // Default banner picture
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  useEffect(() => {
    const savedAccount = localStorage.getItem('account');
    if (savedAccount) {
      setAccount(savedAccount);
      initializeMarketplace(setMarketplace, () => refreshData(marketplace, savedAccount, setAllNFTs, fetchAllNFTs));
    }
  }, []);

  useEffect(() => {
    if (account && marketplace) {
      getUserName(account, marketplace).then(setUserName);
      getProfilePicture(account, marketplace).then(picture => {
        setProfilePictureState(picture || '/placeholder-PFP-black.png');
        setBannerPicture(picture || '/placeholder-PFP-banner.png'); // Update the banner picture if a profile picture is available
      });
    }
  }, [account, marketplace]);

  const fetchMyNFTs = async () => {
    let myNFTs = [];
    for (const collection of nftCollections) {
      const nfts = await fetchAllNFTs(collection.address, marketplace);
      myNFTs = myNFTs.concat(nfts.filter(nft => nft.owner.toLowerCase() === account.toLowerCase()));
    }
    setAllNFTs(myNFTs);
    setLoading(false);
  };

  useEffect(() => {
    if (account) {
      fetchMyNFTs();
    }
  }, [account, marketplace]);

  const handleChangeUserName = async () => {
    try {
      await changeUserName(account, newUserName, marketplace);
      setUserName(newUserName);
      setNewUserName('');
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Failed to change username:", error);
    }
  };

  const openUsernamePopup = () => {
    setIsPopupOpen(true);
  };

  const closeUsernamePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSetProfilePicture = async (contractAddress, tokenId, imageUrl) => {
    try {
      await setProfilePicture(account, contractAddress, tokenId, imageUrl, marketplace);
      setProfilePictureState(imageUrl);

      // If the banner picture should also be updated, set it here as well
      setBannerPicture(imageUrl);

      setIsProfilePopupOpen(false);
    } catch (error) {
      console.error("Failed to set profile picture:", error);
    }
  };

  const openProfilePicturePopup = () => {
    setIsProfilePopupOpen(true);
  };

  const closeProfilePicturePopup = () => {
    setIsProfilePopupOpen(false);
  };

  const getCollectionName = (address) => {
    const collection = nftCollections.find(col => col.address === address);
    return collection ? collection.name : 'Unknown Collection';
  };

  return (
    <div className="my-nfts">
      <div className='ProfileBannerDiv'>
        <div className='ProfileBanner flex centered'>
          <img src={bannerPicture || '/placeholder-PFP-banner.png'} alt="Banner" />
        </div>
      </div>
      <h2>MY ACCOUNT</h2>
      {!account && (
        <p className="error-message">Please connect your wallet to view your NFTs.</p>
      )}
      {account && loading && (
        <img className="loading-gif" src="/loading.gif" alt="Loading..." />
      )}
      {account && !loading && allNFTs.length === 0 && (
        <p>You don't own any NFTs.</p>
      )}
      {account && !loading && (
        <>
          <div className="user-name-section">
            <div className='UserData'>
              <div className='ProfilePicture'>
                <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
              </div>
              <h2>
                {userName ? userName : <ShortenAddress address={account} />}
              </h2>
            </div>
            <div className='flex column'>
              <button className='ChangeNamebutton' onClick={openUsernamePopup}>CHANGE USERNAME</button>
              <button className='ChangeProfilePicturebutton' onClick={openProfilePicturePopup}>CHANGE PROFILE PICTURE</button>
            </div>
          </div>
          <div className="nft-list-my">
            {allNFTs.map(nft => (
              <div key={nft.tokenId} className="my-nft-card">
                <Link to={`/collections/${nft.contractAddress}/${nft.tokenId}`}>
                  <div className='my-nft-image'>
                    <img src={nft.image} alt={nft.name} />
                  </div>
                  <h3>{nft.name}</h3>
                  <div className='flex center-ho'>
                    <img className='w25 mr10' src='/id.png' alt='ID' />
                    <p><ShortenAddress address={nft.tokenId.toString()} /></p>
                  </div>
                  <div className='flex center-ho'>
                    <img className='w25 mr10' src='/artwork.png' alt='Artwork' />
                    <p>{getCollectionName(nft.contractAddress)}</p>
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
        </>
      )}
      {isPopupOpen && (
        <UsernamePopup
          username={newUserName}
          setUsername={setNewUserName}
          handleSave={handleChangeUserName}
          closePopup={closeUsernamePopup}
        />
      )}
      {isProfilePopupOpen && (
        <ProfilePicturePopup
          nfts={allNFTs}
          handleSave={handleSetProfilePicture}
          closePopup={closeProfilePicturePopup}
        />
      )}
    </div>
  );
};

export default MyNFTs;

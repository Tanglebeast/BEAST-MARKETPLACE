import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllNFTs, initializeMarketplace, getArtistWalletsAndFees, CONTRACT_OWNER_ADDRESS, setArtistWallet, refreshData, changeUserName, getUserName, getProfilePicture, setProfilePicture, pauseContract, unpauseContract, isContractPaused } from '../components/utils';
import { nftCollections } from '../NFTCollections';
import '../styles/MyNFTs.css';
import ShortenAddress from '../components/ShortenAddress';
import UsernamePopup from '../components/UsernamePopup';
import ProfilePicturePopup from '../components/ProfilePicturePopup';
import SearchBar from '../components/SearchBar';
import MyNFTsFilter from '../components/MyNFTsFilter';
import SetArtistWalletPopup from '../components/SetartistWalletPopup';

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
  const [isArtistWalletPopupOpen, setIsArtistWalletPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isContractPausedState, setIsContractPausedState] = useState(false);
  const [filters, setFilters] = useState({
    availability: [], // e.g., ['LISTED', 'NOT LISTED']
    artist: [], // e.g., ['Tanglebeasts', 'Vyzor']
    artwork: [] // e.g., ['LAST MOMENT OF SOON MAN', 'LAST MEAL ON SHIMMER']
  });
  
  useEffect(() => {
    const checkContractPaused = async () => {
      if (marketplace) {
        const paused = await isContractPaused(marketplace);
        setIsContractPausedState(paused);
      }
    };
    checkContractPaused();
  }, [marketplace]);

  const handlePauseToggle = async () => {
    try {
      if (isContractPausedState) {
        await unpauseContract(account, marketplace);
      } else {
        await pauseContract(account, marketplace);
      }
      setIsContractPausedState(!isContractPausedState);
    } catch (error) {
      console.error("Failed to toggle pause state:", error);
    }
  };
  

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

  const openArtistWalletPopup = () => {
    setIsArtistWalletPopupOpen(true);
  };

  const closeArtistWalletPopup = () => {
    setIsArtistWalletPopupOpen(false);
  };

  const handleSetArtistWallet = async (contractAddress, artistWallet, artistFeePercent) => {
    try {
      if (!marketplace) throw new Error("Marketplace not initialized");
  
      await setArtistWallet(contractAddress, artistWallet, artistFeePercent, account, marketplace);
      
      console.log('Artist wallet and fee percentage set:', { contractAddress, artistWallet, artistFeePercent });
      closeArtistWalletPopup();
    } catch (error) {
      console.error("Failed to set artist wallet:", error);
    }
  };
  
  getArtistWalletsAndFees().then((data) => {
    console.log(data);
  }).catch((error) => {
    console.error('Error:', error);
  });
  

  // Filter NFTs based on filters state
  const filteredNFTs = allNFTs.filter(nft => {
    const matchesSearchQuery = 
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCollectionName(nft.contractAddress).toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by availability
    const matchesAvailability = filters.availability.length === 0 || (
      (filters.availability.includes('LISTED') && nft.price > 0) ||
      (filters.availability.includes('NOT LISTED') && nft.price === 0)
    );

    // Filter by artist
    const collection = nftCollections.find(col => col.address === nft.contractAddress);
    const matchesArtist = filters.artist.length === 0 || (collection && filters.artist.includes(collection.artist));

    // Filter by artwork
    const matchesArtwork = filters.artwork.length === 0 || (collection && filters.artwork.includes(collection.name));

    return matchesSearchQuery && matchesAvailability && matchesArtist && matchesArtwork;
  });

  return (
    <div className="my-nfts">
      <div className='ProfileBannerDiv'>
        <div className='ProfileBanner flex centered'>
          <img src={bannerPicture || '/placeholder-PFP-banner.png'} alt="Banner" />
        </div>
      </div>
      {!account && (
        <p className="error-message">Please connect your wallet to view your NFTs.</p>
      )}
      {account && loading && (
        <img className="loading-gif" src="/loading.gif" alt="Loading..." />
      )}
      {account && !loading && (
        <>


          <div className='flex space-between w100 mt50 myNFTMainDivMedia'>
  <div className='w20 ButtonandFilterMedia'>

  <div className='UserData onlymedia'>
              <div className='ProfilePicture'>
                <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
              </div>
              <h2>
                {userName ? userName : <ShortenAddress address={account} />}
              </h2>
            </div>
    
  <div className="user-name-section">
            
            <div className='flex column'>
              <button className='ChangeNamebutton' onClick={openUsernamePopup}>CHANGE USERNAME</button>
              <button className='ChangeProfilePicturebutton' onClick={openProfilePicturePopup}>CHANGE PROFILE PICTURE</button>
              {account.toLowerCase() === CONTRACT_OWNER_ADDRESS.toLowerCase() && (
                <>
                  <button className='SetArtistWalletButton' onClick={openArtistWalletPopup}>SET ARTIST WALLET</button>
                  <button className='PauseToggleButton alert-color' onClick={handlePauseToggle}>
                    {isContractPausedState ? 'UNPAUSE CONTRACT' : 'PAUSE CONTRACT'}
                  </button>
                </>
              )}


            </div>
          </div>

    <MyNFTsFilter onFilterChange={setFilters} />
  </div>
  <div className='w80 flex column ml20 w100media'>
  <div className='UserData OnlyDesktop'>
              <div className='ProfilePicture'>
                <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
              </div>
              <h2>
                {userName ? userName : <ShortenAddress address={account} />}
              </h2>
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
          <div key={nft.tokenId} className="my-nft-card">
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
       {isArtistWalletPopupOpen && (
        <SetArtistWalletPopup
          handleSave={handleSetArtistWallet}
          closePopup={closeArtistWalletPopup}
        />
      )}
    </div>
  );
};

export default MyNFTs;

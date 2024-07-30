import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/NFTDetail.css';
import ShortenAddress from '../components/ShortenAddress';
import {
  getNFTDetails,
  initializeMarketplace,
  buyNFT,
  listNFT,
  cancelListing,
  checkApproval,
  approveMarketplace,
  fetchAllNFTs,
  getUserName,
  checkNetwork,
  getProfilePicture // Importiere die getProfilePicture-Funktion
} from '../components/utils'; // Importiere die getUserName-Funktion
import { nftCollections } from '../NFTCollections';
import Web3 from 'web3';
import Popup from '../components/ListingPopup'; // Importieren der Popup-Komponente
import BlockExplorerLinks from '../components/BlockExplorerLinks';
import ArtworkDetails from '../components/ArtworkDetails';
import ArtworkOwnerRanking from '../components/ArtworkOwnerRanking';

const web3 = new Web3(window.ethereum);

const NFTDetail = () => {
  const { collectionaddress, tokenid } = useParams();
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [nftDetails, setNftDetails] = useState(null);
  const [isForSale, setIsForSale] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for Popup
  const [totalSupply, setTotalSupply] = useState(0);
  const [ownershipPercentage, setOwnershipPercentage] = useState(0);
  const [ownedNFTsCount, setOwnedNFTsCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false); // State for fullscreen
  const [ownerUsername, setOwnerUsername] = useState(''); // New state for owner username
  const [ownerProfilePicture, setOwnerProfilePicture] = useState('/owner.png'); // New state for owner profile picture

  const getExpectedChainId = () => {
    const collection = nftCollections.find(col => col.address.toLowerCase() === collectionaddress.toLowerCase());
    return collection ? collection.networkid : null;
};

useEffect(() => {
    const verifyNetwork = async () => {
      const expectedChainId = getExpectedChainId();
      if (!expectedChainId) {
        console.error('Collection not found');
        return;
      }
      try {
        await checkNetwork(expectedChainId);
        console.log('Correct network');
      } catch (error) {
        console.error(error.message);
        // Optionally, you can show an alert or pop-up to guide users
      }
    };
  
    verifyNetwork();
  }, [collectionaddress]);

  useEffect(() => {
    const fetchNFTData = async (marketplaceInstance) => {
      try {
        if (marketplaceInstance) {
          const details = await getNFTDetails(collectionaddress, tokenid, marketplaceInstance);
          setNftDetails(details);

          // Fetch total supply
          const allNFTs = await fetchAllNFTs(collectionaddress, marketplaceInstance);
          setTotalSupply(allNFTs.length);

          // Calculate ownership percentage
          const ownedNFTs = allNFTs.filter(nft => nft.owner.toLowerCase() === account.toLowerCase());
          const ownershipPercentage = (ownedNFTs.length / totalSupply) * 100;
          setOwnershipPercentage(ownershipPercentage);

          // Calculate owned NFTs count
          setOwnedNFTsCount(ownedNFTs.length);

          setIsForSale(parseFloat(details.price) > 0);

          // Fetch owner's username
          const username = await getUserName(details.owner, marketplaceInstance);
          setOwnerUsername(username || details.owner); // Fallback to address if username not available

          // Fetch owner's profile picture
          const profilePicture = await getProfilePicture(details.owner, marketplaceInstance);
          setOwnerProfilePicture(profilePicture || '/owner.png'); // Fallback to default image if profile picture not available

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
        setIsLoading(false);
      }
    };

    if (account !== '') {
      initializeMarketplace(setMarketplace, async (marketplace) => {
        await fetchNFTData(marketplace);
      });
    }
  }, [account, collectionaddress, tokenid, totalSupply]);

  useEffect(() => {
    if (marketplace) {
      refreshNFTData(marketplace);
    }
  }, [marketplace, collectionaddress, tokenid]);

  const refreshNFTData = async (marketplaceInstance) => {
    try {
      if (marketplaceInstance) {
        const details = await getNFTDetails(collectionaddress, tokenid, marketplaceInstance);
        setNftDetails(details);

        // Fetch total supply
        const allNFTs = await fetchAllNFTs(collectionaddress, marketplaceInstance);
        setTotalSupply(allNFTs.length);

        // Calculate ownership percentage
        const ownedNFTs = allNFTs.filter(nft => nft.owner.toLowerCase() === account.toLowerCase());
        const ownershipPercentage = (ownedNFTs.length / totalSupply) * 100;
        setOwnershipPercentage(ownershipPercentage);

        // Calculate owned NFTs count
        setOwnedNFTsCount(ownedNFTs.length);

        setIsForSale(parseFloat(details.price) > 0);

        // Fetch owner's username
        const username = await getUserName(details.owner, marketplaceInstance);
        setOwnerUsername(username || details.owner); // Fallback to address if username not available

        // Fetch owner's profile picture
        const profilePicture = await getProfilePicture(details.owner, marketplaceInstance);
        setOwnerProfilePicture(profilePicture || '/owner.png'); // Fallback to default image if profile picture not available

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    try {
      if (marketplace && account) {
        const index = await marketplace.methods.getNFTIndex(collectionaddress, tokenid).call();
        await buyNFT(index, web3.utils.toWei(nftDetails.price, 'ether'), account, marketplace, async () => {
          await refreshNFTData(marketplace);
        });
      }
    } catch (error) {
      console.error("Error buying NFT:", error);
      alert(`Failed to buy NFT: ${error.message}`);
    }
  };

  const handleList = async () => {
    try {
      if (marketplace && account) {
        const isApproved = await checkApproval(collectionaddress, account, marketplace);
        if (!isApproved) {
          await approveMarketplace(collectionaddress, tokenid, marketplace, setAccount);
        }
        await listNFT(collectionaddress, tokenid, listingPrice, account, marketplace, checkApproval, approveMarketplace, async () => {
          await refreshNFTData(marketplace);
        });
        setListingPrice('');
        setIsPopupOpen(false); // Close the popup after listing
      }
    } catch (error) {
      console.error("Error listing NFT:", error);
      alert(`Failed to list NFT: ${error.message}`);
    }
  };

  const handleCancelListing = async () => {
    try {
      if (marketplace && account) {
        const index = await marketplace.methods.getNFTIndex(collectionaddress, tokenid).call();
        await cancelListing(index, account, marketplace, async () => {
          await refreshNFTData(marketplace);
        });
      }
    } catch (error) {
      console.error("Error canceling listing:", error);
      alert(`Failed to cancel listing: ${error.message}`);
    }
  };

  const getCollectionDetails = (address) => {
    const collection = nftCollections.find(col => col.address === address);
    return collection ? { name: collection.name, link: `/collections/${address}`, artist: collection.artist, currency: collection.currency } : { name: 'Unknown Collection', link: '#', artist: 'Unknown Artist', currency: '' };
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <img src="/loading.gif" alt="Loading..." />
      </div>
    );
  }

  if (!nftDetails) {
    // Hier kannst du eine Nachricht oder ein Placeholder anzeigen, falls nftDetails nicht vorhanden sind
    return <div className="loading-container">
    <img src="/loading.gif" alt="Loading..." />
  </div>;
  }

  const collectionDetails = getCollectionDetails(collectionaddress);
  const slicePercentage = (1 / totalSupply) * 100;

  return (
    <div>
      <h2 className="nft-DetailDiv">DETAILS</h2>
      <div className="nft-detail">
        <img src={nftDetails.image} alt={nftDetails.name} onClick={() => setIsFullscreen(true)} />
        <div className="NFT-DetailDiv">
          <div>
            <h2 className='blue'>{nftDetails.name}</h2>

            <div className='flex center-ho'>
              <img className='w25 mr10' src='/artist.png' alt='Artist' />
              <p className='VisibleLink'>
                <Link to={`/artists/${collectionDetails.artist}`}>{collectionDetails.artist}</Link>
              </p>
            </div>

            <div className='flex center-ho'>
              <img className='w25 h25 mr10' src={ownerProfilePicture} alt='Owner' />
              <p className='VisibleLink'>
                <Link to={`/users/${nftDetails.owner}`}>{ownerUsername}</Link>
              </p>
            </div>

            <div className='flex center-ho'>
              <img className='w25 mr10' src='/id.png' alt='ID' />
              <p>{tokenid.toString()}</p>
            </div>

            <h3 className='blue mt10'>ARTWORK</h3>
            <p className='VisibleLink'>
              <Link to={collectionDetails.link}>{collectionDetails.name}</Link>
            </p>
            
            <div className="ownership-details centered space-between">
              <div>
                <p>Total Fractalz: {totalSupply}</p>
                <p>Your Fractalz: {ownedNFTsCount}</p>
              </div>
              <div>
                <p>1 Fractal = {slicePercentage.toFixed(2)}%</p>
                <p>Your ownership = {ownershipPercentage.toFixed(2)}%</p>
              </div>
            </div>
            <div className='PriceDiv'>
              {isForSale && (
                <img src={collectionDetails.currency} alt="Currency Icon" className="currency-icon" />
              )}
              {isForSale && (
                <p>
                  {nftDetails.price} 
                </p>
              )}
            </div>
          </div>

          <div className='BottomButtons'>
            {account.toLowerCase() === nftDetails.owner.toLowerCase() ? (
              !isForSale ? (
                <>
                  <button className="actionbutton" onClick={() => setIsPopupOpen(true)}>
                    LIST
                  </button>
                </>
              ) : (
                <button className="actionbutton" onClick={handleCancelListing}>
                  CANCEL LISTING
                </button>
              )
            ) : (
              isForSale ? (
                <button className="actionbutton" onClick={handleBuy}>
                  BUY
                </button>
              ) : (
                <p>NOT FOR SALE</p>
              )
            )}
            <BlockExplorerLinks />
          </div>
        </div>
        {isPopupOpen && (
          <Popup
            listingPrice={listingPrice}
            setListingPrice={setListingPrice}
            handleList={handleList}
            closePopup={() => setIsPopupOpen(false)}
          />
        )}
      </div>
      <div className='w100 centered column'>
        <ArtworkDetails />
        <ArtworkOwnerRanking collectionAddress={collectionaddress} marketplace={marketplace} />
      </div>
      {isFullscreen && (
        <div className="fullscreen-overlay" onClick={() => setIsFullscreen(false)}>
          <img src={nftDetails.image} alt={nftDetails.name} className="fullscreen-image" />
        </div>
      )}
    </div>
  );
};

export default NFTDetail;

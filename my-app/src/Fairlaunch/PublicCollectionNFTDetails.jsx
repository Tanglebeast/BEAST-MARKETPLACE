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
} from '../Fairlaunch/PublicSaleUtils';
import { nftCollections } from '../Fairlaunch/PublicSaleNFTCollections';
import Web3 from 'web3';
import Popup from '../components/ListingPopup'; // Importieren der Popup-Komponente
import BlockExplorerLinks from '../components/BlockExplorerLinks';
import ArtworkDetails from '../components/ArtworkDetails';

const web3 = new Web3(window.ethereum);

const PublicNFTDetail = () => {
  const { collectionaddress, tokenid } = useParams();
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [nftDetails, setNftDetails] = useState(null);
  const [isForSale, setIsForSale] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for Popup

  const refreshNFTData = async (marketplaceInstance) => {
    try {
      if (marketplaceInstance) {
        const details = await getNFTDetails(collectionaddress, tokenid, marketplaceInstance);
        console.log("NFT Details:", details);
        setNftDetails(details);
        setIsForSale(parseFloat(details.price) > 0);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account !== '') {
      initializeMarketplace(setMarketplace, async (marketplace) => {
        await refreshNFTData(marketplace);
      });
    }
  }, [account]);

  useEffect(() => {
    if (marketplace) {
      refreshNFTData(marketplace);
    }
  }, [marketplace, collectionaddress, tokenid]);

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

  const collectionDetails = getCollectionDetails(collectionaddress);

  return (
    <div>
      <h2 className="nft-DetailDiv">DETAILS</h2>
      <div className="nft-detail">
        <img src={nftDetails.image} alt={nftDetails.name} />
        <div className="NFT-DetailDiv">
          <h2>{nftDetails.name}</h2>
          <p className='VisibleLink'>
            Artist: <Link to={`/artists/${collectionDetails.artist}`}>{collectionDetails.artist}</Link>
          </p>
          <p className='VisibleLink'>
            Owner: <Link to={`/users/${nftDetails.owner}`}>{nftDetails.owner}</Link>
          </p>
          <p>Token ID: {tokenid.toString()}</p>
          <p className='VisibleLink'>
            Collection: <Link to={collectionDetails.link}>{collectionDetails.name}</Link>
          </p>
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
      <ArtworkDetails />
    </div>
  );
};

export default PublicNFTDetail;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/NFTDetail.css';
import { artistList } from '../ArtistList';
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
  getProfilePicture,
  connectWallet,
  getMaxSupply
} from '../components/utils';
import { nftCollections } from '../NFTCollections';
import Web3 from 'web3';
import Popup from '../components/ListingPopup';
import BlockExplorerLinks from '../components/BlockExplorerLinks';
import ArtworkDetails from '../components/ArtworkDetails';
import ArtworkOwnerRanking from '../components/ArtworkOwnerRanking';
import ShortenAddress from '../components/ShortenAddress';
import PriceHistory from '../components/PriceHistory';
// import NFTHistory from '../components/NFTHistory';

const web3 = new Web3(window.ethereum);

const NFTDetail = () => {
  const { collectionaddress, tokenid } = useParams();
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [nftDetails, setNftDetails] = useState(null);
  const [isForSale, setIsForSale] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [ownershipPercentage, setOwnershipPercentage] = useState(0);
  const [ownedNFTsCount, setOwnedNFTsCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerProfilePicture, setOwnerProfilePicture] = useState('/owner.png');
  

  useEffect(() => {
    const fetchNFTData = async (marketplaceInstance) => {
      try {
        if (marketplaceInstance) {
          const details = await getNFTDetails(collectionaddress, tokenid, marketplaceInstance);
          setNftDetails(details);

          const allNFTs = await fetchAllNFTs(collectionaddress, marketplaceInstance);
          setTotalSupply(allNFTs.length);

          const maxSupply = Number(await getMaxSupply(collectionaddress, marketplaceInstance));
console.log('Max Supply:', maxSupply);
setMaxSupply(maxSupply);

          const ownedNFTs = allNFTs.filter(nft => nft.owner.toLowerCase() === account.toLowerCase());
          const ownershipPercentage = maxSupply > 0 ? (ownedNFTs.length / maxSupply) * 100 : 0;

          setOwnershipPercentage(ownershipPercentage);

          setOwnedNFTsCount(ownedNFTs.length);

          setIsForSale(parseFloat(details.price) > 0);

          const username = await getUserName(details.owner, marketplaceInstance);
          setOwnerUsername(username || details.owner);

          const profilePicture = await getProfilePicture(details.owner, marketplaceInstance);
          setOwnerProfilePicture(profilePicture || '/owner.png');

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
        setIsLoading(false);
      }
    };

    initializeMarketplace(setMarketplace, async (marketplace) => {
      await fetchNFTData(marketplace);
    });
  }, [collectionaddress, tokenid, totalSupply]);

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

        const allNFTs = await fetchAllNFTs(collectionaddress, marketplaceInstance);
        setTotalSupply(allNFTs.length);

        const maxSupply = Number(await getMaxSupply(collectionaddress, marketplaceInstance));
setMaxSupply(maxSupply);



        const ownedNFTs = allNFTs.filter(nft => nft.owner.toLowerCase() === account.toLowerCase());
        const ownershipPercentage = maxSupply > 0 ? (ownedNFTs.length / maxSupply) * 100 : 0;

        setOwnershipPercentage(ownershipPercentage);

        setOwnedNFTsCount(ownedNFTs.length);

        setIsForSale(parseFloat(details.price) > 0);

        const username = await getUserName(details.owner, marketplaceInstance);
        setOwnerUsername(username || details.owner);

        const profilePicture = await getProfilePicture(details.owner, marketplaceInstance);
        setOwnerProfilePicture(profilePicture || '/owner.png');

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
        setIsPopupOpen(false);
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
    if (collection) {
        const artist = artistList.find(a => a.name === collection.artist);
        return {
            name: collection.name,
            link: `/collections/${address}`,
            artist: collection.artist,
            currency: collection.currency,
            artistpfp: artist ? artist.profilepicture : '/default-artist.png'
        };
    } else {
        return { name: 'Unknown Collection', link: '#', artist: 'Unknown Artist', currency: '', artistpfp: '/default-artist.png' };
    }
  };

  const handleConnectWallet = async () => {
    await connectWallet(setAccount);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <img src="/loading.gif" alt="Loading..." />
      </div>
    );
  }

  const collectionDetails = getCollectionDetails(collectionaddress);
  const slicePercentage = (1 / totalSupply) * 100;

  return (
    <div className='flex centered column'>
      <div className='w100 flex column centered hauto mt15'>
    <div className='w91 flex center-ho gap15 h700 mediacolumn2'>
    <div className='MainDetailDivMedia w80 h100'>
      <div className="nft-detail">
        <div className='flex'>
        <div className='flex column w100'>
        <h2 className='blue mt5 s28 text-align-left'>{nftDetails.name}</h2>

        <div className='flex flex-start mediacolumn'>
    <div className='w70'>
        <img src={nftDetails.image} alt={nftDetails.name} onClick={() => setIsFullscreen(true)} />
        </div>

        <div className='ml20'>

              <div className='flex column detailLink'>
                <span className='s16 grey'>COLLECTION</span>
                <span className='s18 blue bold mb10'><Link to={collectionDetails.link}>{collectionDetails.name}</Link></span>
              </div>

              <div className='flex column detailLink'>
                <span className='s16 grey'>ARTIST</span>
                <span className='s18 blue bold mb10'><Link to={`/artists/${collectionDetails.artist}`}>{collectionDetails.artist}</Link></span>
              </div>

              <div className='flex column'>
                <span className='s16 grey'>POSITION</span>
                <span className='s18 blue bold mb10'>{nftDetails.position}</span>
              </div>

              <div className='flex column'>
                <span className='s16 grey'>TOKEN-ID</span>
                <span className='s18 blue bold mb10'>#{tokenid.toString()}</span>
              </div>

              <div className='flex column'>
                <span className='s16 grey'>TOTAL SUPPLY</span>
                <span className='s18 blue bold mb10'>{maxSupply} NFTs</span>
              </div>

              <div className='flex column'>
                <span className='s16 grey'>YOUR OWNERSHIP</span>
                <span className='s18 blue bold mb5'>{ownedNFTsCount} NFTs / {totalSupply > 0 ? ownershipPercentage.toFixed(2) : '0.00'}%</span>
              </div>

        </div>
        </div>
        </div>
        </div>
        <div className="NFT-DetailDiv">
          <div className='flex column space-between h100'>


            <div className='mt20'>
              <div className='flex center-ho mb5'>


                  <div className='flex column mb10'>
                    <p className='grey margin-0 s16'>OWNER</p>
                    <div className='flex center-ho mt5'>
                      <img className='wh27 mr10 r50' src={ownerProfilePicture} alt='Owner' />
                      <p className='VisibleLink margin-0 s16 w100'>
                        <Link to={`/users/${nftDetails.owner}`}>{ownerUsername}</Link>
                      </p>
                    </div>
                  </div>


                
              </div>
            </div>

            <div className='BottomButtons'>
              <div className='w100'>
                <div className='PriceDiv'>
                  {isForSale && (
                    <div className='flex column'>
                    <span className='s16 grey mb0'>LISTING PRICE</span>
                    <div className='flex center-ho mb5'>
                    <img src={collectionDetails.currency} alt="Currency Icon" className="currency-icon" />
                    <p className='mt5 mb5'>
                      {nftDetails.price}
                    </p>
                    </div>
                    </div>
                  )}
                </div>

                {account ? (
                  account.toLowerCase() === nftDetails.owner.toLowerCase() ? (
                    !isForSale ? (
                      <>
                        <button className="actionbutton w60" onClick={() => setIsPopupOpen(true)}>
                          <h3 className='margin-0 s16'>LIST</h3>
                        </button>
                      </>
                    ) : (
                      <button className="actionbutton w60" onClick={handleCancelListing}>
                        <h3 className='margin-0 s16'>CANCEL LISTING</h3>
                      </button>
                    )
                  ) : (
                    isForSale ? (
                      <button className="actionbutton w60" onClick={handleBuy}>
                        <h3 className='margin-0 s16'>BUY</h3>
                      </button>
                    ) : (
                      <p>NOT FOR SALE</p>
                    )
                  )
                ) : (
                  <button className="actionbutton w60" onClick={handleConnectWallet}>
                    <h3 className='margin-0 s16'>CONNECT WALLET</h3>
                  </button>
                )}
              </div>
              <div className='w50 text-align-right'>
                <BlockExplorerLinks />
              </div>
            </div>
          </div>
        </div>
        </div>
        {isPopupOpen && (
          <Popup
            listingPrice={listingPrice}
            setListingPrice={setListingPrice}
            handleList={handleList}
            closePopup={() => setIsPopupOpen(false)}
            currency={collectionDetails.currency}
          />
        )}
      </div>
      <div className='w100 h100'>
      <PriceHistory contractAddress={collectionaddress} marketplace={marketplace} currencyIcon={collectionDetails.currency} network={collectionDetails.network}/>
      </div>
      </div>
      </div>

      <div className='w100 centered column'>
        <ArtworkDetails marketplace={marketplace} account={account}/>
        <ArtworkOwnerRanking collectionAddress={collectionaddress} marketplace={marketplace} />
        {/* <NFTHistory collectionAddress={collectionaddress} tokenId={tokenid} marketplace={marketplace} /> */}
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

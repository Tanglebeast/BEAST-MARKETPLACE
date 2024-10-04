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
  getMaxSupply,
  getOwnedNFTsCount
} from '../components/utils';
import { nftCollections } from '../NFTCollections';
import Web3 from 'web3';
import Popup from '../components/ListingPopup';
import BlockExplorerLinks from '../components/BlockExplorerLinks';
import ArtworkDetails from '../components/ArtworkDetails';
import ArtworkOwnerRanking from '../components/ArtworkOwnerRanking';
import ShortenAddress from '../components/ShortenAddress';
import PriceHistory from '../components/PriceHistory';
import BeastToIotaPrice from '../components/BeastToIotaPrice';
import NFTAttributesStats from '../components/NFTAttributesStats';

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
  const [currency, setCurrency] = useState(''); // currency definieren
  const [paymentToken, setPaymentToken] = useState(null);
  const [convertedIotaPrice, setConvertedIotaPrice] = useState(null);


  const closePopup = () => {
    setIsPopupOpen(false);
  };
  

  useEffect(() => {
    const fetchNFTData = async (marketplaceInstance) => {
      try {
        if (marketplaceInstance) {
          const details = await getNFTDetails(collectionaddress, tokenid, marketplaceInstance);
          setNftDetails(details);
  
          const maxSupply = Number(await getMaxSupply(collectionaddress, marketplaceInstance));
          setMaxSupply(maxSupply);
          setTotalSupply(maxSupply); // Direkt von Smart Contract abgerufen
  
          // Anzahl der vom Benutzer gehaltenen NFTs
          const ownedNFTsCount = await getOwnedNFTsCount(collectionaddress, account, marketplaceInstance);
          setOwnedNFTsCount(ownedNFTsCount);
  
          setOwnershipPercentage(maxSupply > 0 ? (ownedNFTsCount / maxSupply) * 100 : 0);
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
  }, [collectionaddress, tokenid, totalSupply]); // Korrekte Schließung der useEffect-Hook
  

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
  
        // Aktualisiere nur die für diesen NFT relevanten Daten
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
        const nftDetails = await marketplace.methods.getNFTDetails(collectionaddress, tokenid).call();
        console.log('NFT Details:', nftDetails);
  
        // Nur für ERC20-Token in Wei umrechnen
        let price = nftDetails.price;
        if (nftDetails.paymentToken !== "0x0000000000000000000000000000000000000000") {
          // price = web3.utils.toWei(nftDetails.price.toString(), 'ether');
        }
  
        await buyNFT(index, price, account, marketplace, nftDetails, async () => {
          await refreshNFTData(marketplace);
        });
      }
    } catch (error) {
      console.error("Error buying NFT:", error);
      // alert(`Failed to buy NFT: ${error.message}`);
    }
  };
  
  

  

  const handleList = async (paymentToken) => {
    try {
      console.log("handleList called with paymentToken:", paymentToken);
  
      if (marketplace && account) {
        console.log("Marketplace and account are valid.");
  
        // Überprüfe die Genehmigung
        const isApproved = await checkApproval(collectionaddress, account, marketplace);
        console.log("Approval status:", isApproved);
  
        // Genehmige den Marketplace, wenn erforderlich
        if (!isApproved) {
          console.log("Marketplace not approved, requesting approval...");
          const approvalTx = await approveMarketplace(collectionaddress, tokenid, marketplace, account);
          
          // Hier könnte man auf das Event warten, falls du sicherstellen willst, dass die Genehmigung vollständig abgeschlossen ist
          console.log("Marketplace approval transaction completed.");
        } else {
          console.log("Marketplace already approved.");
        }
  
        // Überprüfe, ob der listingPrice gültig ist
        if (!listingPrice || isNaN(listingPrice) || parseFloat(listingPrice) <= 0) {
          alert("Bitte einen gültigen Preis angeben.");
          console.log("Invalid listing price:", listingPrice);
          return;
        }
  
        // Logging aller relevanten Parameter ohne Umwandlung in Wei
        console.log("Listing NFT with parameters:", {
          contractAddress: collectionaddress,
          tokenId: tokenid,
          price: listingPrice, // Originalpreis verwenden
          paymentToken,
          account
        });
  
        // NFT auflisten (Originalpreis wird hier verwendet)
        const listTx = await listNFT(collectionaddress, tokenid, listingPrice, paymentToken, account, marketplace, refreshNFTData);
  
        // Warten Sie nicht auf die `wait()`-Methode
        console.log("NFT listed successfully:", listTx);
  
        setListingPrice('');
        setPaymentToken(null);
        setIsPopupOpen(false);
      } else {
        console.log("Marketplace or account is invalid.");
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
    const collection = nftCollections.find(col => col.address.toLowerCase() === address.toLowerCase());
    if (collection) {
      const artist = artistList.find(a => a.name === collection.artist);
      return {
        name: collection.name,
        link: `/collections/${address}`,
        artist: collection.artist,
        currency: collection.currency,
        artistpfp: artist ? artist.profilepicture : '/default-artist.png',
        category: collection.category // Kategorie hinzugefügt
      };
    } else {
      return { 
        name: 'Unknown Collection', 
        link: '#', 
        artist: 'Unknown Artist', 
        currency: '', 
        artistpfp: '/default-artist.png',
        category: 'Unbekannt' // Standardkategorie
      };
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
    <div className='w91 flex center-ho gap15 h750 mediacolumn2 baseline'>
    <div className='MainDetailDivMedia w80 h100'>
      <div className="nft-detail">
        <div className='flex'>
        <div className='flex column w100'>
        <h2 className='blue mt5 s28 text-align-left'>{nftDetails.name}</h2>

        <div className='flex flex-start mediacolumn'>
    <div className='h500px'>
        <img src={nftDetails.image} alt={nftDetails.name} onClick={() => setIsFullscreen(true)} />
        </div>

        <div className='ml20 nftdetailDivScroll'>

              <div className='flex column detailLink'>
                <span className='s16 grey'>COLLECTION</span>
                <span className='s18 blue bold mb10'><Link to={collectionDetails.link}>{collectionDetails.name}</Link></span>
              </div>

              <div className='flex column detailLink'>
                <span className='s16 grey'>PROJECT</span>
                <span className='s18 blue bold mb10'><Link to={`/projects/${collectionDetails.artist}`}>{collectionDetails.artist}</Link></span>
              </div>

              <div className='flex column'>
                <span className='s16 grey'>TOKEN-ID</span>
                <span className='s18 blue bold mb10'>#{tokenid.toString()}</span>
              </div>

              <div className='flex column'>
                  <span className='s16 grey'>TOTAL SUPPLY</span>
                  <span className='s18 blue bold mb10'>{maxSupply} NFTs</span>
                </div>

                {/* Neuer Abschnitt für Kategorien */}
                <div className='flex column'>
                  <span className='s16 grey'>CATEGORIES</span>
                  <span className='s18 blue bold mb10'>
                    {collectionDetails.category.split(',').map((cat, index) => (
                      <span
                      className='bold' 
                      key={index}>
                        {cat.trim()}
                        {index < collectionDetails.category.split(',').length - 1 && ', '}
                      </span>
                    ))}
                  </span>
                </div>


              {/* <div className='flex column'>
                <span className='s16 grey'>YOUR SUPPLY</span>
                <span className='s18 blue bold mb5'>{ownedNFTsCount} NFTs</span>
              </div> */}

<div className='flex column detailLink mt15'>
                <span className='s16 mb5'>DESCRIPTION</span>
                <span className='s18 grey'>{nftDetails.description}</span>
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

                        
                      {nftDetails.paymentToken !== '0x0000000000000000000000000000000000000000' ? (
              <>
                <img src="/currency-beast.webp" alt="ERC20 Currency Icon" className="currency-icon" />
                <p className='mt5 mb5'>{nftDetails.price} BEAST</p>
                <BeastToIotaPrice
                  listingPrice={parseFloat(nftDetails.price)}
                  onConversion={(convertedPrice) => {
                    console.log('Converted Price in IOTA:', convertedPrice);
                    setConvertedIotaPrice(convertedPrice);
                  }}
                />
                {convertedIotaPrice && (
                  <span className='mt5 mb5 ml10 grey s16'>
                    ( ≈{convertedIotaPrice} IOTA )
                  </span>
                )}
              </>
            ) : (
              <>
                <img src={collectionDetails.currency} alt="Currency Icon" className="currency-icon" />
                <p className='mt5 mb5'>{nftDetails.price} IOTA</p>
                {/* Zeige den IOTA-Preis nicht an */}
              </>
            )}

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
    closePopup={closePopup}
    currency={currency}
    paymentToken={paymentToken} // paymentToken übergeben
    setPaymentToken={setPaymentToken} // Setzen der Funktion übergeben
  />
)}

      </div>
      <div className='w70 h100'>
      {/* <PriceHistory contractAddress={collectionaddress} marketplace={marketplace} currencyIcon={collectionDetails.currency} network={collectionDetails.network}/> */}
      <NFTAttributesStats
                  attributes={nftDetails.attributes}
                  stats={nftDetails.stats}
                />
      </div>
      </div>
      </div>

      <div className='w100 centered column'>
        {/* <ArtworkDetails marketplace={marketplace} account={account}/> */}
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

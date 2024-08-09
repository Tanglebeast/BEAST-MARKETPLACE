import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicSaleCollectionDetailCard from './PublicSaleCollectionCard';
import { fetchAllNFTs, initializeMarketplace, refreshData, getNFTDetails, listAllNFTsForSale, checkApproval, approveMarketplace, checkNetwork } from '../Fairlaunch/PublicSaleUtils';
import Web3 from 'web3';
import { nftCollections } from '../NFTCollections'; // Import the collections
import '../styles/Fairlaunch.css';

const PublicCollectionNFTs = () => {
  const { collectionaddress } = useParams();
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [allNFTs, setAllNFTs] = useState([]);
  const [nftsForSale, setNftsForSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [currencyIcon, setCurrencyIcon] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [floorPrice, setFloorPrice] = useState('');
  const [hasAllNFTsOwned, setHasAllNFTsOwned] = useState(false);
  const [isMarketplaceApproved, setIsMarketplaceApproved] = useState(false);
  const web3 = new Web3(window.ethereum);

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
    if (account !== '') {
      initializeMarketplace(setMarketplace, async (marketplace) => {
        await refreshData(marketplace, collectionaddress, setNftsForSale, setAllNFTs, fetchAllNFTs);
        const isApproved = await checkApproval(collectionaddress, account, marketplace);
        setIsMarketplaceApproved(isApproved);
      });
    }
  }, [account, collectionaddress]);

  useEffect(() => {
    const fetchNFTs = async () => {
      const nfts = await fetchAllNFTs(collectionaddress);
      setAllNFTs(nfts);
      setLoading(false);

      const ownedNFTs = nfts.filter(nft => nft.owner.toLowerCase() === account.toLowerCase());
      setHasAllNFTsOwned(ownedNFTs.length === nfts.length);
    };

    if (collectionaddress) {
      fetchNFTs();
    }
  }, [account, collectionaddress]);

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

  useEffect(() => {
    const collection = nftCollections.find(c => c.address.toLowerCase() === collectionaddress.toLowerCase());
    if (collection) {
      setCollectionName(collection.name);
      setCollectionDescription(collection.description);
      setCurrencyIcon(collection.currency);
      setFloorPrice(collection.price);
    }
  }, [collectionaddress]);

  const getUniqueOwners = (nfts) => {
    const owners = nfts.map(nft => nft.owner.toLowerCase());
    return new Set(owners).size;
  };

  const buyRandomNFT = async () => {
    if (nftsForSale.length === 0) {
      alert("Keine NFTs zum Verkauf verfügbar.");
      return;
    }

    try {
      const randomIndex = Math.floor(Math.random() * nftsForSale.length);
      const nftToBuy = nftsForSale[randomIndex];

      console.log("Selected NFT to Buy:", nftToBuy);

      const index = await marketplace.methods.getNFTIndex(nftToBuy.contractAddress, nftToBuy.tokenId).call();
      const gasPrice = await web3.eth.getGasPrice();
      const ethAmount = web3.utils.toWei(nftToBuy.price, 'ether');
      const gasLimit = 300000;

      console.log("Gas Price:", gasPrice);
      console.log("ETH Amount:", ethAmount);

      const receipt = await marketplace.methods.buyNFT(index).send({
        from: account,
        value: ethAmount,
        gas: gasLimit,
        gasPrice: gasPrice
      });

      console.log("Transaction Receipt:", receipt);

      alert("NFT erfolgreich gekauft!");
      await refreshData(marketplace, collectionaddress, setNftsForSale, setAllNFTs, fetchAllNFTs);
    } catch (error) {
      console.error("Fehler beim Kauf des NFT:", error);
      alert("Fehler beim Kauf des NFT.");
    }
  };

  const listAllNFTs = async () => {
    try {
      if (!isMarketplaceApproved) {
        await approveMarketplace(collectionaddress, account, marketplace);
        setIsMarketplaceApproved(true);
      }

      const tokenIds = allNFTs.map(nft => nft.tokenId);
      const price = listingPrice;

      await listAllNFTsForSale(marketplace, collectionaddress, tokenIds, price, account);
      alert("All NFTs listed for sale successfully!");
      await refreshData(marketplace, collectionaddress, setNftsForSale, setAllNFTs, fetchAllNFTs);
    } catch (error) {
      console.error("Error listing all NFTs:", error);
      alert("Failed to list all NFTs.");
    }
  };

  return (
    <div className="collection-nfts">
      <h2>{collectionName}</h2>
      <p className='CollectionDescription'>{collectionDescription}</p>
      {/* Displaying collection stats */}
      <div className="collection-stats">
        <div className='collection-stats-div'>
          <p>SUPPLY</p>
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
            <img src={currencyIcon} alt="Currency Icon" className="currency-icon" />{floorPrice}
          </div>
        </div>
        <div className='splitter'></div>
        <div className='collection-stats-div'>
          <p>AVAILABLE</p>
          <div>{nftsForSale.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <img src="/loading.gif" alt="Loading..." />
        </div>
      ) : (
        <div className='w100 flex column centered'>
          {!hasAllNFTsOwned && (
            <div>
              <p>Du besitzt nicht alle NFTs dieser Kollektion.</p>
              <button onClick={buyRandomNFT} className="buy-random-button">BUY RANDOM NFT</button>
            </div>
          )}

          {hasAllNFTsOwned && (
            <div className="list-all-container">
              <input
                type="text"
                placeholder="LISTING PRICE"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                className="listing-price-input"
              />
              <button onClick={listAllNFTs} className="list-all-button">LIST ALL NFTS</button>
            </div>
          )}

          {hasAllNFTsOwned && (
            <div className="fairlaunch-nft-list">
              {allNFTs.map(nft => (
                <div key={nft.tokenId} className="nft-card">
                  <PublicSaleCollectionDetailCard nft={nft} account={account} currencyIcon={currencyIcon} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicCollectionNFTs;

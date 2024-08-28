// src/utils/index.js
import Web3 from 'web3';
import axios from 'axios';
import { nftCollections } from '../NFTCollections';
import { artistList } from '../ArtistList';
import nftMarketplaceAbi from '../ABI.json';
import React from 'react';
import ReactDOM from 'react-dom';
import CustomPopup from '../components/AlertPopup';
import NetworkSelectionPopup from '../components/NetworkSelectionPopup';
import { getRpcUrl, setNetwork } from './networkConfig';


const web3 = new Web3(window.ethereum);
export let web3OnlyRead = new Web3(getRpcUrl()); // Initialisieren mit der Standard-RPC-URL

const updateWeb3OnlyRead = () => {
  web3OnlyRead = new Web3(getRpcUrl());
};

// Update der RPC-URL bei Änderung des Netzwerks
window.addEventListener('storage', (event) => {
  if (event.key === 'selectedNetwork') {
    updateWeb3OnlyRead();
  }
});



export const checkAccountInLocalStorage = () => {
  const account = localStorage.getItem('account');
  if (account) {
    // console.log(`Connected ls Account: ${account}`);
  } else {
    // console.log('No Account connected ls.');
  }
};



export const CONTRACT_OWNER_ADDRESS = '0x2FEA5b277e4a11406664691ac4A5315e6912ddC1';

export const artistwalletAddresses = artistList.map(artist => artist.walletaddress);


// export const shimmerTestnet = {
//   chainId: '0x431',
//   chainName: 'Shimmer EVM Testnet',
//   rpcUrls: ['https://json-rpc.evm.testnet.shimmer.network'],
//   nativeCurrency: {
//     name: 'SMR',
//     symbol: 'SMR',
//     decimals: 18,
//   },
//   blockExplorerUrls: ['https://explorer.evm.shimmer.network'],
// };

export const iotaTestnet = {
  chainId: '0x433',
  chainName: 'IOTA EVM Testnet',
  rpcUrls: ['https://json-rpc.evm.testnet.iotaledger.net'],
  nativeCurrency: {
    name: 'IOTA',
    symbol: 'IOTA',
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer.evm.testnet.iotaledger.net'],
};

export const bnbchain = {
  chainId: '0x61',
  chainName: 'BNB Smart Chain Testnet',
  rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};

export const polygon = {
  chainId: '0x13882',
  chainName: 'Polygon Amoy Testnet',
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

export const ethereum = {
  chainId: '0xaa36a7',
  chainName: 'Ethereum Sepolia Testnet',
  rpcUrls: ['wss://sepolia.drpc.org'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

const showAlert = (message) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const closePopup = () => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  };

  ReactDOM.render(<CustomPopup message={message} onClose={closePopup} />, container);
};

const showNetworkSelectionPopup = (onSelectNetwork) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const closePopup = () => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  };

  ReactDOM.render(
    <NetworkSelectionPopup onClose={closePopup} onSelectNetwork={(network) => {
      onSelectNetwork(network);
      closePopup();
    }} />,
    container
  );
};

export const checkNetwork = async (expectedChainId) => {
  if (window.ethereum) {
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (currentChainId !== expectedChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            const chain = getChainById(expectedChainId);
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [chain],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  } else {
    console.error("Please install MetaMask!");
  }
};

const getChainById = (chainId) => {
  const chains = {
    // '0x431': shimmerTestnet,
    '0x433': iotaTestnet,
    '0x61': bnbchain,
    '0x13882': polygon,
    '0xaa36a7': ethereum,
  };
  return chains[chainId] || null;
};




const getNetworkConfig = (network) => {
  switch (network) {
    // case 'shimmerevm':
    //   return shimmerTestnet;
    case 'iotaevm':
      return iotaTestnet;
    case 'bnbchain':
      return bnbchain;
    case 'polygon':
      return polygon;
      case 'ethereum':
      return ethereum;
    default:
      throw new Error('Unknown network');
  }
};

// export const connectWallet = async (setAccount) => {
//   if (typeof window.ethereum !== 'undefined') {
//     try {
//       const selectedNetwork = localStorage.getItem('selectedNetwork');
//       if (!selectedNetwork) throw new Error('No network selected');

//       const networkConfig = getNetworkConfig(selectedNetwork);
//       const chainId = networkConfig.chainId;

//       await checkNetwork(chainId);

//       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//       if (!accounts.length) {
//         throw new Error('No accounts found');
//       }

//       setAccount(accounts[0]);
//       localStorage.setItem('account', accounts[0]);
//     } catch (error) {
//       showAlert(`Failed to connect wallet: ${error.message}`);
//     }
//   } else {
//     showAlert("Please install MetaMask!");
//   }
// };

export const connectWallet = async (setAccount) => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const selectedNetwork = localStorage.getItem('selectedNetwork');
      if (!selectedNetwork) throw new Error('No network selected');

      const networkConfig = getNetworkConfig(selectedNetwork);
      const chainId = networkConfig.chainId;

      await checkNetwork(chainId);

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts.length) {
        throw new Error('No accounts found');
      }

      setAccount(accounts[0]);
      localStorage.setItem('account', accounts[0]);

      // Seite neu laden
      window.location.reload();
    } catch (error) {
      showAlert(`Failed to connect wallet: ${error.message}`);
    }
  } else {
    showAlert("Please install MetaMask!");
  }
};


export const disconnectWallet = (setAccount, setIsConnected) => {
  localStorage.removeItem('account');
  setAccount('');
  setIsConnected(false);
};

export const initializeMarketplace = async (setMarketplace, refreshData) => {
  try {
    // Überprüfe, ob ein Account im lokalen Speicher vorhanden ist
    const account = localStorage.getItem('account');
    const web3Instance = account ? web3 : web3OnlyRead;

    // Logge, welche Web3-Instanz verwendet wird
    // console.log(`Using Web3 instance: ${account ? 'web3' : 'web3OnlyRead'}`);

    const networkId = await web3Instance.eth.net.getId();
    const marketplaceData = nftMarketplaceAbi.networks[networkId];
    if (marketplaceData) {
      const marketplace = new web3Instance.eth.Contract(nftMarketplaceAbi.abi, marketplaceData.address);
      setMarketplace(marketplace);
      await refreshData(marketplace);
    } else {
      showAlert('Marketplace contract not deployed to detected network.');
    }
  } catch (error) {
    console.error("Error initializing marketplace:", error);
    showAlert('Failed to initialize marketplace.');
  }
};



export const fetchAllNFTs = async (collectionAddress, marketplace) => {
  try {
    const selectedCollection = nftCollections.find(collection => collection.address.toLowerCase() === collectionAddress.toLowerCase());
    if (!selectedCollection) {
      console.log('Collection not found for address:', collectionAddress);
      return [];
    }

    const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, selectedCollection.address);
    const totalSupply = await contract.methods.MAX_SUPPLY().call();

    // console.log('Total supply of NFTs in collection:', totalSupply);

    // Funktion zum Abrufen der NFT-Daten
    const fetchNFTData = async (index) => {
      try {
        const tokenId = await contract.methods.tokenByIndex(index).call();
        const tokenURI = await contract.methods.tokenURI(tokenId).call();

        // Entferne den ersten Abschnitt der URI bis zum "/"
        const splitURI = tokenURI.split('/');
        const newURI = `https://ipfs.io/ipfs/${splitURI[splitURI.length - 2]}/${splitURI[splitURI.length - 1]}.json`;

        // Abrufen der JSON-Daten
        const response = await axios.get(newURI);
        const metadata = response.data;


        const owner = await contract.methods.ownerOf(tokenId).call();
        const uid = `${selectedCollection.address}-${tokenId}`;

        // Extract position from attributes
        const positionAttr = metadata.attributes.find(attr => attr.trait_type === 'position');
        const position = positionAttr ? positionAttr.value : '0-0'; // Default position if not found

        // Fetch price from marketplace
        const nftDetails = await getNFTDetails(selectedCollection.address, tokenId, marketplace);
        const priceInEther = nftDetails ? nftDetails.price : '0';

        return {
          uid: uid,
          contractAddress: selectedCollection.address,
          tokenId: tokenId,
          owner: owner,
          name: metadata.name,
          image: metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
          price: priceInEther,
          position: position,
        };
      } catch (error) {
        // console.error(`Error fetching NFT data for index ${index}:`, error);
        return null;
      }
    };

    // Paralleles Abrufen aller NFTs
    const allNFTsPromises = [];
    for (let i = 0; i < totalSupply; i++) {
      allNFTsPromises.push(fetchNFTData(i));
    }

    // Warten auf alle Promises
    let allNFTs = await Promise.all(allNFTsPromises);
    // Filtern Sie alle NFTs heraus, die null sind (aufgrund von Fehlern)
    allNFTs = allNFTs.filter(nft => nft !== null);

    // console.log('All NFTs fetched:', allNFTs);

    return allNFTs;
  } catch (error) {
    // console.error("Error fetching NFTs:", error);
    return [];
  }
};


export const getMaxSupply = async (collectionAddress) => {
  try {
    const selectedCollection = nftCollections.find(collection => collection.address.toLowerCase() === collectionAddress.toLowerCase());
    if (!selectedCollection) {
      console.log('Collection not found for address:', collectionAddress);
      return null;
    }

    const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, selectedCollection.address);
    const maxSupply = await contract.methods.MAX_SUPPLY().call();

    // console.log(`TOTAL SUPPLY IS EXACTLY ${maxSupply}`);

    return maxSupply;
  } catch (error) {
    console.error('Error fetching MAX_SUPPLY:', error);
    return null;
  }
};


export const getNFTDetails = async (contractAddress, tokenId, marketplace) => {
  try {
    const selectedCollection = nftCollections.find(collection => collection.address.toLowerCase() === contractAddress.toLowerCase());
    if (!selectedCollection) {
      console.log('Collection not found for address:', contractAddress);
      return null;
    }

    const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, contractAddress);
    const owner = await contract.methods.ownerOf(tokenId).call();
    const tokenURI = await contract.methods.tokenURI(tokenId).call();

    // Entferne den ersten Abschnitt der URI bis zum "/"
    const splitURI = tokenURI.split('/');
    const newURI = `https://ipfs.io/ipfs/${splitURI[splitURI.length - 2]}/${splitURI[splitURI.length - 1]}.json`;

    const metadataResponse = await axios.get(newURI);
    const metadata = metadataResponse.data;

    const nftDetails = await marketplace.methods.getNFTDetails(contractAddress, tokenId).call();
    const priceInEther = web3OnlyRead.utils.fromWei(nftDetails.price, 'ether');


    const positionAttr = metadata.attributes.find(attr => attr.trait_type === 'position');
    const position = positionAttr ? positionAttr.value : '0-0';

    return {
      contractAddress: contractAddress,
      tokenId: tokenId,
      owner: owner,
      name: metadata.name,
      image: metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      price: priceInEther,
      position: position,
    };
  } catch (error) {
    // console.error(`Error getting NFT details for tokenId ${tokenId}:`, error);
    return null;
  }
};



export const approveMarketplace = async (contractAddress, tokenId, marketplace, setAccount) => {
  try {
    const nftContract = new web3.eth.Contract(nftCollections[0].abi, contractAddress);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (!accounts || !accounts.length) {
      throw new Error('No accounts found');
    }

    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 300000;

    const tx = await nftContract.methods.setApprovalForAll(marketplace._address, true).send({
      from: accounts[0],
      gasPrice: gasPrice,
      gas: gasLimit,
    });

    showAlert("Marketplace approved successfully!");
    return tx;
  } catch (error) {
    showAlert(`Failed to approve marketplace: ${error.message}`);
    throw error;
  }
};

export const checkApproval = async (contractAddress, account, marketplace) => {
  const nftContract = new web3.eth.Contract(nftCollections[0].abi, contractAddress);
  return await nftContract.methods.isApprovedForAll(account, marketplace._address).call();
};


// Funktion zur Schätzung der Gasgebühren mit Sicherheitsaufschlag
const getGasEstimate = async (method, params, fromAddress) => {
  try {
    const gasEstimate = await method.estimateGas({ ...params, from: fromAddress });
    const gasPrice = await web3.eth.getGasPrice();
    
    // Konvertiere Gaspreis zu Zahlen und füge 15% Sicherheitsaufschlag hinzu
    const gasPriceInWei = parseFloat(gasPrice);
    const gasPriceWithMarkup = gasPriceInWei * 1.15; // 15% Aufschlag
    
    return { gasEstimate, gasPrice: gasPriceWithMarkup.toString() };
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
};




export const buyNFT = async (index, price, account, marketplace, refreshData) => {
  try {
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.buyNFT(index),
      { value: price },
      account
    );

    await marketplace.methods.buyNFT(index).send({ from: account, value: price, gas: gasEstimate, gasPrice: gasPrice });

    showAlert("NFT successfully purchased!");
    await refreshData(marketplace);
  } catch (error) {
    showAlert("Failed to buy NFT. Please try again.");
  }
};


export const listNFT = async (contractAddress, tokenId, price, account, marketplace, checkApproval, approveMarketplace, refreshData) => {
  try {
    const isApproved = await checkApproval(contractAddress, account, marketplace);
    if (!isApproved) {
      await approveMarketplace(contractAddress, tokenId, marketplace, account);
    }

    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.listNFT(contractAddress, tokenId, web3.utils.toWei(price, 'ether')),
      {},
      account
    );

    const tx = await marketplace.methods
      .listNFT(contractAddress, tokenId, web3.utils.toWei(price, 'ether'))
      .send({ from: account, gas: gasEstimate, gasPrice: gasPrice });

    showAlert("NFT listed successfully!");
    await refreshData(marketplace);
    return tx;
  } catch (error) {
    showAlert(`Failed to list NFT: ${error.message}`);
    throw error;
  }
};


export const cancelListing = async (index, account, marketplace, refreshData) => {
  try {
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.cancelListing(index),
      {},
      account
    );

    await marketplace.methods.cancelListing(index).send({ from: account, gas: gasEstimate, gasPrice: gasPrice });

    showAlert("Listing canceled successfully!");
    await refreshData(marketplace);
  } catch (error) {
    showAlert("Failed to cancel listing. Please try again.");
  }
};


export const refreshData = async (marketplaceInstance, collectionaddress, setNftsForSale, setAllNFTs, fetchAllNFTs) => {
  if (!marketplaceInstance) {
    return;
  }

  try {
    const nftsForSale = await marketplaceInstance.methods.getNFTsForSale().call();
    const allNFTs = await fetchAllNFTs(collectionaddress);

    const indexedAllNFTs = {};
    allNFTs.forEach(nft => {
      indexedAllNFTs[nft.uid.toString()] = nft;
    });

    const nftsForSaleWithMetadata = nftsForSale
      .filter(nft => nft.contractAddress.toLowerCase() === collectionaddress.toLowerCase())
      .map(async nft => {
        const uid = `${nft.contractAddress}-${nft.tokenId}`;
        const metadata = indexedAllNFTs[uid];

        const nftDetails = await getNFTDetails(nft.contractAddress, nft.tokenId, marketplaceInstance);
        const updatedNFT = {
          ...nft,
          uid: uid,
          name: metadata ? metadata.name : 'Unknown',
          image: metadata ? metadata.image : 'placeholder.png',
          owner: metadata ? metadata.owner : 'Unknown',
          price: nftDetails ? nftDetails.price : 'Unknown',
        };

        return updatedNFT;
      });

    Promise.all(nftsForSaleWithMetadata).then(updatedNFTs => {
      setNftsForSale(updatedNFTs);
      setAllNFTs(allNFTs);
    });
  } catch (error) {
    // Handle error if needed
  }
};

export const getCollectionDetails = async (collectionAddress) => {
  try {
    const marketplace = new web3OnlyRead.eth.Contract(nftMarketplaceAbi.abi, nftMarketplaceAbi.networks[await web3OnlyRead.eth.net.getId()].address);
    const nftsForSale = await marketplace.methods.getNFTsForSale().call();
    const collectionNFTs = nftsForSale.filter(nft => nft.contractAddress.toLowerCase() === collectionAddress.toLowerCase());

    if (collectionNFTs.length === 0) {
      return { floorPrice: '0', listedCount: 0 };
    }

    const floorPrice = Math.min(...collectionNFTs.map(nft => parseFloat(web3OnlyRead.utils.fromWei(nft.price, 'ether'))));
    return { floorPrice: floorPrice.toString(), listedCount: collectionNFTs.length };
  } catch (error) {
    console.error('Error fetching collection details:', error);
    return { floorPrice: '0', listedCount: '0' };
  }
};

// Funktion zum Ändern des Benutzernamens
export const changeUserName = async (account, newUserName, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.changeUserName(newUserName),
      {},
      account
    );

    await marketplace.methods.changeUserName(newUserName).send({ from: account, gas: gasEstimate, gasPrice: gasPrice });

    showAlert("Username changed successfully!");
  } catch (error) {
    showAlert(`Failed to change username: ${error.message}`);
  }
};


export const getUserName = async (account, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  return await marketplace.methods.userNames(account).call();
};

export const setProfilePicture = async (account, contractAddress, tokenId, imageUrl, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.setProfilePicture(contractAddress, tokenId, imageUrl),
      {},
      account
    );

    await marketplace.methods.setProfilePicture(contractAddress, tokenId, imageUrl).send({ from: account, gas: gasEstimate, gasPrice: gasPrice });

    showAlert("Profile picture changed successfully!");
  } catch (error) {
    showAlert(`Failed to change profile picture: ${error.message}`);
  }
};

export const getProfilePicture = async (account, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  return await marketplace.methods.getProfilePicture(account).call();
};


export const setArtistWallet = async (contractAddress, artistWallet, artistFeePercent, account, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.setArtistWallet(contractAddress, artistWallet, artistFeePercent),
      {},
      account
    );

    await marketplace.methods.setArtistWallet(contractAddress, artistWallet, artistFeePercent).send({
      from: account,
      gas: gasEstimate,
      gasPrice: gasPrice
    });

    showAlert("Artist wallet and fee percentage set successfully!");
  } catch (error) {
    showAlert(`Failed to set artist wallet: ${error.message}`);
    throw error;
  }
};


export const pauseContract = async (account, marketplace) => {
  try {
    // Berechne die Gas-Kosten für die Pause-Funktion
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.pause(),
      {},
      account
    );

    // Rufe die Pause-Funktion auf und sende die Transaktion
    await marketplace.methods.pause().send({
      from: account,
      gas: gasEstimate,
      gasPrice: gasPrice,
    });

    showAlert("Contract paused successfully!");
  } catch (error) {
    showAlert(`Failed to pause contract: ${error.message}`);
    throw error;
  }
};

export const unpauseContract = async (account, marketplace) => {
  try {
    // Berechne die Gas-Kosten für die Unpause-Funktion
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.unpause(),
      {},
      account
    );

    // Rufe die Unpause-Funktion auf und sende die Transaktion
    await marketplace.methods.unpause().send({
      from: account,
      gas: gasEstimate,
      gasPrice: gasPrice,
    });

    showAlert("Contract unpaused successfully!");
  } catch (error) {
    showAlert(`Failed to unpause contract: ${error.message}`);
    throw error;
  }
};


export const isContractPaused = async (marketplace) => {
  if (!marketplace) throw new Error("Marketplace contract not initialized");

  try {
    const paused = await marketplace.methods.paused().call();
    return paused;
  } catch (error) {
    console.error("Error checking if contract is paused:", error);
    throw error;
  }
};

export const getArtistWalletsAndFees = async () => {
  try {
    const networkId = await web3.eth.net.getId();
    const marketplaceData = nftMarketplaceAbi.networks[networkId];
    if (!marketplaceData) {
      throw new Error('Marketplace contract not deployed to detected network.');
    }

    const marketplace = new web3.eth.Contract(nftMarketplaceAbi.abi, marketplaceData.address);

    const artistData = await Promise.all(nftCollections.map(async (collection) => {
      const artistWallet = await marketplace.methods.collectionToArtistWallet(collection.address).call();
      const artistFee = await marketplace.methods.collectionToArtistFee(collection.address).call();
      return {
        collectionName: collection.name,
        collectionAddress: collection.address,  // Contract-Adresse der Kollektion hinzufügen
        artistWallet: artistWallet,
        artistFee: artistFee
      };
    }));

    console.log('Artist Data:', artistData);
    return artistData;

  } catch (error) {
    console.error('Error fetching artist wallets and fees:', error);
    throw error;
  }
};

export const getTokenIdsOfOwner = async (contractAddress, ownerAddress) => {
  try {
    // Finde das ausgewählte NFT-Contract
    const selectedCollection = nftCollections.find(collection => collection.address.toLowerCase() === contractAddress.toLowerCase());
    if (!selectedCollection) {
      console.log('Collection not found for address:', contractAddress);
      return [];
    }

    // Erstelle eine Instanz des Contracts
    const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, contractAddress);

    // Rufe die Token-IDs des Besitzers ab
    const tokenIds = await contract.methods.tokenIdsOfOwner(ownerAddress).call();

    console.log(`Token IDs for owner ${ownerAddress}:`, tokenIds);

    return tokenIds;
  } catch (error) {
    console.error(`Error fetching token IDs for owner ${ownerAddress}:`, error);
    return [];
  }
};


export const getLiveFloorPrice = async (collectionAddress, marketplace) => {
  try {
    if (!collectionAddress || !marketplace) {
      console.error("Collection address or marketplace is not provided");
      return 0;
    }

    const nftsForSale = await marketplace.methods.getNFTsForSale().call();
    let minPrice = Infinity;
    for (const nft of nftsForSale) {
      if (nft.contractAddress.toLowerCase() === collectionAddress.toLowerCase()) {
        const priceInEther = web3.utils.fromWei(nft.price, 'ether'); 
        const priceInFloat = parseFloat(priceInEther); 
        if (priceInFloat > 0 && priceInFloat < minPrice) {
          minPrice = priceInFloat;
        }
      }
    }

    return minPrice === Infinity ? 0 : minPrice;
  } catch (error) {
    console.error("Error fetching live floor price:", error);
    return 0;
  }
};








export const getAveragePriceInPeriod = async (contractAddress, startTime, endTime, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const averagePrice = await marketplace.methods.getAveragePriceInPeriod(contractAddress, startTime, endTime).call();
    console.log("Average Price:", averagePrice); // Debugging
    return web3.utils.fromWei(averagePrice, 'ether');
  } catch (error) {
    console.error("Error fetching average price in period:", error);
    throw error;
  }
};


export const getFloorPriceInPeriod = async (contractAddress, startTime, endTime, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const floorPrice = await marketplace.methods.getFloorPriceInPeriod(contractAddress, startTime, endTime).call();
    return web3.utils.fromWei(floorPrice, 'ether');
  } catch (error) {
    console.error("Error fetching floor price in period:", error);
    throw error;
  }
};

export const getTotalSalesInPeriod = async (contractAddress, startTime, endTime, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const totalSales = await marketplace.methods.getTotalSalesInPeriod(contractAddress, startTime, endTime).call();
    return Number(totalSales);
  } catch (error) {
    console.error("Error fetching total sales in period:", error);
    throw error;
  }
};

export const updatePriceHistory = async (contractAddress, price, account, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.updatePriceHistory(contractAddress, web3.utils.toWei(price, 'ether')),
      {},
      account
    );

    await marketplace.methods.updatePriceHistory(contractAddress, web3.utils.toWei(price, 'ether')).send({
      from: account,
      gas: gasEstimate,
      gasPrice: gasPrice
    });

    console.log("Price history updated successfully");
  } catch (error) {
    console.error("Error updating price history:", error);
    throw error;
  }
};

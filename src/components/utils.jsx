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
      // Überprüfen, ob ein Netzwerk im lokalen Speicher vorhanden ist
      let selectedNetwork = localStorage.getItem('selectedNetwork');
      
      // Wenn kein Netzwerk gespeichert ist, setze das Standardnetzwerk auf IOTA Testnet
      if (!selectedNetwork) {
        selectedNetwork = 'iotaevm'; // oder was auch immer dein Bezeichner ist
        localStorage.setItem('selectedNetwork', selectedNetwork);
      }

      const networkConfig = getNetworkConfig(selectedNetwork);
      const chainId = networkConfig.chainId;

      console.log('Connected Chain ID:', chainId);

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



/**
 * Bereinigt die gegebene URI, indem doppelte Schrägstriche (//) durch einen einfachen Schrägstrich (/) ersetzt werden,
 * außer wenn die URI mit "ipfs://" beginnt.
 * 
 * @param {string} uri - Die zu bereinigende URI.
 * @returns {string} - Die bereinigte URI.
 */
const sanitizeURI = (uri) => {
  if (uri.startsWith('ipfs://')) {
    // Teile die URI nach dem Protokoll
    const parts = uri.split('ipfs://');
    if (parts.length > 1) {
      // Ersetze doppelte Schrägstriche im Pfadteil
      const sanitizedPath = parts[1].replace(/\/\//g, '/');
      return `ipfs://${sanitizedPath}`;
    }
    return uri;
  } else {
    // Ersetze alle doppelten Schrägstriche durch einen einfachen Schrägstrich
    return uri.replace(/\/\//g, '/');
  }
};




// 1. Definieren Sie die Liste der speziellen Contract-Adressen in Kleinbuchstaben
const specialContracts = [
  "0xa05135cc395b8e60aebe418594b2551b3b943960",
  "0xa05135cc395b8e60adad418584b2551b3b942220",
  "0xa05135ca120p8e60aehE091594b2551b3b943960" // Bitte überprüfen Sie diese Adresse auf Richtigkeit
].map(addr => addr.toLowerCase());

// 2. Hilfsfunktion zur Überprüfung, ob eine Adresse speziell ist
const isSpecialContract = (address) => {
  return specialContracts.includes(address.toLowerCase());
};




export const fetchAllNFTs = async (collectionAddress, marketplace, startIndex = 0, limit = Infinity) => {
  try {
    const selectedCollection = nftCollections.find(collection => collection.address.toLowerCase() === collectionAddress.toLowerCase());
    if (!selectedCollection) {
      console.log('Collection not found for address:', collectionAddress);
      return [];
    }

    const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, selectedCollection.address);
    const totalSupply = await contract.methods.MAX_SUPPLY().call();

    // Funktion zum Abrufen der NFT-Daten
    const fetchNFTData = async (index) => {
      try {
        const tokenId = await contract.methods.tokenByIndex(index).call();
        let tokenURI = await contract.methods.tokenURI(tokenId).call();

        // Log the original tokenURI
        console.log(`Original tokenURI for tokenId ${tokenId}:`, tokenURI);

        // Split the tokenURI to create a new URI
        const splitURI = tokenURI.split('/');
        let newURI = `https://ipfs.io/ipfs/${splitURI[splitURI.length - 2]}/${splitURI[splitURI.length - 1]}`;

        // Spezielle Behandlung für bestimmte Contract-Adressen
        if (isSpecialContract(collectionAddress)) {
          // Entferne das .json Suffix, falls vorhanden
          if (newURI.endsWith('.json')) {
            newURI = newURI.slice(0, -5);
          }
        } else {
          // Füge .json hinzu, falls es nicht ein spezieller Contract ist
          newURI += '.json';
        }

        // Entferne doppelte Schrägstriche aus der URI
        newURI = newURI.replace(/([^:]\/)\/+/g, "$1");

        // Log the processed newURI
        console.log(`Processed tokenURI for tokenId ${tokenId}:`, newURI);

        // Abrufen der JSON-Daten
        const response = await axios.get(newURI);
        const metadata = response.data;

        console.log(`Metadata for tokenId ${tokenId}:`, metadata);

        const owner = await contract.methods.ownerOf(tokenId).call();
        const uid = `${selectedCollection.address}-${tokenId}`;

        // Sicherstellen, dass attributes ein Array ist
        const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];

        // Extract position from attributes
        const positionAttr = attributes.find(attr => attr.trait_type === 'position');
        const position = positionAttr ? positionAttr.value : '0-0'; // Default position if not found

        // Fetch price from marketplace
        const nftDetails = await getNFTDetails(selectedCollection.address, tokenId, marketplace);
        const priceInEther = nftDetails ? nftDetails.price : '0';

        // Logik für die Bilddarstellung
        let imageUri = metadata.image;

        // Zusätzliche Überprüfung und Loggen der imageUri
        if (!imageUri) {
          console.error(`No imageUri found in metadata for tokenId ${tokenId}`);
        }

        // Log the original imageUri
        console.log(`Original imageUri for tokenId ${tokenId}:`, imageUri);

        if (imageUri && !imageUri.startsWith('ipfs://') && !imageUri.startsWith('https://ipfs.io/ipfs/')) {
          imageUri = `https://ipfs.io/ipfs/${imageUri}`;
        } else if (imageUri && imageUri.startsWith('ipfs://')) {
          imageUri = imageUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        // Entferne doppelte Schrägstriche aus der imageUri
        imageUri = imageUri.replace(/([^:]\/)\/+/g, "$1");

        // Log the processed imageUri
        console.log(`Processed imageUri for tokenId ${tokenId}:`, imageUri);

        // Sicherstellen, dass paymentToken vorhanden ist
        const paymentToken = nftDetails?.paymentToken || 'N/A'; // Standardwert, falls paymentToken fehlt

        return {
          uid: uid,
          contractAddress: selectedCollection.address.toLowerCase(),
          tokenId: tokenId.toString(), // Sicherstellen, dass tokenId als String behandelt wird
          owner: owner.toLowerCase(),
          name: metadata.name,
          description: metadata.description || 'No description available',
          image: imageUri || 'https://via.placeholder.com/150', // Fallback-Bild, falls kein Bild verfügbar ist
          price: priceInEther,
          position: position,
          attributes: attributes, // Verwende das gesicherte attributes Array
          stats: metadata.stats,
          paymentToken: paymentToken, // Füge paymentToken hier hinzu
        };
      } catch (error) {
        console.error(`Error fetching NFT data for index ${index}:`, error);
        return null;
      }
    };

    const endIndex = Math.min(parseInt(totalSupply), startIndex + limit);

    // Anzahl der gleichzeitigen Anfragen begrenzen
    const concurrencyLimit = 10; // Sie können diesen Wert anpassen
    let allNFTs = [];

    for (let i = startIndex; i < endIndex; i += concurrencyLimit) {
      const batchPromises = [];
      for (let j = i; j < i + concurrencyLimit && j < endIndex; j++) {
        batchPromises.push(fetchNFTData(j));
      }
      const batchResults = await Promise.all(batchPromises);
      allNFTs = allNFTs.concat(batchResults.filter(nft => nft !== null)); // Entfernt null-Einträge
    }

    console.log(`Fetched ${allNFTs.length} NFTs from collection ${collectionAddress}`);

    return allNFTs;
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
};







// Neue Funktion zum Abrufen eines einzelnen NFT basierend auf tokenId
export const fetchSingleNFT = async (collectionAddress, marketplace, tokenId) => {
  try {
    console.log(`Fetching single NFT for Collection: ${collectionAddress}, Token ID: ${tokenId}`);

    const selectedCollection = nftCollections.find(
      collection => collection.address.toLowerCase() === collectionAddress.toLowerCase()
    );
    if (!selectedCollection) {
      console.log('Collection not found for address:', collectionAddress);
      return null;
    }

    const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, selectedCollection.address);

    let tokenURI = await contract.methods.tokenURI(tokenId).call();

    // Split the tokenURI to create a new URI
    const splitURI = tokenURI.split('/');
    let newURI = `https://ipfs.io/ipfs/${splitURI[splitURI.length - 2]}/${splitURI[splitURI.length - 1]}`;

    // Spezielle Behandlung für bestimmte Contract-Adressen
    if (isSpecialContract(collectionAddress)) {
      // Entferne das .json Suffix, falls vorhanden
      if (newURI.endsWith('.json')) {
        newURI = newURI.slice(0, -5);
      }
    } else {
      // Füge .json hinzu, falls es nicht ein spezieller Contract ist
      newURI += '.json';
    }

    // Entferne doppelte Schrägstriche aus der URI
    newURI = newURI.replace(/([^:]\/)\/+/g, "$1");

    // Abrufen der JSON-Daten
    const response = await axios.get(newURI);
    const metadata = response.data;

    const owner = await contract.methods.ownerOf(tokenId).call();
    const uid = `${selectedCollection.address}-${tokenId}`;

    // Sicherstellen, dass attributes ein Array ist
    const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];

    // Extraktion der Position aus dem gesicherten attributes Array
    const positionAttr = attributes.find(attr => attr.trait_type === 'position');
    const position = positionAttr ? positionAttr.value : '0-0'; // Default position if not found

    // Fetch price from marketplace
    const nftDetails = await getNFTDetails(selectedCollection.address, tokenId, marketplace);
    const priceInEther = nftDetails ? nftDetails.price : '0';

    // Überprüfen und Formatierung der image URI anpassen
    let imageUri = metadata.image;
    if (imageUri) {
      if (imageUri.startsWith('ipfs://')) {
        imageUri = imageUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      } else if (!imageUri.startsWith('https://ipfs.io/ipfs/')) {
        imageUri = `https://ipfs.io/ipfs/${imageUri}`;
      }
      // Entferne doppelte Schrägstriche aus der imageUri
      imageUri = imageUri.replace(/([^:]\/)\/+/g, "$1");
    } else {
      console.error(`No imageUri found in metadata for tokenId ${tokenId}`);
      imageUri = 'https://via.placeholder.com/150'; // Fallback-Bild, falls kein Bild verfügbar ist
    }

    const structuredNFT = {
      uid: uid,
      contractAddress: selectedCollection.address.toLowerCase(),
      tokenId: tokenId.toString(), // Sicherstellen, dass tokenId als String behandelt wird
      owner: owner.toLowerCase(),
      name: metadata.name,
      description: metadata.description || 'No description available',
      image: imageUri,
      price: priceInEther,
      position: position,
      attributes: attributes, // Verwende das gesicherte attributes Array
      stats: metadata.stats || {}, // Sicherstellen, dass stats vorhanden ist, sonst leeres Objekt
      paymentToken: nftDetails?.paymentToken || 'N/A', // Füge paymentToken hier hinzu mit Fallback
    };

    console.log('Fetched Single NFT Data:', structuredNFT);

    return structuredNFT;
  } catch (error) {
    console.error(`Error fetching single NFT for tokenId ${tokenId} in collection ${collectionAddress}:`, error);
    return null;
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
    const selectedCollection = nftCollections.find(
      (collection) => collection.address.toLowerCase() === contractAddress.toLowerCase()
    );
    if (!selectedCollection) {
      console.log('Collection not found for address:', contractAddress);
      return null;
    }

    const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, contractAddress);
    const owner = await contract.methods.ownerOf(tokenId).call();
    let tokenURI = await contract.methods.tokenURI(tokenId).call();

    // Bereinigen der tokenURI
    const splitURI = tokenURI.split('/');
    let newURI = `https://ipfs.io/ipfs/${splitURI[splitURI.length - 2]}/${splitURI[splitURI.length - 1]}`;

    // Spezielle Behandlung für bestimmte Contract-Adressen
    if (isSpecialContract(contractAddress)) {
      // Entferne das .json Suffix, falls vorhanden
      if (newURI.endsWith('.json')) {
        newURI = newURI.slice(0, -5);
      }
    } else {
      // Füge .json hinzu, falls es nicht ein spezieller Contract ist
      newURI += '.json';
    }

    // Entferne doppelte Schrägstriche aus der URI
    newURI = newURI.replace(/([^:]\/)\/+/g, "$1");

    // Abrufen der Metadaten
    const metadataResponse = await axios.get(newURI);
    const metadata = metadataResponse.data;

    // Sicherstellen, dass attributes ein Array ist
    const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];

    // Überprüfen und Formatierung der image URI anpassen
    let imageURI = metadata.image;
    if (imageURI.startsWith('ipfs://')) {
      imageURI = imageURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else if (!imageURI.startsWith('https://ipfs.io/ipfs/')) {
      imageURI = `https://ipfs.io/ipfs/${imageURI}`;
    }

    // Entferne doppelte Schrägstriche aus der imageURI
    imageURI = imageURI.replace(/([^:]\/)\/+/g, "$1");

    // Abrufen der NFT-Details vom Marktplatz
    const nftDetails = await marketplace.methods.getNFTDetails(contractAddress, tokenId).call();
    const priceInEther = web3OnlyRead.utils.fromWei(nftDetails.price, 'ether');

    // Extraktion der Position aus dem gesicherten attributes Array
    const positionAttr = attributes.find(attr => attr.trait_type === 'position');
    const position = positionAttr ? positionAttr.value : '0-0';

    return {
      contractAddress: contractAddress,
      tokenId: tokenId,
      owner: owner.toLowerCase(),
      name: metadata.name,
      description: metadata.description || 'No description available',
      image: imageURI || 'https://via.placeholder.com/150', // Fallback-Bild, falls kein Bild verfügbar ist
      price: priceInEther,
      position: position,
      attributes: attributes, // Verwende das gesicherte attributes Array
      stats: metadata.stats || {}, // Sicherstellen, dass stats vorhanden ist, sonst leeres Objekt
      paymentToken: nftDetails.paymentToken || 'N/A', // Füge paymentToken hier hinzu mit Fallback
    };
  } catch (error) {
    console.error(`Error getting NFT details for tokenId ${tokenId}:`, error);
    return null;
  }
};





export const getOwnedNFTsCount = async (collectionAddress, account, marketplace) => {
  try {
    const selectedCollection = nftCollections.find(collection => collection.address.toLowerCase() === collectionAddress.toLowerCase());
    if (!selectedCollection) {
      console.log('Collection not found for address:', collectionAddress);
      return 0;
    }

    const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, collectionAddress);
    const balance = await contract.methods.balanceOf(account).call();
    return parseInt(balance, 10);
  } catch (error) {
    console.error('Error fetching owned NFTs count:', error);
    return 0;
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
export const getGasEstimate = async (method, params, fromAddress) => {
  try {
    // Versuche, die Gasabschätzung mit der Methode durchzuführen
    const gasEstimate = await method.estimateGas({ ...params, from: fromAddress });
    const gasPrice = await web3.eth.getGasPrice();
    
    // Konvertiere Gaspreis zu einer Zahl und füge 15% Sicherheitsaufschlag hinzu
    const gasPriceInWei = parseFloat(gasPrice);
    const gasPriceWithMarkup = gasPriceInWei * 1.15; // 15% Aufschlag
    
    return { gasEstimate, gasPrice: gasPriceWithMarkup.toString() };
  } catch (error) {
    console.error('Error estimating gas:', error);
    
    try {
      // Hole den aktuellen Gaspreis, auch wenn die ursprüngliche Abschätzung fehlgeschlagen ist
      const gasPrice = await web3.eth.getGasPrice();
      const gasPriceInWei = parseFloat(gasPrice);
      const gasPriceWithMarkup = gasPriceInWei * 1.15; // 15% Aufschlag
      
      // Verwende einen manuellen Gasbetrag von 3000
      const manualGasEstimate = 300000;
      
      return { gasEstimate: manualGasEstimate, gasPrice: gasPriceWithMarkup.toString() };
    } catch (innerError) {
      console.error('Error fetching gas price for manual estimate:', innerError);
      throw innerError; // Optional: Du kannst hier auch einen spezifischen Fehler werfen
    }
  }
};



const ERC20_ADDRESS = '0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15';
const ERC20_ABI = [ { "inputs": [ { "internalType": "address", "name": "initialOwner", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "ECDSAInvalidSignature", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "length", "type": "uint256" } ], "name": "ECDSAInvalidSignatureLength", "type": "error" }, { "inputs": [ { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "ECDSAInvalidSignatureS", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "allowance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientAllowance", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientBalance", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "approver", "type": "address" } ], "name": "ERC20InvalidApprover", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "receiver", "type": "address" } ], "name": "ERC20InvalidReceiver", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" } ], "name": "ERC20InvalidSender", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" } ], "name": "ERC20InvalidSpender", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "deadline", "type": "uint256" } ], "name": "ERC2612ExpiredSignature", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "signer", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" } ], "name": "ERC2612InvalidSigner", "type": "error" }, { "inputs": [], "name": "EnforcedPause", "type": "error" }, { "inputs": [], "name": "ExpectedPause", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "currentNonce", "type": "uint256" } ], "name": "InvalidAccountNonce", "type": "error" }, { "inputs": [], "name": "InvalidShortString", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [ { "internalType": "string", "name": "str", "type": "string" } ], "name": "StringTooLong", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [], "name": "EIP712DomainChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Unpaused", "type": "event" }, { "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MINT_AMOUNT", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "eip712Domain", "outputs": [ { "internalType": "bytes1", "name": "fields", "type": "bytes1" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "version", "type": "string" }, { "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "address", "name": "verifyingContract", "type": "address" }, { "internalType": "bytes32", "name": "salt", "type": "bytes32" }, { "internalType": "uint256[]", "name": "extensions", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "nonces", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];


// const getGasEstimate = async (method, options, from) => {
//   const manualGasLimit = 1000000; // Setze hier den gewünschten festen Gaswert
//   const gasPrice = await web3.eth.getGasPrice();
  
//   return { gasEstimate: manualGasLimit, gasPrice };
// };


const approveERC20 = async (account, amount, marketplace, paymentToken) => {
  const web3 = new Web3(window.ethereum);
  const erc20Contract = new web3.eth.Contract(ERC20_ABI, paymentToken);

  try {
    console.log("Marketplace Address:", marketplace.options.address);
    console.log("Payment Token Address:", paymentToken);
    
    const { gasEstimate, gasPrice } = await getGasEstimate(
      erc20Contract.methods.approve(marketplace.options.address, amount),
      {},
      account
    );

    await erc20Contract.methods.approve(marketplace.options.address, amount).send({
      from: account,
      gas: gasEstimate,
      gasPrice: gasPrice
    });

    showAlert("ERC20 token approval successful!");
  } catch (error) {
    showAlert("Failed to approve ERC20 token transfer. Please try again.");
    throw error;
  }
};





export const buyNFT = async (index, price, account, marketplace, nftDetails, refreshData) => {
  try {
    const isNativePayment = nftDetails.paymentToken === "0x0000000000000000000000000000000000000000";
    
    // Wenn es sich um einen ERC20-Token handelt, erfordert dies eine Genehmigung
    if (!isNativePayment) {
      const priceInWei = web3.utils.toWei(price.toString(), 'ether'); // Nur für ERC20-Token umrechnen
      await approveERC20(account, priceInWei, marketplace, nftDetails.paymentToken);
    }

    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.buyNFT(index),
      { from: account },
      account
    );

    const txOptions = {
      from: account,
      gas: gasEstimate,
      gasPrice: gasPrice,
    };

    if (isNativePayment) {
      // Wenn es eine native Währung ist, setze den Preis direkt
      txOptions.value = price; 
    }

    const result = await marketplace.methods.buyNFT(index).send(txOptions);

    console.log("Transaction result:", result);
    showAlert("NFT successfully purchased!");
    await refreshData(marketplace);
  } catch (error) {
    console.error("Detailed error:", error);
    if (error.message.includes("revert")) {
      const reason = await getRevertReason(error.transactionHash);
      showAlert(`Transaction reverted: ${reason}`);
    } else {
      showAlert(`Failed to buy NFT: ${error.message || "Unknown error occurred"}`);
    }
    throw error;
  }
};



// Funktion zum Abrufen des Revert-Grundes
async function getRevertReason(txHash) {
  try {
    const tx = await web3.eth.getTransaction(txHash);
    const result = await web3.eth.call(tx, tx.blockNumber);
    return result;
  } catch (err) {
    return "Unable to get revert reason";
  }
}





export const listNFT = async (contractAddress, tokenId, price, paymentToken, account, marketplace, refreshData) => {
  try {
    // Preis in Wei umwandeln
    const priceInWei = web3.utils.toWei(price.toString(), 'ether');
    console.log("Converting price to Wei:", { price, priceInWei });

    // Gasabschätzung erhalten
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.listNFT(contractAddress, tokenId, priceInWei, paymentToken),
      {},
      account
    );
    console.log("Gas Estimate and Gas Price:", { gasEstimate, gasPrice });

    // NFT auflisten
    const tx = await marketplace.methods
      .listNFT(contractAddress, tokenId, priceInWei, paymentToken)
      .send({ from: account, gas: gasEstimate, gasPrice: gasPrice });

    console.log("Transaction successful:", { tx });

    showAlert("NFT listed successfully!");
    await refreshData(marketplace);
    return tx;
  } catch (error) {
    console.error("Error listing NFT:", error);
    showAlert(`Failed to list NFT: ${error.message || error}`);
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

    // Prüfe, ob der Contract die ERC-721 Enumerable Erweiterung unterstützt
    const supportsEnumerable = await contract.methods.supportsInterface('0x780e9d63').call();
    if (!supportsEnumerable) {
      console.error('Contract does not support ERC-721 Enumerable interface');
      return [];
    }

    // Rufe die Anzahl der Tokens des Besitzers ab
    const balance = await contract.methods.balanceOf(ownerAddress).call();
    const tokenIds = [];

    // Rufe jede Token-ID des Besitzers ab
    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.methods.tokenOfOwnerByIndex(ownerAddress, i).call();
      tokenIds.push(tokenId.toString()); // Konvertierung zu String
    }

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











export const redeem = async (nftCollectionAddress, account, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const { gasEstimate, gasPrice } = await getGasEstimate(
      marketplace.methods.redeem(nftCollectionAddress),
      {},
      account
    );

    const result = await marketplace.methods.redeem(nftCollectionAddress).send({
      from: account,
      gas: gasEstimate,
      gasPrice: gasPrice
    });

    showAlert("Successfully redeemed physical item! Check your Emails.");
    return result;
  } catch (error) {
    showAlert(`Failed to redeem: ${error.message}`);
    throw error;
  }
};

export const getRedeemedCollections = async (userAddress, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const redeemedCollections = await marketplace.methods.getRedeemedCollections(userAddress).call();
    return redeemedCollections;
  } catch (error) {
    console.error("Error fetching redeemed collections:", error);
    throw error;
  }
};

export const isCollectionRedeemed = async (userAddress, contractAddress, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    const isRedeemed = await marketplace.methods.isCollectionRedeemed(userAddress, contractAddress).call();
    return isRedeemed;
  } catch (error) {
    console.error("Error checking if collection is redeemed:", error);
    throw error;
  }
};

export const isRedeemed = async (contractAddress, marketplace) => {
  if (!marketplace) throw new Error("Marketplace not initialized");

  try {
    console.log(`Checking redeemed status for contract address: ${contractAddress}`);
    const isRedeemed = await marketplace.methods.isRedeemed(contractAddress).call();
    return isRedeemed;
  } catch (error) {
    console.error("Error checking if contract is redeemed:", error);
    throw error;
  }
};


export const fetchCollectionStats = async (marketplace, collectionAddress) => {
  try {
    // Abrufen des native Volumens für die Kollektion
    const nativeVolumeWei = await marketplace.methods.getCollectionVolumeNative(collectionAddress).call();
    const nativeVolumeEther = web3OnlyRead.utils.fromWei(nativeVolumeWei, 'ether');
    const nativeVolumeRounded = parseFloat(nativeVolumeEther).toFixed(2);
    
    // Abrufen des Special Token Volumens für die Kollektion
    const specialTokenVolumeWei = await marketplace.methods.getCollectionVolumeSpecialToken(collectionAddress).call();
    const specialTokenVolumeEther = web3OnlyRead.utils.fromWei(specialTokenVolumeWei, 'ether');
    const specialTokenVolumeRounded = parseFloat(specialTokenVolumeEther).toFixed(2);
    
    return {
      nativeVolume: nativeVolumeRounded,
      specialTokenVolume: specialTokenVolumeRounded,
    };
  } catch (error) {
    console.error(`Error fetching stats for collection ${collectionAddress}:`, error);
    return {
      nativeVolume: '0',
      specialTokenVolume: '0',
    };
  }
};





// export const getNFTHistory = async (contractAddress, tokenId) => {
//   try {
//     console.log('Fetching NFT history for contract address:', contractAddress, 'and token ID:', tokenId);
    
//     const selectedCollection = nftCollections.find(collection => 
//       collection.address.toLowerCase() === contractAddress.toLowerCase()
//     );
//     if (!selectedCollection) {
//       console.log('Collection not found for address:', contractAddress);
//       return [];
//     }
    
//     const contract = new web3OnlyRead.eth.Contract(selectedCollection.abi, contractAddress);
//     const latestBlock = BigInt(await web3OnlyRead.eth.getBlockNumber());
//     console.log('Latest block number:', latestBlock.toString());
    
//     // Start from a recent block, e.g., 1 month ago (assuming 15s block time)
//     let fromBlock = latestBlock - BigInt(172800); // ~30 days worth of blocks
//     fromBlock = fromBlock > 0 ? fromBlock : BigInt(0);
//     let blockRange = BigInt(10000);
//     let history = [];
//     let retryCount = 0;
//     const maxRetries = 5;
    
//     const eventTypes = ['NFTListed', 'NFTSold', 'NFTListingCancelled'];
    
//     while (fromBlock <= latestBlock && retryCount < maxRetries) {
//       const toBlock = (fromBlock + blockRange <= latestBlock) ? fromBlock + blockRange : latestBlock;
      
//       try {
//         console.log(`Fetching events from block ${fromBlock.toString()} to ${toBlock.toString()}`);
        
//         for (const eventType of eventTypes) {
//           try {
//             const events = await contract.getPastEvents(eventType, {
//               fromBlock: fromBlock.toString(),
//               toBlock: toBlock.toString(),
//               filter: { tokenId: tokenId }
//             });
            
//             console.log(`Found ${events.length} ${eventType} events.`);
            
//             for (const event of events) {
//               const block = await web3OnlyRead.eth.getBlock(event.blockNumber);
//               history.push({
//                 type: eventType,
//                 from: event.returnValues.seller,
//                 to: event.returnValues.buyer || null,
//                 transactionHash: event.transactionHash,
//                 blockNumber: event.blockNumber,
//                 date: new Date(block.timestamp * 1000).toLocaleDateString(),
//                 price: event.returnValues.price || null
//               });
//             }
//           } catch (err) {
//             if (err.message.includes("Event not found")) {
//               console.warn(`Event ${eventType} not found for contract ${contractAddress}.`);
//             } else {
//               console.error('Error fetching events:', err);
//             }
//           }
//         }
        
//         fromBlock = toBlock + BigInt(1);
//         retryCount = 0; // Reset retry count on successful fetch
//       } catch (err) {
//         console.error('Error fetching events:', err);
//         if (err.message.includes("timeout") || err.message.includes("rate limit")) {
//           blockRange = blockRange / BigInt(2);
//           retryCount++;
//           console.warn(`Reducing block range to ${blockRange} and retrying. Attempt ${retryCount}`);
//         } else {
//           console.error('Unrecoverable error fetching NFT history:', err);
//           break;
//         }
//       }
//     }
    
//     // Sort history by block number
//     history.sort((a, b) => a.blockNumber - b.blockNumber);
    
//     console.log('NFT history fetching complete, total records:', history.length);
//     return history;
//   } catch (error) {
//     console.error('Error in getNFTHistory:', error);
//     return [];
//   }
// };












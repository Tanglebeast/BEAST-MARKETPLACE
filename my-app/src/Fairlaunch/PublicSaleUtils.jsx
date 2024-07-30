// src/utils/index.js
import Web3 from 'web3';
import axios from 'axios';
import { nftCollections } from '../Fairlaunch/PublicSaleNFTCollections';
import nftMarketplaceAbi from '../Fairlaunch/PublicSaleABI.json';
import React from 'react';
import ReactDOM from 'react-dom';
import CustomPopup from '../components/AlertPopup';
import NetworkSelectionPopup from '../components/NetworkSelectionPopup';

const web3 = new Web3(window.ethereum);

export const shimmerTestnet = {
  chainId: '0x431',
  chainName: 'Shimmer EVM Testnet',
  rpcUrls: ['https://json-rpc.evm.testnet.shimmer.network'],
  nativeCurrency: {
    name: 'SMR',
    symbol: 'SMR',
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer.evm.shimmer.network'],
};

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
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== expectedChainId) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: expectedChainId }],
        });
      }
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Chain not added, prompt user to add it
        const chain = getChainById(expectedChainId); // Implement this function to return chain details based on ID
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chain],
        });
      } else {
        // Handle other errors
        showAlert(`Please connect to the correct network.`);
      }
    }
  } else {
    showAlert("Please install MetaMask!");
  }
};

const getChainById = (chainId) => {
  const chains = {
    '0x431': shimmerTestnet,
    '0x433': iotaTestnet,
    // Add other chains as needed
  };

  return chains[chainId] || null;
};



export const connectWallet = async (setAccount) => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      showNetworkSelectionPopup(async (network) => {
        const selectedNetwork = network === 'shimmerTestnet' ? shimmerTestnet : iotaTestnet;
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (chainId !== selectedNetwork.chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: selectedNetwork.chainId }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [selectedNetwork],
                });
              } catch (addError) {
                showAlert(`Failed to switch network. Please add ${selectedNetwork.chainName} manually.`);
                return;
              }
            } else {
              showAlert(`Failed to switch network. Please switch to ${selectedNetwork.chainName} manually.`);
              return;
            }
          }
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts.length) {
          throw new Error('No accounts found');
        }

        setAccount(accounts[0]);
        localStorage.setItem('account', accounts[0]);
      });
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
    const networkId = await web3.eth.net.getId();
    const marketplaceData = nftMarketplaceAbi.networks[networkId];
    if (marketplaceData) {
      const marketplace = new web3.eth.Contract(nftMarketplaceAbi.abi, marketplaceData.address);
      setMarketplace(marketplace);
      await refreshData(marketplace);
    } else {
      showAlert('Marketplace contract not deployed to detected network.');
    }
  } catch (error) {
    // Handle error if needed
  }
};

export const fetchAllNFTs = async (collectionaddress, marketplace) => {
  try {
    const selectedCollection = nftCollections.find(collection => collection.address.toLowerCase() === collectionaddress.toLowerCase());
    if (!selectedCollection) {
      return [];
    }

    const contract = new web3.eth.Contract(selectedCollection.abi, selectedCollection.address);
    const totalSupply = await contract.methods.totalSupply().call();

    let allNFTs = [];

    for (let i = 0; i < totalSupply; i++) {
      try {
        const tokenId = await contract.methods.tokenByIndex(i).call();
        const tokenURI = await contract.methods.tokenURI(tokenId).call();
        const owner = await contract.methods.ownerOf(tokenId).call();

        const metadata = await axios.get(tokenURI).then(response => response.data);

        const uid = `${selectedCollection.address}-${tokenId}`;

        // Fetch price from marketplace
        const nftDetails = await getNFTDetails(selectedCollection.address, tokenId, marketplace);
        const priceInEther = nftDetails ? nftDetails.price : '0';

        allNFTs.push({
          uid: uid,
          contractAddress: selectedCollection.address,
          tokenId: tokenId,
          owner: owner,
          name: metadata.name,
          image: metadata.image,
          price: priceInEther,
        });
      } catch (error) {
        // Handle error if needed
      }
    }
    return allNFTs;
  } catch (error) {
    return [];
  }
};

export const getNFTDetails = async (contractAddress, tokenId, marketplace) => {
  try {
    const selectedCollection = nftCollections.find(collection => collection.address.toLowerCase() === contractAddress.toLowerCase());
    if (!selectedCollection) {
      return null;
    }

    const contract = new web3.eth.Contract(selectedCollection.abi, contractAddress);
    const owner = await contract.methods.ownerOf(tokenId).call();
    const tokenURI = await contract.methods.tokenURI(tokenId).call();

    const metadataResponse = await axios.get(tokenURI);
    const metadata = metadataResponse.data;

    const nftDetails = await marketplace.methods.getNFTDetails(contractAddress, tokenId).call();
    const priceInEther = web3.utils.fromWei(nftDetails.price, 'ether');

    return {
      contractAddress: contractAddress,
      tokenId: tokenId,
      owner: owner,
      name: metadata.name,
      image: metadata.image,
      price: priceInEther,
    };
  } catch (error) {
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

export const buyNFT = async (index, price, account, marketplace, refreshData) => {
  try {
    const gasLimit = 300000;
    const gasPrice = await web3.eth.getGasPrice();

    await marketplace.methods.buyNFT(index).send({ from: account, value: price, gas: gasLimit, gasPrice: gasPrice });

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

    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 300000;

    const tx = await marketplace.methods
      .listNFT(contractAddress, tokenId, web3.utils.toWei(price, 'ether'))
      .send({
        from: account,
        gasPrice: gasPrice,
        gas: gasLimit,
      });

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
    const gasLimit = 300000;
    const gasPrice = await web3.eth.getGasPrice();

    await marketplace.methods.cancelListing(index).send({
      from: account,
      gas: gasLimit,
      gasPrice: gasPrice,
    });

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
    const marketplace = new web3.eth.Contract(nftMarketplaceAbi.abi, nftMarketplaceAbi.networks[await web3.eth.net.getId()].address);
    const nftsForSale = await marketplace.methods.getNFTsForSale().call();
    const collectionNFTs = nftsForSale.filter(nft => nft.contractAddress.toLowerCase() === collectionAddress.toLowerCase());

    if (collectionNFTs.length === 0) {
      return { floorPrice: '0', listedCount: 0 };
    }

    const floorPrice = Math.min(...collectionNFTs.map(nft => parseFloat(web3.utils.fromWei(nft.price, 'ether'))));
    return { floorPrice: floorPrice.toString(), listedCount: collectionNFTs.length };
  } catch (error) {
    console.error('Error fetching collection details:', error);
    return { floorPrice: '0', listedCount: '0' };
  }
};

// In PublicSaleUtils.jsx

export const listAllNFTsForSale = async (marketplace, collectionAddress, tokenIds, price, account) => {
  try {
    const web3 = new Web3(window.ethereum);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 300000; // Increased gas limit for the transaction

    const promises = tokenIds.map(async (tokenId) => {
      // Assuming marketplace.methods.listNFT is used to list an NFT for sale
      return marketplace.methods.listNFT(collectionAddress, tokenId, web3.utils.toWei(price, 'ether')).send({
        from: account, // Set the `from` field with the user account
        gas: gasLimit,
        gasPrice: gasPrice
      });
    });

    const results = await Promise.all(promises);
    console.log("Listed all NFTs for sale:", results);
  } catch (error) {
    console.error("Error listing all NFTs for sale:", error);
    throw error;
  }
};




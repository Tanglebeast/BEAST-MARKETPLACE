// src/utils/networkConfig.js
const defaultNetwork = 'shimmerevm'; // Standardnetzwerk

const networks = {
  shimmerevm: 'https://json-rpc.evm.testnet.shimmer.network',
  iotaevm: 'https://json-rpc.evm.testnet.iotaledger.net',
  bnbchain: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
  polygon: 'https://rpc-amoy.polygon.technology'
};

let currentNetwork = localStorage.getItem('selectedNetwork') || defaultNetwork;

export const getRpcUrl = () => {
  const rpcUrl = networks[currentNetwork];
  console.log('Current RPC URL:', rpcUrl); // Loggt die aktuelle RPC-URL
  return rpcUrl;
};

export const setNetwork = (network) => {
  if (networks[network]) {
    currentNetwork = network;
    localStorage.setItem('selectedNetwork', network);
  } else {
    throw new Error('Network not supported');
  }
};

export const getCurrentNetwork = () => currentNetwork;

import React, { useEffect, useState } from 'react';
import '../styles/NetworkselectionDropdown.css'; // Falls du CSS für Stile nutzen möchtest
import { checkNetwork } from './utils';

const networks = {
  shimmerevm: {
    url: 'https://json-rpc.evm.testnet.shimmer.network',
    icon: '/currency-smr.png' // Pfad zum Shimmer Icon
  },
  iotaevm: {
    url: 'https://json-rpc.evm.testnet.iotaledger.net',
    icon: '/currency-iota.png' // Pfad zum IOTA Icon
  },
  bnbchain: {
    url: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
    icon: '/currency-bnb.png' // Pfad zum BNB Icon
  },
  polygon: {
    url: 'https://rpc-amoy.polygon.technology',
    icon: '/currency-matic.png' // Pfad zum POLYGON Icon
  }
};

const NetworkselectionDropdown = ({ onNetworkChange }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    const savedNetwork = localStorage.getItem('selectedNetwork');
    return savedNetwork ? savedNetwork : '';
  });
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chainFromUrl = urlParams.get('chain');

    if (chainFromUrl && networks[chainFromUrl]) {
      setSelectedNetwork(chainFromUrl);
      localStorage.setItem('selectedNetwork', chainFromUrl);

      // Entfernen der URL-Parameter
      urlParams.delete('chain');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);

      window.location.reload();  // Seite neu laden
    }

    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment.length > 0);

    // Deaktivieren, wenn das zweite Pfadsegment mit "0x" beginnt
    if (pathSegments.length > 1 && pathSegments[1].startsWith('0x')) {
      setIsDisabled(true);
    }
  }, []);

  const handleNetworkChange = async (network) => {
    if (isDisabled) return;

    setSelectedNetwork(network);
    localStorage.setItem('selectedNetwork', network);

    const account = localStorage.getItem('account');
    if (account) {
      const selectedChainId = getChainIdFromNetwork(network);
      try {
        await checkNetwork(selectedChainId);
        window.location.reload();
      } catch (error) {
        console.error('Error switching network:', error);
      }
    } else {
      window.location.reload();
    }
  };

  const getChainIdFromNetwork = (network) => {
    switch (network) {
      case 'shimmerevm':
        return '0x431'; // Chain ID für Shimmer EVM Testnet
      case 'iotaevm':
        return '0x433'; // Chain ID für IOTA EVM Testnet
      case 'bnbchain':
        return '0x61'; // Chain ID für BNB EVM Testnet
      case 'polygon':
        return '0x13882'; // Chain ID für Polygon EVM Testnet
      default:
        return '';
    }
  };

  return (
    <div className={`network-popup mr15 ${isDisabled ? 'disabled' : ''}`}>
      <div className={`network-dropdown ${isDisabled ? 'disabled' : ''}`}>
        <div className="network-selected">
          {selectedNetwork ? (
            <>
              <img src={networks[selectedNetwork]?.icon} alt={`${selectedNetwork} icon`} className="network-icon" />
              {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
            </>
          ) : 'Bitte auswählen'}
        </div>
        <div className="network-options">
          {Object.keys(networks).map(network => (
            <div
              key={network}
              className={`network-option ${selectedNetwork === network ? 'selected' : ''}`}
              onClick={() => handleNetworkChange(network)}
            >
              <img src={networks[network].icon} alt={`${network} icon`} className="network-icon" />
              {network.charAt(0).toUpperCase() + network.slice(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkselectionDropdown;

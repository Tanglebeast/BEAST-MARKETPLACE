import React, { useState } from 'react';
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
  }
};

const NetworkselectionDropdown = ({ onNetworkChange }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    const savedNetwork = localStorage.getItem('selectedNetwork');
    return savedNetwork ? savedNetwork : '';
  });

  const handleNetworkChange = async (network) => {
    setSelectedNetwork(network);

    // Speichere die ausgewählten Werte im localStorage
    localStorage.setItem('selectedNetwork', network);

    const account = localStorage.getItem('account'); // Prüfe, ob ein Account im lokalen Speicher vorhanden ist

    if (account) {
      // Wenn ein Konto vorhanden ist, versuche, das Netzwerk zu wechseln
      const selectedChainId = getChainIdFromNetwork(network);
      try {
        await checkNetwork(selectedChainId);
        // Wenn der Netzwerkwechsel erfolgreich war, lade die Seite neu
        window.location.reload();
      } catch (error) {
        console.error('Error switching network:', error);
      }
    } else {
      // Wenn kein Konto vorhanden ist, lade die Seite neu
      window.location.reload();
    }
  };

  const getChainIdFromNetwork = (network) => {
    switch (network) {
      case 'shimmerevm':
        return '0x431'; // Chain ID für Shimmer EVM Testnet
      case 'iotaevm':
        return '0x433'; // Chain ID für IOTA EVM Testnet
      default:
        return '';
    }
  };

  return (
    <div className="network-popup mr15">
      <div className="network-dropdown">
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

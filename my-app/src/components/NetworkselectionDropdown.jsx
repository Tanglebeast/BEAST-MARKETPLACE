import React, { useState } from 'react';
import '../styles/NetworkselectionDropdown.css'; // Falls du CSS für Stile nutzen möchtest
import { checkNetwork } from './utils';

const networks = {
  shimmerevm: 'https://json-rpc.evm.testnet.shimmer.network',
  iotaevm: 'https://json-rpc.evm.testnet.iotaledger.net'
};

const NetworkselectionDropdown = ({ onNetworkChange }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(() => {
    const savedNetwork = localStorage.getItem('selectedNetwork');
    return savedNetwork ? savedNetwork : '';
  });

  const handleNetworkChange = async (event) => {
    const network = event.target.value;
    setSelectedNetwork(network);
    
    // Speichere die ausgewählten Werte im localStorage
    localStorage.setItem('selectedNetwork', network);

    const account = localStorage.getItem('account'); // Prüfe, ob ein Account im lokalen Speicher vorhanden ist

    if (account) {
      // Wenn ein Konto vorhanden ist, versuche, das Netzwerk zu wechseln
      const selectedChainId = getChainIdFromNetwork(network);
      try {
        await checkNetwork(selectedChainId);
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
      <select
        id="network-select"
        value={selectedNetwork}
        onChange={handleNetworkChange}
        className="network-select"
      >
        <option value="" disabled>Bitte auswählen</option>
        {Object.keys(networks).map(network => (
          <option key={network} value={network}>
            {network.charAt(0).toUpperCase() + network.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NetworkselectionDropdown;

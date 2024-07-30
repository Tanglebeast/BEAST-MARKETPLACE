import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import ShortenAddress from './ShortenAddress';
import { getUserName, getProfilePicture, initializeMarketplace, shimmerTestnet, iotaTestnet } from '../components/utils';
import NetworkSelectionPopup from './NetworkSelectionPopup';

const Header = ({ isConnected, account, connectWallet, disconnectWallet }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('/placeholder-PFP.png');
  const [marketplace, setMarketplace] = useState(null);
  const [network, setNetwork] = useState('');
  const [networkIcon, setNetworkIcon] = useState('./default-network-icon.png');
  const [showNetworkPopup, setShowNetworkPopup] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // New state to track initialization

  useEffect(() => {
    const setupMarketplace = async () => {
      try {
        await initializeMarketplace(setMarketplace, () => {});
      } catch (err) {
        console.error('Failed to initialize marketplace:', err);
      } finally {
        setIsInitializing(false); // Mark initialization as complete
      }
    };

    setupMarketplace();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (account && marketplace) {
        try {
          const [fetchedUsername, fetchedProfilePicture] = await Promise.all([
            getUserName(account, marketplace),
            getProfilePicture(account, marketplace)
          ]);
          setUsername(fetchedUsername);
          setProfilePicture(fetchedProfilePicture || '/placeholder-PFP.png');
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, [account, marketplace]);

  useEffect(() => {
    const fetchNetwork = async () => {
      if (window.ethereum) {
        try {
          const networkId = await window.ethereum.request({ method: 'net_version' });
          let networkName = '';
          let networkIconPath = './default-network-icon.png';

          switch (networkId) {
            case '1073':
              networkName = 'SHIMMER';
              networkIconPath = '/currency-smr.png';
              break;
            case '1075':
              networkName = 'IOTA';
              networkIconPath = '/currency-iota.png';
              break;
            case '4':
              networkName = 'Rinkeby';
              networkIconPath = '/rinkeby-icon.png';
              break;
            case '5':
              networkName = 'Goerli';
              networkIconPath = '/goerli-icon.png';
              break;
            case '42':
              networkName = 'Kovan';
              networkIconPath = '/kovan-icon.png';
              break;
            default:
              networkName = 'Unknown Network';
              networkIconPath = '/unknown-network-icon.png';
          }

          setNetwork(networkName);
          setNetworkIcon(networkIconPath);
          setChainId(networkId);  // Save the current chainId
        } catch (error) {
          console.error('Error fetching network:', error);
        }
      }
    };

    fetchNetwork();
  }, [isConnected]);

  useEffect(() => {
    const handleChainIdChange = async () => {
      if (window.ethereum) {
        try {
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (currentChainId !== chainId) {
            window.location.reload();  // Reload the page if the chainId changes
          }
        } catch (error) {
          console.error('Error checking chainId:', error);
        }
      }
    };

    // Set up an event listener for chainId changes
    window.ethereum.on('chainChanged', handleChainIdChange);

    // Clean up the event listener on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainIdChange);
      }
    };
  }, [chainId]);

  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    window.location.reload();
  };

  const handleNetworkChange = async (network) => {
    let selectedNetwork;
    switch (network) {
      case 'shimmerTestnet':
        selectedNetwork = shimmerTestnet;
        break;
      case 'iotaTestnet':
        selectedNetwork = iotaTestnet;
        break;
      default:
        console.error('Unsupported network');
        return;
    }

    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (currentChainId !== selectedNetwork.chainId) {
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
              console.error(`Failed to add ${selectedNetwork.chainName}:`, addError);
            }
          } else {
            console.error(`Failed to switch to ${selectedNetwork.chainName}:`, switchError);
          }
        }
      }
      setShowNetworkPopup(false);
    } catch (error) {
      console.error('Error changing network:', error);
    }
  };

  return (
    <header>
      <nav className="navbar">
        <a href="/" className="title">
          <img src="/fractalz-logo-black.svg" alt="NFT Marketplace Logo" className="logo" />
        </a>
        <div className="nav-links">
          <a href="/collections" className="nav-link">GALLERY</a>
          <a href="/artists" className="nav-link">ARTISTS</a>
          <a href="/users" className="nav-link">USERS</a>
          <a href="/fairlaunch" className="nav-link">FAIRLAUNCH</a>
          <a href="/about" className="nav-link">ABOUT</a>
        </div>
        {isInitializing ? (
          <div>Loading...</div> // Placeholder while initialization is in progress
        ) : isConnected ? (
          <div className="connected-container flex center-ho"
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}>
            <div className="network-container">
              <div className='network-iconDiv'>
                <img src={networkIcon} alt="Network Icon" className="network-icon" />
              </div>
              <p className="network">{network}</p>
            </div>
            <div className='PFPImage flex centered'>
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="profile-picture" 
              />
            </div>
            <p className="account">
              {username ? username : <ShortenAddress address={account} />}
            </p>
            {showDropdown && (
              <div className="dropdown">
                <div className="dropdown-hover">
                  <a href="/wallet" className="dropdown-link">MY ACCOUNT</a>
                </div>
                <button className="button-change-network" onClick={() => setShowNetworkPopup(true)}>CHANGE NETWORK</button>
                <button className="button-disconnect" onClick={handleDisconnect}>DISCONNECT</button>
              </div>
            )}
          </div>
        ) : (
          <button className="button" onClick={connectWallet}>Connect Wallet</button>
        )}
      </nav>

      {showNetworkPopup && (
        <NetworkSelectionPopup
          onClose={() => setShowNetworkPopup(false)}
          onSelectNetwork={handleNetworkChange}
        />
      )}
    </header>
  );
};

export default Header;

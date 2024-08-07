import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import ShortenAddress from './ShortenAddress';
import { getUserName, getProfilePicture, initializeMarketplace } from '../components/utils';
import NetworkselectionDropdown from './NetworkselectionDropdown';

const Header = ({ isConnected, account, connectWallet, disconnectWallet }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('/placeholder-PFP.png');
  const [marketplace, setMarketplace] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const setupMarketplace = async () => {
      try {
        await initializeMarketplace(setMarketplace, () => {});
      } catch (err) {
        console.error('Failed to initialize marketplace:', err);
      } finally {
        setIsInitializing(false);
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
          <a href="/fairmint" className="nav-link">FAIRMINT</a>
          <a href="/about" className="nav-link">ABOUT</a>
        </div>
        <NetworkselectionDropdown />
        {isInitializing ? (
          <div>Loading...</div>
        ) : isConnected ? (
          <div className="connected-container flex center-ho"
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}>
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
                <button className="button-change-network" onClick={() => connectWallet()}>CHANGE NETWORK</button>
                <button className="button-disconnect" onClick={handleDisconnect}>DISCONNECT</button>
              </div>
            )}
          </div>
        ) : (
          <button className="button" onClick={connectWallet}>Connect Wallet</button>
        )}
      </nav>
    </header>
  );
};

export default Header;

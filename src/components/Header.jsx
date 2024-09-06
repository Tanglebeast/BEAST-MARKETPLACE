import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';  // Importieren Sie useLocation
import '../styles/Header.css';  // Verweisen Sie auf Ihre einzige CSS-Datei
import ShortenAddress from './ShortenAddress';
import { getUserName, getProfilePicture, initializeMarketplace } from '../components/utils';
import NetworkselectionDropdown from './NetworkselectionDropdown';
import '/fractalz-logo-black.svg';

const Header = ({ isConnected, account, connectWallet, disconnectWallet }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('/placeholder-PFP.png');
  const [marketplace, setMarketplace] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Zustand für das Hamburger-Menü
  const [isScrolled, setIsScrolled] = useState(true); // Standardmäßig `true` setzen
  
  const location = useLocation(); // Verwenden Sie useLocation, um den aktuellen Pfad zu erhalten

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

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/') {
        // Auf der Homepage, scrolled nur auf Basis des Scrollens
        setIsScrolled(window.scrollY > 0);
      } else {
        // Auf anderen Seiten immer scrolled
        setIsScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialer Check beim ersten Rendern
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

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
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <a href="https://fractalz.xyz" className="title">
          <img src="/fractalz-logo-black.svg" alt="NFT Marketplace Logo" className="logo" />
        </a>
        <label className="hamburger">
          <input type="checkbox" checked={showMobileMenu} onChange={() => setShowMobileMenu(!showMobileMenu)} />
          <svg viewBox="0 0 32 32">
            <path className="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
            <path className="line" d="M7 16 27 16"></path>
          </svg>
        </label>

        <div className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
          <div className='ml200'>
            <a href="/collections" className="nav-link">GALLERY</a>
            <a href="/artists" className="nav-link">ARTISTS</a>
            <a href="/users" className="nav-link">USERS</a>
            <a href="/fairmint" className="nav-link">FAIRMINT</a>
            <a href="/fairvote" className="nav-link">FAIRVOTE</a>
            <a href="/articles" className="nav-link">ARTICLES</a>
          </div>
          <div className='flex centered burder-account-network'>
            <NetworkselectionDropdown />
            {isInitializing ? (
              <img src='/basic-loading.gif' alt='loading-spinner' className="loading-spinner" />
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
                    <button className="button-disconnect" onClick={handleDisconnect}>DISCONNECT</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="button" onClick={connectWallet}>CONNECT</button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

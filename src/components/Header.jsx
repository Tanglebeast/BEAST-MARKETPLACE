// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Header.css';
import ShortenAddress from './ShortenAddress';
import { getUserName, getProfilePicture, initializeMarketplace } from '../components/utils';
import BeastPrice from './BeastPrice';
import FetchTokenAmount from './FetchTokenAmount';
import ChangeTheme from './ChangeTheme';
import LoadingSpinner from '../Assets/loading-spinner';
import PlatinumUserCheck from '../PlatinumFunctions/PlatinumUserCheck';

const Header = ({ isConnected, account, connectWallet, disconnectWallet }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('/placeholder-PFP.png');
  const [marketplace, setMarketplace] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(true);

  const location = useLocation();

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
            getProfilePicture(account, marketplace),
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
        setIsScrolled(window.scrollY > 0);
      } else {
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
        <a href="/" className="title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 188" // Stellen Sie sicher, dass das viewBox korrekt ist
            className="logo-svg" // CSS-Klasse zur Steuerung der Größe
            style={{
              shapeRendering: 'geometricPrecision',
              textRendering: 'geometricPrecision',
              imageRendering: 'optimizeQuality',
              fillRule: 'evenodd',
              clipRule: 'evenodd',
            }}
          >
            <g>
              <path
                style={{ opacity: 0.841 }}
                fill="var(--text-color)"
                d="M 774.5,34.5 C 775.75,34.5774 776.583,35.244 777,36.5C 792.795,73.7508 808.295,111.084 823.5,148.5C 820.881,148.768 818.381,148.435 816,147.5C 809.691,132.234 803.191,117.068 796.5,102C 782.5,101.333 768.5,101.333 754.5,102C 748.146,117.21 741.646,132.376 735,147.5C 732.619,148.435 730.119,148.768 727.5,148.5C 742.773,110.351 758.44,72.3506 774.5,34.5 Z M 774.5,52.5 C 781.468,65.8411 787.801,79.6745 793.5,94C 781.5,94.6667 769.5,94.6667 757.5,94C 763.868,80.4344 769.534,66.601 774.5,52.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.926 }}
                fill="var(--text-color)"
                d="M 116.5,35.5 C 118.335,36.1223 119.502,37.4556 120,39.5C 135.403,75.8743 150.903,112.208 166.5,148.5C 159.524,149.664 152.524,149.831 145.5,149C 142.167,141 138.833,133 135.5,125C 122.487,124.167 109.487,124.334 96.5,125.5C 93.2957,133.406 89.9624,141.24 86.5,149C 80.5092,149.499 74.5092,149.666 68.5,149.5C 84.3032,111.426 100.303,73.4256 116.5,35.5 Z M 115.5,77.5 C 116.75,77.5774 117.583,78.244 118,79.5C 121.447,89.1769 125.28,98.6769 129.5,108C 120.814,108.832 112.147,108.665 103.5,107.5C 108.067,97.7041 112.067,87.7041 115.5,77.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.927 }}
                fill="var(--text-color)"
                d="M 179.5,36.5 C 180.552,36.3505 181.552,36.5172 182.5,37C 207.361,62.195 232.528,87.0283 258,111.5C 258.5,87.8357 258.667,64.169 258.5,40.5C 264.5,40.5 270.5,40.5 276.5,40.5C 276.5,77.8333 276.5,115.167 276.5,152.5C 275.448,152.649 274.448,152.483 273.5,152C 248.333,127.5 223.167,103 198,78.5C 198.35,102.152 198.517,125.819 198.5,149.5C 192.167,149.5 185.833,149.5 179.5,149.5C 179.5,111.833 179.5,74.1667 179.5,36.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.838 }}
                fill="var(--text-color)"
                d="M 874.5,38.5 C 887.879,36.8437 900.546,39.0104 912.5,45C 913.381,48.0655 912.215,50.2321 909,51.5C 887.201,41.0508 867.534,44.0508 850,60.5C 837.479,75.2609 834.146,91.9276 840,110.5C 848.61,130.105 863.61,140.772 885,142.5C 893.921,141.479 902.421,139.312 910.5,136C 912.441,137.816 913.108,139.816 912.5,142C 883.678,155.502 859.178,150.002 839,125.5C 825.054,101.022 826.721,77.6887 844,55.5C 852.56,46.8067 862.727,41.14 874.5,38.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.942 }}
                fill="var(--text-color)"
                d="M 339.5,39.5 C 352.83,38.428 365.83,39.928 378.5,44C 380.664,44.9143 382.664,46.081 384.5,47.5C 382.53,53.1053 380.197,58.4386 377.5,63.5C 363.187,56.5752 348.52,55.7419 333.5,61C 320.142,68.7018 313.476,80.3684 313.5,96C 318.169,123.533 334.502,135.2 362.5,131C 365,130.625 367.333,129.792 369.5,128.5C 370.495,122.872 370.829,117.206 370.5,111.5C 363.833,111.5 357.167,111.5 350.5,111.5C 350.5,105.5 350.5,99.5 350.5,93.5C 363.167,93.5 375.833,93.5 388.5,93.5C 388.667,108.837 388.5,124.17 388,139.5C 365.502,152.49 342.669,153.323 319.5,142C 299.616,128.386 291.783,109.553 296,85.5C 300.454,60.5489 314.954,45.2156 339.5,39.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.835 }}
                fill="var(--text-color)"
                d="M 613.5,39.5 C 623.309,38.3912 632.643,39.8912 641.5,44C 643.976,45.3088 645.976,47.1421 647.5,49.5C 646.396,51.3885 645.063,53.0552 643.5,54.5C 635.307,47.8258 625.974,45.3258 615.5,47C 604.306,51.8856 599.806,60.3856 602,72.5C 603.406,77.5732 606.572,81.0732 611.5,83C 622.407,86.7467 633.074,91.0801 643.5,96C 656.965,107.974 659.131,121.807 650,137.5C 637.979,149.695 623.812,152.861 607.5,147C 600.477,144.335 594.811,140.002 590.5,134C 591.333,131.833 592.833,130.333 595,129.5C 600.985,135.58 608.152,139.747 616.5,142C 634.026,143.943 644.693,136.443 648.5,119.5C 647.897,112.13 644.564,106.297 638.5,102C 626.867,97.0083 615.201,92.0083 603.5,87C 593.754,77.9488 591.254,67.1154 596,54.5C 599.912,47.0754 605.746,42.0754 613.5,39.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.88 }}
                fill="var(--text-color)"
                d="M 673.5,39.5 C 683.839,39.3335 694.172,39.5002 704.5,40C 726.748,45.6619 734.581,59.4952 728,81.5C 722.714,91.103 714.547,96.2696 703.5,97C 695.841,97.4997 688.174,97.6664 680.5,97.5C 680.5,114.5 680.5,131.5 680.5,148.5C 678.167,148.5 675.833,148.5 673.5,148.5C 673.5,112.167 673.5,75.8333 673.5,39.5 Z M 680.5,46.5 C 689.235,46.1241 697.902,46.6241 706.5,48C 721.724,54.0233 726.224,64.5233 720,79.5C 716.245,84.2953 711.412,87.462 705.5,89C 697.203,90.1227 688.87,90.6227 680.5,90.5C 680.5,75.8333 680.5,61.1667 680.5,46.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.864 }}
                fill="var(--text-color)"
                d="M 931.5,39.5 C 953.167,39.5 974.833,39.5 996.5,39.5C 996.5,41.8333 996.5,44.1667 996.5,46.5C 977.167,46.5 957.833,46.5 938.5,46.5C 938.5,60.8333 938.5,75.1667 938.5,89.5C 955.833,89.5 973.167,89.5 990.5,89.5C 990.5,91.8333 990.5,94.1667 990.5,96.5C 973.167,96.5 955.833,96.5 938.5,96.5C 938.5,111.167 938.5,125.833 938.5,140.5C 958.5,140.5 978.5,140.5 998.5,140.5C 998.5,143.167 998.5,145.833 998.5,148.5C 976.167,148.5 953.833,148.5 931.5,148.5C 931.5,112.167 931.5,75.8333 931.5,39.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.95 }}
                fill="var(--text-color)"
                d="M 1.5,40.5 C 25.8333,40.5 50.1667,40.5 74.5,40.5C 74.5,46.5 74.5,52.5 74.5,58.5C 65.1667,58.5 55.8333,58.5 46.5,58.5C 46.5,88.8333 46.5,119.167 46.5,149.5C 40.5,149.5 34.5,149.5 28.5,149.5C 28.5,119.167 28.5,88.8333 28.5,58.5C 19.5,58.5 10.5,58.5 1.5,58.5C 1.5,52.5 1.5,46.5 1.5,40.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.923 }}
                fill="var(--text-color)"
                d="M 410.5,40.5 C 416.833,40.5 423.167,40.5 429.5,40.5C 429.5,70.8333 429.5,101.167 429.5,131.5C 447.167,131.5 464.833,131.5 482.5,131.5C 482.5,137.5 482.5,143.5 482.5,149.5C 458.5,149.5 434.5,149.5 410.5,149.5C 410.5,113.167 410.5,76.8333 410.5,40.5 Z"
              />
            </g>
            <g>
              <path
                style={{ opacity: 0.936 }}
                fill="var(--text-color)"
                d="M 497.5,40.5 C 521.833,40.5 546.167,40.5 570.5,40.5C 570.5,46.5 570.5,52.5 570.5,58.5C 552.5,58.5 534.5,58.5 516.5,58.5C 516.5,67.5 516.5,76.5 516.5,85.5C 532.5,85.5 548.5,85.5 564.5,85.5C 564.5,91.5 564.5,97.5 564.5,103.5C 548.5,103.5 532.5,103.5 516.5,103.5C 516.5,112.833 516.5,122.167 516.5,131.5C 535.167,131.5 553.833,131.5 572.5,131.5C 572.5,137.5 572.5,143.5 572.5,149.5C 547.5,149.5 522.5,149.5 497.5,149.5C 497.5,113.167 497.5,76.8333 497.5,40.5 Z"
              />
            </g>
          </svg>
        </a>
        <label className="hamburger">
          <input
            type="checkbox"
            checked={showMobileMenu}
            onChange={() => setShowMobileMenu(!showMobileMenu)}
          />
          <svg viewBox="0 0 32 32" className="hamburger-icon">
            <path
              className="line line-top-bottom"
              d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
            />
            <path className="line" d="M7 16 27 16"></path>
          </svg>
        </label>

        <div className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
          <div className="ml200">
            <a href="/collections" className="nav-link">COLLECTIONS</a>
            <a href="/projects" className="nav-link">PROJECTS</a>
            <a href="/fairmint" className="nav-link">FAIRMINT</a>
            <a href="/fairvote" className="nav-link">FAIRVOTE</a>
            <a href="/beast-faucet" className="nav-link">MINT TEST TOKENS!</a>
            <a href="/giveaway" className="nav-link">GIVEAWAY</a>
          </div>
          <div className="flex centered burder-account-network gap30">
            <BeastPrice />
            {isInitializing ? (
              <LoadingSpinner
              filled={false} 
                              textColor="currentColor" 
                              size={22} 
                              className="loading-gif"
              />
            ) : isConnected ? (
              <div
                className="connected-container flex center-ho"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="PFPImage flex centered">
                  <img src={profilePicture} alt="Profile" className="profile-picture" />
                </div>
                <p className="account centered flex">
  {username ? username : <ShortenAddress address={account} />}
  <PlatinumUserCheck account={account} /> {/* Hier wird das Herz-Icon angezeigt */}
</p>

                {showDropdown && (
                  <div className="dropdown">
                    {/* Einfügen der FetchTokenAmount Komponente */}
                    <FetchTokenAmount account={account} />

                    <div className="dropdown-hover">
                      <a href="/wallet" className="dropdown-link">MY ACCOUNT</a>
                    </div>
                    <button className="button-disconnect" onClick={handleDisconnect}>
                      DISCONNECT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="button white" onClick={connectWallet}><h3 className='mbt2 white'>CONNECT</h3></button>
            )}
            <ChangeTheme isConnected={isConnected}/>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

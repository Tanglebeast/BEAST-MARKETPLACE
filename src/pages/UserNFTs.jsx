// src/components/UserNFTs.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchSingleNFT,
  initializeMarketplace,
  getUserName,
  getProfilePicture,
  getTokenIdsOfOwner,
  artistwalletAddresses,
  CONTRACT_OWNER_ADDRESS,
  setArtistWallet,
  isContractPaused,
  pauseContract,
  unpauseContract
} from '../components/utils';
import { nftCollections } from '../NFTCollections';
import '../styles/MyNFTs.css';
import ShortenAddress from '../components/ShortenAddress';
import SearchBar from '../components/SearchBar';
import MyNFTsFilter from '../components/MyNFTsFilter';
import SetArtistWalletPopup from '../components/SetartistWalletPopup';
import CreatePoll from '../UserGovernance/CreatePoll';
import BlogListPage from '../Blog/Bloglistpage';
import PopupContainer from '../Blog/BlogFormPupup';
import SubmitCollectionPopup from '../components/SubmitCollectionPopup';
import ImageWithLoading from '../components/ImageWithLoading';
import LoadingSpinner from '../Assets/loading-spinner';
import PlatinumUserCheck from '../PlatinumFunctions/PlatinumUserCheck';
// Importiere die notwendigen Funktionen aus platinumUtils.jsx
import { getProfile, isNFTHolder } from '../PlatinumFunctions/PlatinumUtils';

const getCollectionName = (address) => {
  const collection = nftCollections.find(col => col.address.toLowerCase() === address.toLowerCase());
  return collection ? collection.name : 'Unknown Collection';
};

const getSavedResultsPerPage = () => {
  const savedResults = localStorage.getItem('results-per-page');
  return savedResults ? Number(savedResults) : 30; // Standardwert ist 30
};

const UserNFTs = () => {
  const { walletAddress } = useParams(); // Adresse des angezeigten Benutzers
  const [account, setAccount] = useState(walletAddress?.toLowerCase() || '');
  const [connectedAccount, setConnectedAccount] = useState(''); // Verbundene Wallet-Adresse
  const [marketplace, setMarketplace] = useState(null);
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstPageLoading, setIsFirstPageLoading] = useState(true);
  const [userName, setUserName] = useState('Unknown');
  const [profilePicture, setProfilePictureState] = useState('/placeholder-PFP-black.png');
  const [bannerPicture, setBannerPicture] = useState('/placeholder-PFP-banner.png');
  const [isArtistWalletPopupOpen, setIsArtistWalletPopupOpen] = useState(false);
  const [isCreatePollPopupOpen, setIsCreatePollPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isContractPausedState, setIsContractPausedState] = useState(false);
  const [isBloglistpageOpen, setIsBloglistpageOpen] = useState(false);
  const [isSubmitCollectionPopupOpen, setIsSubmitCollectionPopupOpen] = useState(false);
  const [filters, setFilters] = useState({
    availability: [],
    artist: [],
    artwork: []
  });
  const [ownedCollections, setOwnedCollections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [totalBatches, setTotalBatches] = useState(1);
  const [loadedBatches, setLoadedBatches] = useState(0);
  const [allPagesData, setAllPagesData] = useState({});
  const [isPreloading, setIsPreloading] = useState(false);
  const [loadedPages, setLoadedPages] = useState(0);
  const [isAccountInLocalStorage, setIsAccountInLocalStorage] = useState(false);
  const [bio, setBio] = useState(''); // Zustand für die Bio


  const [ownsRequiredNFT, setOwnsRequiredNFT] = useState(false); // Zustand für NFT-Besitz
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    twitter: '',
    instagram: '',
    discord: ''
  }); // Zustand für die Social-Media-Links

  const [resultsPerPage, setResultsPerPage] = useState(getSavedResultsPerPage());
  const userCache = useRef({});

  // Initialisierung des Marktplatzes
  useEffect(() => {
    initializeMarketplace(setMarketplace, () => { /* Nicht benötigt */ });
  }, []);

  // Abrufen der verbundenen Wallet-Adresse
  useEffect(() => {
    const getConnectedAccount = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            setConnectedAccount(accounts[0].toLowerCase());
          }
        } catch (error) {
          console.error('Fehler beim Abrufen der verbundenen Wallet-Adresse:', error);
        }
      } else {
        console.warn('MetaMask ist nicht installiert.');
      }
    };
    getConnectedAccount();
  }, []);

  useEffect(() => {
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      setIsAccountInLocalStorage(true);
    } else {
      setIsAccountInLocalStorage(false);
    }
  }, []);
  

  // Überprüfen, ob der Vertrag pausiert ist
  useEffect(() => {
    const checkContractPaused = async () => {
      if (marketplace) {
        const paused = await isContractPaused(marketplace);
        setIsContractPausedState(paused);
      }
    };
    checkContractPaused();
  }, [marketplace]);

  // Überprüfen, ob die verbundene Wallet ein NFT-Besitzer ist
  useEffect(() => {
    const checkNFTHolder = async () => {
      if (connectedAccount) {
        try {
          const isHolder = await isNFTHolder(connectedAccount);
          setOwnsRequiredNFT(isHolder);
        } catch (error) {
          console.error('Fehler bei der Überprüfung des NFT-Besitzes:', error);
        }
      }
    };
    checkNFTHolder();
  }, [connectedAccount]);

  // Initiales Laden der Benutzerdaten und NFTs
  useEffect(() => {
    if (account && marketplace) {
      getUserName(account, marketplace)
        .then(setUserName)
        .catch(() => setUserName('Unknown'));
      getProfilePicture(account, marketplace)
        .then(picture => {
          setProfilePictureState(picture || '/placeholder-PFP-black.png');
          setBannerPicture(picture || '/placeholder-PFP-banner.png');
        })
        .catch(() => {
          setProfilePictureState('/placeholder-PFP-black.png');
          setBannerPicture('/placeholder-PFP-banner.png');
        });
      loadPage(currentPage); // Lade die aktuelle Seite
      fetchUserNames();
    }
  }, [account, marketplace, currentPage, resultsPerPage]); // Füge resultsPerPage als Abhängigkeit hinzu

  // Abrufen der Social-Media-Links des angezeigten Benutzers
  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      if (ownsRequiredNFT && account && isAccountInLocalStorage) {
        try {
          const profile = await getProfile(account);
          setSocialMediaLinks(profile);
          setBio(profile.bio || '');
        } catch (error) {
          console.error('Fehler beim Abrufen der Social-Media-Links:', error);
        }
      }
    };
    fetchSocialMediaLinks();
  }, [ownsRequiredNFT, account, isAccountInLocalStorage]);
  
  

  // Funktion zum Abrufen der NFTs für eine bestimmte Seite (für Anzeige)
  const loadPage = async (page) => {
    if (allPagesData[page]) {
      setAllNFTs(allPagesData[page]);
      setLoadedPages(prev => (prev < 1 ? 1 : prev));

      if (isFirstPageLoading) {
        setIsFirstPageLoading(false);
      }

      return;
    }

    setLoading(true);
    setError(null);
    try {
      const tokenIdPromises = nftCollections.map(async (collection) => {
        const tokenIds = await getTokenIdsOfOwner(collection.address, account);
        return { collection, tokenIds };
      });

      const tokenIdResults = await Promise.all(tokenIdPromises);
      const allTokenIds = tokenIdResults.flatMap(result => result.tokenIds.map(tokenId => ({ collection: result.collection, tokenId })));
      const totalTokens = allTokenIds.length;
      const computedTotalPages = Math.ceil(totalTokens / resultsPerPage);
      setTotalPages(computedTotalPages);
      setTotalBatches(computedTotalPages);

      const start = (page - 1) * resultsPerPage;
      const end = page * resultsPerPage;
      const paginatedTokenIds = allTokenIds.slice(start, end);

      const nftPromises = paginatedTokenIds.map(async ({ collection, tokenId }) => {
        const nft = await fetchSingleNFT(collection.address, marketplace, tokenId);
        return {
          ...nft,
          collectionName: getCollectionName(collection.address) // Hinzufügen des collectionName-Feldes
        };
      });

      const nfts = await Promise.all(nftPromises);

      const uniqueNFTs = nfts.filter(nft => 
        nft && 
        !allPagesData[page]?.some(existingNft => 
          existingNft.tokenId === nft.tokenId && 
          existingNft.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase()
        )
      );

      setAllPagesData(prevData => ({
        ...prevData,
        [page]: uniqueNFTs
      }));

      setAllNFTs(uniqueNFTs);
      setLoadedPages(1);

      if (isFirstPageLoading) {
        setIsFirstPageLoading(false);
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Fehler beim Laden der NFTs. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Vorabladen aller Seiten im Hintergrund
  const preloadPages = async () => {
    if (isPreloading) return;
    setIsPreloading(true);

    const total = totalPages || Math.ceil(allNFTs.length / resultsPerPage);
    const pagesToLoad = [];

    for (let page = 1; page <= total; page++) {
      if (!allPagesData[page] && page !== currentPage) {
        pagesToLoad.push(page);
      }
    }

    try {
      const concurrency = 3;
      for (let i = 0; i < pagesToLoad.length; i += concurrency) {
        const batch = pagesToLoad.slice(i, i + concurrency);
        await Promise.all(batch.map(page => preloadPage(page)));
      }
      console.log('Alle Seiten wurden vorab geladen.');
    } catch (err) {
      console.error('Fehler beim Vorabladen der Seiten:', err);
    } finally {
      setIsPreloading(false);
    }
  };

  // Hilfsfunktion zum Vorabladen einer einzelnen Seite ohne die Anzeige zu ändern
  const preloadPage = async (page) => {
    if (allPagesData[page]) {
      return;
    }

    try {
      const tokenIdPromises = nftCollections.map(async (collection) => {
        const tokenIds = await getTokenIdsOfOwner(collection.address, account);
        return { collection, tokenIds };
      });

      const tokenIdResults = await Promise.all(tokenIdPromises);
      const allTokenIds = tokenIdResults.flatMap(result => result.tokenIds.map(tokenId => ({ collection: result.collection, tokenId })));
      const totalTokens = allTokenIds.length;
      setTotalPages(Math.ceil(totalTokens / resultsPerPage));
      setTotalBatches(Math.ceil(totalTokens / resultsPerPage));

      const start = (page - 1) * resultsPerPage;
      const end = page * resultsPerPage;
      const paginatedTokenIds = allTokenIds.slice(start, end);

      const nftPromises = paginatedTokenIds.map(async ({ collection, tokenId }) => {
        const nft = await fetchSingleNFT(collection.address, marketplace, tokenId);
        return {
          ...nft,
          collectionName: getCollectionName(collection.address) // Hinzufügen des collectionName-Feldes
        };
      });

      const nfts = await Promise.all(nftPromises);

      const uniqueNFTs = nfts.filter(nft => 
        nft && 
        !allPagesData[page]?.some(existingNft => 
          existingNft.tokenId === nft.tokenId && 
          existingNft.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase()
        )
      );

      setAllPagesData(prevData => ({
        ...prevData,
        [page]: uniqueNFTs
      }));

      setLoadedPages(prev => prev + 1);
    } catch (err) {
      console.error(`Error preloading page ${page}:`, err);
    }
  };

  // Starte das Vorladen der restlichen Seiten, sobald die aktuelle Seite geladen ist
  useEffect(() => {
    if (allPagesData[currentPage] && !isPreloading) {
      preloadPages();
    }
  }, [allPagesData, currentPage, isPreloading, resultsPerPage]);

  // Caching der Benutzernamen
  const fetchUserNames = async () => {
    if (!marketplace) return;

    const owners = Array.from(new Set(allNFTs.map(nft => nft.owner.toLowerCase())));
    const names = { ...userNames };

    const newOwners = owners.filter(owner => !userCache.current[owner]);

    const namePromises = newOwners.map(async (owner) => {
      try {
        const name = await getUserName(owner, marketplace);
        userCache.current[owner] = name || owner;
      } catch {
        userCache.current[owner] = owner;
      }
    });

    await Promise.all(namePromises);

    owners.forEach(owner => {
      names[owner] = userCache.current[owner];
    });

    setUserNames(names);
  };

  // Berechnung des Fortschritts
  useEffect(() => {
    if (totalPages > 0) {
      setProgressPercentage((loadedPages / totalPages) * 100);
    }
  }, [loadedPages, totalPages]);

  // Memoization für die vollständige Liste aller geladenen NFTs
  const allLoadedNFTs = useMemo(() => {
    return Object.values(allPagesData).flat();
  }, [allPagesData]);

  // Aktualisierung von ownedCollections basierend auf allLoadedNFTs
  useEffect(() => {
    const uniqueCollections = [...new Set(allLoadedNFTs.map(nft => getCollectionName(nft.contractAddress)))];
    setOwnedCollections(uniqueCollections);
  }, [allLoadedNFTs]);

  // Memoization für die gefilterte Liste der NFTs
  const filteredNFTs = useMemo(() => {
    return allLoadedNFTs.filter(nft => {
      const matchesSearchQuery =
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCollectionName(nft.contractAddress).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAvailability = filters.availability.length === 0 || (
        (filters.availability.includes('LISTED') && parseFloat(nft.price) > 0) ||
        (filters.availability.includes('NOT LISTED') && parseFloat(nft.price) === 0)
      );

      const collection = nftCollections.find(col => col.address.toLowerCase() === nft.contractAddress.toLowerCase());
      if (!collection) {
        console.warn(`No collection found for address: ${nft.contractAddress}`);
      }

      const matchesArtist = filters.artist.length === 0 || (collection && filters.artist.includes(collection.artist));
      const matchesArtwork = filters.artwork.length === 0 || (collection && filters.artwork.includes(collection.name));

      return matchesSearchQuery && matchesAvailability && matchesArtist && matchesArtwork;
    });
  }, [allLoadedNFTs, searchQuery, filters]);

  // Berechne die Gesamtanzahl der gefilterten Seiten
  const totalFilteredPages = useMemo(() => {
    return Math.ceil(filteredNFTs.length / resultsPerPage) || 1;
  }, [filteredNFTs.length, resultsPerPage]);

  // Berechne die NFTs für die aktuelle Seite basierend auf den gefilterten NFTs
  const currentNFTs = useMemo(() => {
    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    return filteredNFTs.slice(start, end);
  }, [filteredNFTs, currentPage, resultsPerPage]);

  // Setze die aktuelle Seite auf 1, wenn Filter oder Suchabfrage geändert werden
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  // Handhabung der Seitennavigation
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadPage(newPage);
  };

  // Überprüfen, ob die Adresse in den Künstler-Wallets ist
  const isAddressInArtistWallets = () => {
    return artistwalletAddresses.some(walletAddress => walletAddress.toLowerCase() === account.toLowerCase());
  };

  // useEffect zur Überwachung von Änderungen im localStorage
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'results-per-page') {
        const newResults = event.newValue ? Number(event.newValue) : 30;
        setResultsPerPage(newResults);
        setCurrentPage(1); // Optional: Setze die aktuelle Seite zurück, wenn sich die Ergebnisse pro Seite ändern
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Debugging: Überprüfen auf Duplikate
  useEffect(() => {
    const seen = new Set();
    const duplicates = allLoadedNFTs.filter(nft => {
      const identifier = `${nft.contractAddress}-${nft.tokenId}`;
      if (seen.has(identifier)) {
        return true;
      }
      seen.add(identifier);
      return false;
    });
    if (duplicates.length > 0) {
      console.warn('Duplicate NFTs found:', duplicates);
    } else {
      console.log('No duplicates found in allLoadedNFTs.');
    }
  }, [allLoadedNFTs]);

  return (
    <div className="my-nfts">
      {!account && (
        <p className="error-message">Bitte verbinde deine Wallet, um deine NFTs anzuzeigen.</p>
      )}
      {account && (
        <div className='w100'>
          <div className='flex space-between w100 mt50 myNFTMainDivMedia'>
            {/* Filter- und Benutzerdaten Bereich */}
            <div className='w20 ButtonandFilterMedia'>
              <div className='UserData onlymedia flex center-ho'>
                <div className='ProfilePicture'>
                  <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
                </div>
                <h2 className='user-name-container flex center-ho'>
                  <h2 className='margin-0'>
                    {userName ? userName : <ShortenAddress address={account} />}
                  </h2>
                  <PlatinumUserCheck account={account} /> {/* Herz-Icon hinzufügen */}
                   {/* Bio anzeigen */}
  {ownsRequiredNFT && isAccountInLocalStorage && bio && (
    <p className='user-bio'>{bio}</p>
  )}
                </h2>
              </div>

 {/* Anzeige der Social-Media-Links, wenn die verbundene Wallet ein NFT-Besitzer ist */}
 {ownsRequiredNFT && isAccountInLocalStorage &&(
                <div className="social-media-links text-align-right mb30">
                  <h3 className='mt5 mb10 flex center-ho flex-end'><img src='/crown.png' className='platinum-icon mr5'></img>CONTACT</h3>
                  <div className='flex center-ho flex-end'>
                    {socialMediaLinks.twitter && (
                     <div>
                     <a href={`https://x.com/${socialMediaLinks.twitter}`} target="_blank" rel="noopener noreferrer">
                       <img src="/x.png" alt="X" className="social-icon" />
                     </a>
                   </div>
                    )}
                    {socialMediaLinks.instagram && (
                      <div className='ml20'>
                        <a href={`https://instagram.com/${socialMediaLinks.instagram}`} target="_blank" rel="noopener noreferrer">
                        <img src="/instagram.png" alt="Instagram" className="social-icon" />
                        </a>
                      </div>
                    )}
                    {socialMediaLinks.discord && (
                      <div className='ml20'>
                        <a href={`https://discord.gg/${socialMediaLinks.discord}`} target="_blank" rel="noopener noreferrer">
                        <img src="/discord.png" alt="Discord" className="social-icon" />
                        </a>
                      </div>
                    )}
                    {!socialMediaLinks.twitter && !socialMediaLinks.instagram && !socialMediaLinks.discord && (
                      <div>No information</div>
                    )}
                  </div>
                </div>
              )}

              {/* Hinweis anzeigen, wenn die verbundene Wallet kein NFT besitzt */}
              {!ownsRequiredNFT && connectedAccount && (
                <div className="no-access-message">
                  <p></p>
                </div>
              )}


              <MyNFTsFilter onFilterChange={setFilters} ownedCollections={ownedCollections} />
            </div>

            {/* Hauptinhalt Bereich */}
            <div className='w80 flex column ml20 w100media'>
              <div className='UserData OnlyDesktop flex center-ho space-between w95'>
                <div className='flex center-ho column flex-start'>
                  <div className='flex center-ho'>
                <div className='ProfilePicture'>
                  <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
                </div>
                <h2 className='user-name-container flex center-ho'>
                  <h2 className='margin-0'>
                    {userName ? userName : <ShortenAddress address={account} />}
                  </h2>
                  <PlatinumUserCheck account={account} /> {/* Herz-Icon hinzufügen */}
                </h2>
                </div>
                <div className='opacity-70 w50'>
                {ownsRequiredNFT && isAccountInLocalStorage && bio && (
                    <p className='user-bio text-align-left'>{bio}</p>
                  )}
                  </div>
                </div>


              </div>


              {/* Rest des Codes bleibt unverändert */}
              {/* Suchleiste */}
              <div className='flex center-ho w95 space-between'>
                <div className='w30 w100media'>
                  <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </div>

                {/* Paginierung */}
                {totalFilteredPages > 1 && (
                  <div className="custom-pagination">
                    <button 
                      className="custom-pagination-btn previous-btn"
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1 || loading}
                      aria-label="Vorherige Seite"
                    >
                      &lt; 
                    </button>
                    <span className="custom-pagination-info">
                      {currentPage} OF {totalFilteredPages}
                    </span>
                    <button 
                      className="custom-pagination-btn next-btn"
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalFilteredPages))}
                      disabled={currentPage === totalFilteredPages || loading}
                      aria-label="Nächste Seite"
                    >
                      &gt;
                    </button>
                  </div>
                )}

                {/* Fehleranzeige */}
                {error && (
                  <div className="error-message">
                    {error}
                    <button onClick={() => loadPage(currentPage)}>Erneut versuchen</button>
                  </div>
                )}
              </div>

              {/* Loading-GIF für die erste Seite */}
              {isFirstPageLoading && (
                <div className="loading-container flex centered mt150 mb150">
                  <LoadingSpinner
                    filled={false} 
                    textColor="currentColor" 
                    size={100} 
                    className="loading-gif"
                  />
                </div>
              )}

              {/* Fortschrittsbalken */}
              {(loading || isPreloading) && !isFirstPageLoading && (
                <div 
                  className="progress-bar-container mt10r" 
                  role="progressbar" 
                  aria-valuenow={progressPercentage} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                  <span className="progress-text">{`${Math.round(progressPercentage)}%`}</span>
                </div>
              )}

              {/* NFT-Anzeige */}
              <div className="nft-list-my">
                {!isFirstPageLoading && filteredNFTs.length === 0 ? (
                  <div className="no-nfts-container flex centered column">
                    <h2 className="no-nfts-message">No NFTs found...</h2>
                    <img src="/no-nft.png" alt="No NFTs" className="no-nfts-image" />
                  </div>
                ) : (
                  !isFirstPageLoading && currentNFTs.map(nft => (
                    <div key={`${nft.contractAddress}-${nft.tokenId}`} className="my-nft-card">
                      <Link to={`/collections/${nft.contractAddress.toLowerCase()}/${nft.tokenId}`}>

                        <div className='my-nft-image'>
                          <ImageWithLoading src={nft.image || '/default-nft.png'} alt={nft.name || 'Unnamed NFT'} />
                        </div>
                        <div className='text-align-left w95 pt12 My-nft-details-Div'>
                          <div>
                            <h3>{nft.name}</h3>
                            <div className='flex center-ho owner-note'>
                              <span className='s16 grey opacity-70 artistmynfts'>{getCollectionName(nft.contractAddress)}</span>
                            </div>
                          </div>
                          <div>
                            {Number(nft.price) === 0 ? (
                              <p>NOT LISTED</p>
                            ) : (
                              <p className='my-nftListed'>LISTED</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Entfernte Popups, die nicht mehr benötigt werden */}
    </div>
  );
};

export default UserNFTs;

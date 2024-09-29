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
// import RedeemPopup from '../components/RedeemPopup';

// **Definiere getCollectionName vor ihrer ersten Verwendung**
const getCollectionName = (address) => {
  const collection = nftCollections.find(col => col.address.toLowerCase() === address.toLowerCase());
  return collection ? collection.name : 'Unknown Collection';
};

const UserNFTs = () => {
  const { walletAddress } = useParams();
  const [account, setAccount] = useState(walletAddress?.toLowerCase() || '');
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

  const resultsPerPage = 30;
  const userCache = useRef({});

  // Initialisierung des Marktplatzes
  useEffect(() => {
    initializeMarketplace(setMarketplace, () => { /* Nicht benötigt */ });
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

  // Handhabung des Pause-Toggles
  const handlePauseToggle = async () => {
    try {
      if (isContractPausedState) {
        await unpauseContract(account, marketplace);
      } else {
        await pauseContract(account, marketplace);
      }
      setIsContractPausedState(!isContractPausedState);
    } catch (error) {
      console.error("Failed to toggle pause state:", error);
      setError("Fehler beim Umschalten des Vertragsstatus.");
    }
  };

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
      loadPage(currentPage);
      fetchUserNames();
    }
  }, [account, marketplace]);

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
        return nft;
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
        return nft;
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
  }, [allPagesData, currentPage, isPreloading]);

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
  }, [filteredNFTs.length]);

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
      <div className='ProfileBannerDiv'>
        <div className='ProfileBanner flex centered'>
          <img src={bannerPicture || '/placeholder-PFP-banner.png'} alt="Banner" />
        </div>
      </div>
      {!account && (
        <p className="error-message">Bitte verbinde deine Wallet, um deine NFTs anzuzeigen.</p>
      )}
      {account && (
        <div className='w100'>
          <div className='flex space-between w100 mt50 myNFTMainDivMedia'>
            {/* Filter- und Benutzerdaten Bereich */}
            <div className='w20 ButtonandFilterMedia'>
              <div className='UserData onlymedia'>
                <div className='ProfilePicture'>
                  <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
                </div>
                <h2>
                  {userName ? userName : <ShortenAddress address={account} />}
                </h2>
              </div>
              {/* Entfernte user-name-section Buttons */}
              {/* 
              <div className="user-name-section">
                <div className='flex column w80'>
                  <button className='ChangeNamebutton' onClick={() => setIsPopupOpen(true)}>CHANGE USERNAME</button>
                  <button className='ChangeProfilePicturebutton' onClick={() => setIsProfilePopupOpen(true)}>CHANGE PROFILE PICTURE</button>
                  {account.toLowerCase() === CONTRACT_OWNER_ADDRESS.toLowerCase() && (
                    <>
                      <button className='SetArtistWalletButton yellow' onClick={() => setIsArtistWalletPopupOpen(true)}>SET ARTIST WALLET</button>
                      <button className='PauseToggleButton alert-color' onClick={handlePauseToggle}>
                        {isContractPausedState ? 'UNPAUSE CONTRACT' : 'PAUSE CONTRACT'}
                      </button>
                    </>
                  )}
                  {isAddressInArtistWallets() && (
                    <>
                      <button className='CreatePollButton yellow' onClick={() => setIsCreatePollPopupOpen(true)}>CREATE POLL</button>
                      <button className='CreateBlogButton yellow' onClick={() => setIsBloglistpageOpen(true)}>CREATE BLOG ARTICLE</button>
                      <button className='SubmitCollectionButton yellow' onClick={() => setIsSubmitCollectionPopupOpen(true)}>SUBMIT COLLECTION</button>
                    </>
                  )}
                </div>
              </div>
              */}
              <MyNFTsFilter onFilterChange={setFilters} ownedCollections={ownedCollections} />
            </div>

            {/* Hauptinhalt Bereich */}
            <div className='w80 flex column ml20 w100media'>
              <div className='UserData OnlyDesktop'>
                <div className='ProfilePicture'>
                  <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
                </div>
                <h2>
                  {userName ? userName : <ShortenAddress address={account} />}
                </h2>
              </div>

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
                <div className="loading-container flex centered">
                  <img src="/loading.gif" alt="Loading" className="loading-gif" />
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
                          <img src={nft.image || '/default-nft.png'} alt={nft.name || 'Unnamed NFT'} />
                        </div>
                        <div className='text-align-left w95 pt12 My-nft-details-Div'>
                          <div>
                            <h3>{nft.name}</h3>
                            <div className='flex center-ho owner-note'>
                              <span>{getCollectionName(nft.contractAddress)}</span>
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

      {/* Popups */}
      {/* Entfernte Popups, die nicht mehr benötigt werden */}
      {/* 
      {isPopupOpen && (
        <UsernamePopup
          username={newUserName}
          setUsername={setNewUserName}
          handleSave={async () => {
            try {
              await changeUserName(account, newUserName, marketplace);
              setUserName(newUserName);
              setNewUserName('');
              setIsPopupOpen(false);
            } catch (error) {
              console.error("Failed to change username:", error);
              setError("Fehler beim Ändern des Benutzernamens.");
            }
          }}
          closePopup={() => setIsPopupOpen(false)}
        />
      )}
      {isProfilePopupOpen && (
        <ProfilePicturePopup
          nfts={allLoadedNFTs}
          handleSave={async (contractAddress, tokenId, imageUrl) => {
            try {
              await setProfilePicture(account, contractAddress, tokenId, imageUrl, marketplace);
              setProfilePictureState(imageUrl);
              setBannerPicture(imageUrl);
              setIsProfilePopupOpen(false);
            } catch (error) {
              console.error("Failed to set profile picture:", error);
              setError("Fehler beim Ändern des Profilbildes.");
            }
          }}
          closePopup={() => setIsProfilePopupOpen(false)}
        />
      )}
      */}
      {/* {isSubmitCollectionPopupOpen && (
        <SubmitCollectionPopup 
          isOpen={isSubmitCollectionPopupOpen} 
          onClose={() => setIsSubmitCollectionPopupOpen(false)} 
        />
      )}
      {isArtistWalletPopupOpen && (
        <SetArtistWalletPopup
          handleSave={async (contractAddress, artistWallet, artistFeePercent) => {
            try {
              if (!marketplace) throw new Error("Marketplace not initialized");
              await setArtistWallet(contractAddress, artistWallet, artistFeePercent, account, marketplace);
              console.log('Artist wallet and fee percentage set:', { contractAddress, artistWallet, artistFeePercent });
              setIsArtistWalletPopupOpen(false);
            } catch (error) {
              console.error("Failed to set artist wallet:", error);
              setError("Fehler beim Setzen der Künstler-Wallet.");
            }
          }}
          closePopup={() => setIsArtistWalletPopupOpen(false)}
        />
      )}
      {isCreatePollPopupOpen && (
        <CreatePoll onClose={() => setIsCreatePollPopupOpen(false)} />
      )}
      {isBloglistpageOpen && (
        <PopupContainer onClose={() => setIsBloglistpageOpen(false)}>
          <BlogListPage
            onClose={() => setIsBloglistpageOpen(false)}
            onSave={(newPost) => {
              console.log('New blog post:', newPost);
              setIsBloglistpageOpen(false);
            }}
          />
        </PopupContainer>
      )} */}
    </div>
  );
};

export default UserNFTs;

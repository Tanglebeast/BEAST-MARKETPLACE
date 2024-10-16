
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchSingleNFT,
  initializeMarketplace,
  getArtistWalletsAndFees,
  CONTRACT_OWNER_ADDRESS,
  setArtistWallet,
  refreshData,
  changeUserName,
  getUserName,
  getProfilePicture,
  setProfilePicture,
  pauseContract,
  unpauseContract,
  isContractPaused,
  getTokenIdsOfOwner,
  artistwalletAddresses,
  addProject,
  hasUserLikedCollection
} from '../components/utils';
import { nftCollections } from '../NFTCollections';
import '../styles/MyNFTs.css';
import ShortenAddress from '../components/ShortenAddress';
import UsernamePopup from '../components/UsernamePopup';
import ProfilePicturePopup from '../components/ProfilePicturePopup';
import SearchBar from '../components/SearchBar';
import MyNFTsFilter from '../components/MyNFTsFilter';
import SetArtistWalletPopup from '../components/SetartistWalletPopup';
import CreatePoll from '../UserGovernance/CreatePoll';
import BlogFormPopup from '../Blog/BlogFormPupup';
import BlogListPage from '../Blog/Bloglistpage';
import PopupContainer from '../Blog/BlogFormPupup';
import SubmitCollectionPopup from '../components/SubmitCollectionPopup';
import ImageWithLoading from '../components/ImageWithLoading';
import AddProjectPopup from '../components/AddProjectPopup';
import LoadingSpinner from '../Assets/loading-spinner';
import PlatinumUserCheck from '../PlatinumFunctions/PlatinumUserCheck';

// Importiere die notwendigen Funktionen
import { getProfile, updateProfile, removeProfile, isNFTHolder, getWatchlist } from '../PlatinumFunctions/PlatinumUtils';
import PlatinumProfilePopup from '../PlatinumFunctions/PlatinumProfilePopup'; // Popup-Komponente importieren

// Funktion zum Abrufen des Kollektion-Namens
const getCollectionName = (address) => {
  if (!address) {
    console.warn('getCollectionName wurde mit undefinierter Adresse aufgerufen.');
    return 'Unknown Collection';
  }

  const collection = nftCollections.find(col => col.address.toLowerCase() === address.toLowerCase());
  return collection ? collection.name : 'Unknown Collection';
};


// Funktion zum Abrufen der Ergebnisse pro Seite aus dem localStorage
const getSavedResultsPerPage = () => {
  const savedResults = localStorage.getItem('results-per-page');
  return savedResults ? Number(savedResults) : 30; // Standardwert ist 30
};

const MyNFTs = () => {
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstPageLoading, setIsFirstPageLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [profilePicture, setProfilePictureState] = useState('/placeholder-PFP-black.png');
  const [bannerPicture, setBannerPicture] = useState('/placeholder-PFP-banner.png');
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
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
  // const [totalPages, setTotalPages] = useState(1);
  // const [progressPercentage, setProgressPercentage] = useState(0);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [totalBatches, setTotalBatches] = useState(1);
  const [loadedBatches, setLoadedBatches] = useState(0);
  // const [allPagesData, setAllPagesData] = useState({});
  const [isPreloading, setIsPreloading] = useState(false);
  // const [loadedPages, setLoadedPages] = useState(0);
  const [isAddProjectPopupOpen, setIsAddProjectPopupOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('myNFTs');
  const [allPagesData, setAllPagesData] = useState({ myNFTs: {}, watchlist: {} });
const [totalPages, setTotalPages] = useState({ myNFTs: 1, watchlist: 1 });
const [loadedPages, setLoadedPages] = useState({ myNFTs: 0, watchlist: 0 });
const [progressPercentage, setProgressPercentage] = useState({ myNFTs: 0, watchlist: 0 });



  // Neue Zustandsvariablen für NFT-Besitz und Profilbearbeitung
  const [ownsRequiredNFT, setOwnsRequiredNFT] = useState(false); // Zustand für NFT-Besitz
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false); // Zustand für das Edit-Profile-Popup
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    twitter: '',
    instagram: '',
    discord: '',
    bio: ''
  }); // Zustand für die Social-Media-Links und Bio

  // Ersetzen der festen Zuweisung durch einen State, der den Wert aus localStorage liest
  const [resultsPerPage, setResultsPerPage] = useState(getSavedResultsPerPage());
  const userCache = useRef({});

  // Initialisierung des Marktplatzes
  useEffect(() => {
    initializeMarketplace(setMarketplace, () => { /* Nicht benötigt */ });
  }, []);

  // Überprüfen, ob der Benutzer ein NFT-Besitzer ist
  useEffect(() => {
    const checkNFTHolder = async () => {
      if (account) {
        try {
          const isHolder = await isNFTHolder(account);
          setOwnsRequiredNFT(isHolder);
        } catch (error) {
          console.error('Fehler bei der Überprüfung des NFT-Besitzes:', error);
        }
      }
    };
    checkNFTHolder();
  }, [account]);

  // Abrufen der Profilinformationen
  useEffect(() => {
    const fetchProfileData = async () => {
      if (ownsRequiredNFT && account) {
        try {
          const profile = await getProfile(account);
          setSocialMediaLinks(profile);
        } catch (error) {
          console.error('Fehler beim Abrufen der Profilinformationen:', error);
        }
      }
    };
    fetchProfileData();
  }, [ownsRequiredNFT, account]);

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

  const handleAddProject = async (projectName) => {
    try {
      const success = await addProject(projectName.trim()); // Verwende die addProject-Funktion aus utils
      if (success) {
        alert('Projekt erfolgreich hinzugefügt!');
        setIsAddProjectPopupOpen(false);
      } else {
        alert('Fehler beim Hinzufügen des Projekts.');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Projekts:', error);
      alert('Fehler beim Hinzufügen des Projekts.');
    }
  };

  // Initiales Laden der Benutzerdaten und NFTs
  useEffect(() => {
    if (account && marketplace) {
      getUserName(account, marketplace)
        .then(setUserName)
        .catch(() => setUserName(''));
      getProfilePicture(account, marketplace)
        .then(picture => {
          setProfilePictureState(picture || '/placeholder-PFP-black.png');
          setBannerPicture(picture || '/placeholder-PFP-banner.png');
        })
        .catch(() => {
          setProfilePictureState('/placeholder-PFP-black.png');
          setBannerPicture('/placeholder-PFP-banner.png');
        });
  
      // Rufen Sie die richtige Ladefunktion basierend auf selectedMenu auf
      if (selectedMenu === 'myNFTs') {
        loadOwnedNFTs(currentPage);
      } else if (selectedMenu === 'watchlist') {
        loadWatchlistNFTs(currentPage);
      }
  
      fetchUserNames();
    }
  }, [account, marketplace, selectedMenu, currentPage, resultsPerPage]);

  const loadOwnedNFTs = async (page) => {
    if (allPagesData.myNFTs[page]) {
      // Keine Notwendigkeit, setAllNFTs hier zu verwenden, da allLoadedNFTs alle Seiten berücksichtigt
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
      setTotalPages(prev => ({ ...prev, myNFTs: computedTotalPages }));
  
      const start = (page - 1) * resultsPerPage;
      const end = page * resultsPerPage;
      const paginatedTokenIds = allTokenIds.slice(start, end);
  
      const nftPromisesPage = paginatedTokenIds.map(async ({ collection, tokenId }) => {
        const nft = await fetchSingleNFT(collection.address, marketplace, tokenId);
        return {
          ...nft,
          collectionName: getCollectionName(collection.address)
        };
      });
  
      const nfts = await Promise.all(nftPromisesPage);
      const uniqueNFTs = nfts.filter(nft => 
        nft && 
        !allPagesData.myNFTs[page]?.some(existingNft => 
          existingNft.tokenId === nft.tokenId && 
          existingNft.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase()
        )
      );
  
      setAllPagesData(prevData => ({
        ...prevData,
        myNFTs: {
          ...prevData.myNFTs,
          [page]: uniqueNFTs
        }
      }));
  
      // `allLoadedNFTs` wird automatisch durch `allPagesData` aktualisiert
      setLoadedPages(prev => ({ ...prev, myNFTs: prev.myNFTs + 1 }));
  
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
  
  

  useEffect(() => {
    if (account && marketplace) {
      if (selectedMenu === 'myNFTs') {
        loadOwnedNFTs(currentPage);
      } else if (selectedMenu === 'watchlist') {
        loadWatchlistNFTs(currentPage);
      }
      fetchUserNames();
    }
  }, [account, marketplace, selectedMenu, currentPage, resultsPerPage]);


  const loadWatchlistNFTs = async (page) => {
    if (allPagesData.watchlist[page]) {
      setAllNFTs(allPagesData.watchlist[page]);
      setLoadedPages(prev => ({ ...prev, watchlist: prev.watchlist < 1 ? 1 : prev.watchlist }));
      if (isFirstPageLoading) {
        setIsFirstPageLoading(false); // Ladezeichen entfernen
      }
      return;
    }
  
    setLoading(true);
    setError(null);
    try {
      const watchlist = await getWatchlist(account);
      const allTokenIds = watchlist.map(item => ({ contract: { address: item.contractAddress }, tokenId: item.tokenId }));
  
      const totalTokens = allTokenIds.length;
      const computedTotalPages = Math.ceil(totalTokens / resultsPerPage);
      setTotalPages(prev => ({ ...prev, watchlist: computedTotalPages }));
      setTotalBatches(computedTotalPages);
  
      const start = (page - 1) * resultsPerPage;
      const end = page * resultsPerPage;
      const paginatedTokenIds = allTokenIds.slice(start, end);
  
      const nftPromises = paginatedTokenIds.map(async ({ contract, tokenId }) => {
        const nft = await fetchSingleNFT(contract.address, marketplace, tokenId);
        return {
          ...nft,
          collectionName: getCollectionName(contract.address)
        };
      });
  
      const nfts = await Promise.all(nftPromises);
  
      const uniqueNFTs = nfts.filter(nft =>
        nft &&
        !allPagesData.watchlist[page]?.some(existingNft =>
          existingNft.tokenId === nft.tokenId &&
          existingNft.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase()
        )
      );
  
      setAllPagesData(prevData => ({
        ...prevData,
        watchlist: {
          ...prevData.watchlist,
          [page]: uniqueNFTs
        }
      }));
  
      setAllNFTs(uniqueNFTs);
      setLoadedPages(prev => ({ ...prev, watchlist: 1 }));
  
      if (isFirstPageLoading) {
        setIsFirstPageLoading(false); // Ladezeichen entfernen
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Fehler beim Laden der NFTs. Bitte versuche es später erneut.');
      if (isFirstPageLoading) {
        setIsFirstPageLoading(false); // Ladezeichen entfernen
      }
    } finally {
      setLoading(false);
    }
  };
  
  

 

  // Funktion zum Vorabladen aller Seiten im Hintergrund
  const preloadPages = async () => {
    if (isPreloading) return; // Verhindere mehrfaches Vorabladen
    setIsPreloading(true);
  
    const total = totalPages[selectedMenu] || Math.ceil(allNFTs.length / resultsPerPage);
    const pagesToLoad = [];
  
    for (let page = 1; page <= total; page++) {
      if (!allPagesData[selectedMenu][page] && page !== currentPage) { // Vermeide das erneute Laden der aktuellen Seite
        pagesToLoad.push(page);
      }
    }
  
    try {
      // Begrenze die Anzahl der gleichzeitig geladenen Seiten, z.B. 3 gleichzeitig
      const concurrency = 3;
      for (let i = 0; i < pagesToLoad.length; i += concurrency) {
        const batch = pagesToLoad.slice(i, i + concurrency);
        await Promise.all(batch.map(page => preloadPage(page)));
      }
      console.log('Alle Seiten wurden vorab geladen.');
    } catch (err) {
      console.error('Fehler beim Vorabladen der Seiten:', err);
      // Du kannst entscheiden, wie du mit Fehlern umgehen möchtest, z.B. erneut versuchen oder Benutzer benachrichtigen
    } finally {
      setIsPreloading(false);
    }
  };
  
  // Hilfsfunktion zum Vorabladen einer einzelnen Seite ohne die Anzeige zu ändern
  const preloadPage = async (page) => {
    // Überprüfe, ob die Daten für diese Seite bereits geladen wurden
    if (allPagesData[selectedMenu][page]) {
      return;
    }
  
    try {
      // Sammle alle Token IDs für alle Kollektionen
      const tokenIdPromises = nftCollections.map(async (collection) => {
        const tokenIds = await getTokenIdsOfOwner(collection.address, account);
        return { collection, tokenIds };
      });
  
      const tokenIdResults = await Promise.all(tokenIdPromises);
      console.log('Token ID Results:', tokenIdResults);
  
      // Flache die Token-IDs und berechne die Gesamtanzahl
      const allTokenIds = tokenIdResults.flatMap(result => result.tokenIds.map(tokenId => ({ collection: result.collection, tokenId })));
      const totalTokens = allTokenIds.length;
      setTotalPages(prev => ({ 
        ...prev, 
        [selectedMenu]: Math.ceil(totalTokens / resultsPerPage) 
      }));
      setTotalBatches(Math.ceil(totalTokens / resultsPerPage));
  
      // Berechne den Start- und Endindex für die Seite
      const start = (page - 1) * resultsPerPage;
      const end = page * resultsPerPage;
      const paginatedTokenIds = allTokenIds.slice(start, end);
      console.log('Paginated Token IDs:', paginatedTokenIds);
  
      // Lade die NFTs für die Seite
      const nftPromisesPage = paginatedTokenIds.map(async ({ collection, tokenId }) => {
        const nft = await fetchSingleNFT(collection.address, marketplace, tokenId);
        return {
          ...nft,
          collectionName: getCollectionName(collection.address) // Hinzufügen des collectionName-Feldes
        };
      });
  
      const nfts = await Promise.all(nftPromisesPage);
      console.log('Fetched NFTs for preloading:', nfts);
  
      // Filtere Duplikate und validiere NFTs
      const uniqueNFTs = nfts.filter(nft => 
        nft && 
        !allPagesData[selectedMenu][page]?.some(existingNft => 
          existingNft.tokenId === nft.tokenId && 
          existingNft.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase()
        )
      );
      console.log('Unique NFTs to preload:', uniqueNFTs);
  
      // Speichere die NFTs für diese Seite im allPagesData unter dem aktuellen Menü
      setAllPagesData(prevData => ({
        ...prevData,
        [selectedMenu]: {
          ...prevData[selectedMenu],
          [page]: uniqueNFTs
        }
      }));
  
      // Inkrementiere die Anzahl der geladenen Seiten
      setLoadedPages(prev => ({
        ...prev,
        [selectedMenu]: prev[selectedMenu] + 1
      }));
    } catch (err) {
      console.error(`Error preloading page ${page}:`, err);
      // Hier könntest du zusätzliche Fehlerbehandlungen einfügen
    }
  };
  
  

  // Starte das Vorladen der restlichen Seiten, sobald die aktuelle Seite geladen ist
  useEffect(() => {
    if (allPagesData[selectedMenu][currentPage] && !isPreloading) {
      preloadPages();
    }
  }, [allPagesData, selectedMenu, currentPage, isPreloading, resultsPerPage]);
  
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
// Berechnung des Fortschritts
useEffect(() => {
  if (totalPages[selectedMenu] > 0) {
    setProgressPercentage(prev => ({
      ...prev,
      [selectedMenu]: (loadedPages[selectedMenu] / totalPages[selectedMenu]) * 100
    }));
  }
}, [loadedPages, totalPages, selectedMenu]);

  

  // Memoization für die vollständige Liste aller geladenen NFTs
  const allLoadedNFTs = useMemo(() => {
    return Object.values(allPagesData[selectedMenu] || {}).flat();
  }, [allPagesData, selectedMenu]);
  
  

  // Neuer useEffect zur Aktualisierung von ownedCollections basierend auf allLoadedNFTs
  useEffect(() => {
    const uniqueCollections = [...new Set(allLoadedNFTs.map(nft => getCollectionName(nft.contractAddress)))];
    console.log('Unique Owned Collections:', uniqueCollections); // Debugging
    setOwnedCollections(uniqueCollections);
  }, [allLoadedNFTs]);

  // Memoization für die gefilterte Liste der NFTs
  const filteredNFTs = useMemo(() => {
    return allLoadedNFTs.filter(nft => {
      if (!nft) {
        console.warn('Encountered undefined NFT:', nft);
        return false;
      }
  
      const nftName = nft.name ? nft.name.toLowerCase() : '';
      const contractAddress = nft.contractAddress ? nft.contractAddress.toLowerCase() : '';
  
      const searchLower = searchQuery.toLowerCase();
  
      const matchesSearchQuery =
        nftName.includes(searchLower) ||
        getCollectionName(contractAddress).toLowerCase().includes(searchLower);
  
      const matchesAvailability = filters.availability.length === 0 || (
        (filters.availability.includes('LISTED') && parseFloat(nft.price) > 0) ||
        (filters.availability.includes('NOT LISTED') && parseFloat(nft.price) === 0)
      );
  
      const collection = nftCollections.find(col => col.address.toLowerCase() === contractAddress);
      if (!collection) {
        console.warn(`No collection found for address: ${nft.contractAddress}`);
      }
  
      const matchesArtist = filters.artist.length === 0 || (collection && filters.artist.includes(collection.artist));
      const matchesArtwork = filters.artwork.length === 0 || (collection && filters.artwork.includes(collection.name));
  
      const isMatch = matchesSearchQuery && matchesAvailability && matchesArtist && matchesArtwork;
      if (!isMatch) {
        console.log(`NFT ${nft.tokenId} from ${nft.contractAddress} gefiltert.`);
      }
      return isMatch;
    });
  }, [allLoadedNFTs, searchQuery, filters]);
  

  // Berechne die Gesamtanzahl der gefilterten Seiten
  const totalFilteredPages = useMemo(() => {
    const totalNFTs = filteredNFTs.length;
    const pages = Math.ceil(totalNFTs / resultsPerPage) || 1;
    return pages;
  }, [filteredNFTs.length, resultsPerPage]);

  console.log('Total Filtered Pages:', totalFilteredPages);

  useEffect(() => {
    console.log('Filtered NFTs Length:', filteredNFTs.length);
  }, [filteredNFTs]);
  

  useEffect(() => {
    console.log('All Loaded NFTs Length:', allLoadedNFTs.length);
  }, [allLoadedNFTs]);
  
  

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
    if (selectedMenu === 'myNFTs') {
      loadOwnedNFTs(newPage);
    } else if (selectedMenu === 'watchlist') {
      loadWatchlistNFTs(newPage);
    }
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

  return (
    <div className="my-nfts">
      {/* <div className='ProfileBannerDiv'>
        <div className='ProfileBanner flex centered'>
          <img src={bannerPicture || '/placeholder-PFP-banner.png'} alt="Banner" />
        </div>
      </div> */}
      {!account && (
        <p className="error-message">No wallet connected.</p>
      )}
      {account && (
        <div className='w100'>
          <div className='flex space-between w100 mt50 myNFTMainDivMedia'>
            {/* Filter- und Benutzerdaten Bereich */}
            <div className='w20 ButtonandFilterMedia'>
            <div className='UserData onlymedia flex center-ho mediacolumn2'>
                <div className='ProfilePicture'>
                  <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
                </div>
                <div className='user-name-container flex center-ho'>
  <h2 className='margin-0'>
    {userName ? userName : <ShortenAddress address={account} />}
  </h2>
  <PlatinumUserCheck account={account} /> {/* Herz-Icon hinzufügen */}
</div>

              {/* Bio anzeigen */}
              {ownsRequiredNFT && socialMediaLinks.bio && (
                    <p className='user-bio'>{socialMediaLinks.bio}</p>
                  )}
              </div>



   {/* Anzeige der Social-Media-Links */}
   {ownsRequiredNFT && (
                <div className="social-media-links text-align-right mb30">
                  <h3 className='mt5 mb5 flex center-ho flex-end'><img src='/crown.png' className='platinum-icon mr5'></img>CONTACT</h3>
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
                      <li>No social medias.</li>
                    )}
                  </div>
                </div>
              )}





              <div className="user-name-section">
                <div className='flex column w80'>
                  <button className='ChangeNamebutton white' onClick={() => setIsPopupOpen(true)}>CHANGE USERNAME</button>
                  <button className='ChangeProfilePicturebutton white' onClick={() => setIsProfilePopupOpen(true)}>CHANGE PROFILE PICTURE</button>

              {/* "EDIT PROFILE"-Button für NFT-Besitzer */}
              {ownsRequiredNFT && (
                <button className='ChangeProfilePicturebutton white flex centered' onClick={() => setIsEditProfilePopupOpen(true)}>EDIT PROFILE<img src='/crown.png' className='platinum-icon'></img></button>
              )}

                  {/* <button className='ChangeProfilePicturebutton' onClick={() => setIsRedeemPopupOpen(true)}>REDEEM ARTWORK</button> */}

                  {account.toLowerCase() === CONTRACT_OWNER_ADDRESS.toLowerCase() && (
                    <>
                      <button className='SetArtistWalletButton yellow white' onClick={() => setIsAddProjectPopupOpen(true)}>ADD PROJECT NAME</button>
                      <button className='SetArtistWalletButton yellow white' onClick={() => setIsArtistWalletPopupOpen(true)}>SET ARTIST WALLET</button>
                      <button className='PauseToggleButton alert-color white' onClick={handlePauseToggle}>
                        {isContractPausedState ? 'UNPAUSE CONTRACT' : 'PAUSE CONTRACT'}
                      </button>
                    </>
                  )}
                  {isAddressInArtistWallets() && (
                    <>
                      <button className='CreatePollButton yellow white' onClick={() => setIsCreatePollPopupOpen(true)}>CREATE POLL</button>
                      {/* <button className='CreateBlogButton yellow' onClick={() => setIsBloglistpageOpen(true)}>CREATE BLOG ARTICLE</button>
                      <button className='SubmitCollectionButton yellow' onClick={() => setIsSubmitCollectionPopupOpen(true)}>SUBMIT COLLECTION</button> */}
                    </>
                  )}
                </div>
              </div>

              <MyNFTsFilter onFilterChange={setFilters} ownedCollections={ownedCollections} />
            </div>

            {/* Hauptinhalt Bereich */}
            <div className='w80 flex column ml20 w100media'>
            <div className='UserData OnlyDesktop flex center-ho flex column text-align-left flex-start'>
              <div className='flex center-ho'>
                <div className='ProfilePicture'>
                  <img src={profilePicture || '/placeholder-PFP-black.png'} alt="Profile" />
                </div>
                <div className='user-name-container flex center-ho'>
  <h2 className='margin-0'>
    {userName ? userName : <ShortenAddress address={account} />}
  </h2>
  <PlatinumUserCheck account={account} /> {/* Herz-Icon hinzufügen */}
</div>

              </div>
              {/* Bio anzeigen */}
              {ownsRequiredNFT && socialMediaLinks.bio && (
                    <p className='user-bio w50 opacity-70'>{socialMediaLinks.bio}</p>
                  )}
              </div>

              {/* Suchleiste */}
              <div className='flex center-ho w95 space-between'>
                <div className='w30 w100media mt5'>
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
    <button onClick={() => selectedMenu === 'myNFTs' ? loadOwnedNFTs(currentPage) : loadWatchlistNFTs(currentPage)}>
      Erneut versuchen
    </button>
  </div>
)}

              </div>

              {ownsRequiredNFT && (
  <div className="menu-myaccount mediacenter">
<button
  onClick={() => {
    setSelectedMenu('myNFTs');
    setCurrentPage(1);
    setIsFirstPageLoading(true); // Ladezeichen anzeigen
  }}
  className={selectedMenu === 'myNFTs' ? 'active' : ''}
>
  <h3>My NFTs</h3>
</button>
<button
  onClick={() => {
    setSelectedMenu('watchlist');
    setCurrentPage(1);
    setIsFirstPageLoading(true); // Ladezeichen anzeigen
  }}
  className={selectedMenu === 'watchlist' ? 'active' : ''}
>
  <div className='flex center-ho'>
    <img src='/crown.png' className='platinum-icon mr5' alt="Crown Icon" />
    <h3>Watchlist</h3>
  </div>
</button>
  </div>
)}




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
            {/* Fortschrittsbalken */}
{(loading || isPreloading) && !isFirstPageLoading && (
  <div 
    className="progress-bar-container mt10r" 
    role="progressbar" 
    aria-valuenow={progressPercentage[selectedMenu]} 
    aria-valuemin="0" 
    aria-valuemax="100"
  >
    <div className="progress-bar" style={{ width: `${progressPercentage[selectedMenu]}%` }}></div>
    {/* <span className="progress-text">{`${Math.round(progressPercentage[selectedMenu])}%`}</span> */}
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
                  !isFirstPageLoading && currentNFTs.map(nft => {
                    console.log('Rendering NFT:', nft); // Debugging-Log
                    return (
                      <div key={`${nft.contractAddress}-${nft.tokenId}`} className="my-nft-card">
                        <Link to={`/collections/${nft.contractAddress}/${nft.tokenId}`}>
                          <div className='my-nft-image'>
                            <ImageWithLoading src={nft.image || '/default-nft.png'} alt={nft.name || 'Unnamed NFT'} />
                          </div>
                          <div className='text-align-left w95 pt12 My-nft-details-Div'>
                            <div>
                              <h3>{nft.name}</h3>
                              <div className='flex center-ho owner-note'>
                                <span className='s16 grey opacity-70 artistmynfts'>{getCollectionName(nft.contractAddress)}</span>
                              </div>
                              {/* <div className='flex center-ho grey'>
                                <span className='mt5'>Position: {nft.position}</span>
                              </div> */}
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
                    );
                  })
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Popups */}
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
      {isSubmitCollectionPopupOpen && (
        <SubmitCollectionPopup 
          isOpen={isSubmitCollectionPopupOpen} 
          onClose={() => setIsSubmitCollectionPopupOpen(false)} 
        />
      )}

      {isAddProjectPopupOpen && (
        <AddProjectPopup
          isOpen={isAddProjectPopupOpen}
          onClose={() => setIsAddProjectPopupOpen(false)}
          handleSave={handleAddProject}
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
      {/* {isRedeemPopupOpen && (
        <RedeemPopup
          isOpen={isRedeemPopupOpen}
          onClose={() => setIsRedeemPopupOpen(false)}
          account={account}
        />
      )} */}
        {isEditProfilePopupOpen && (
        <PlatinumProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={() => setIsEditProfilePopupOpen(false)}
          socialMediaLinks={socialMediaLinks}
          setSocialMediaLinks={setSocialMediaLinks}
        />
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
      )}
    </div>
  );
};

export default MyNFTs;

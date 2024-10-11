import React, { useState, useEffect } from 'react';  
import { useParams, Link } from 'react-router-dom';
import { 
    fetchAllNFTs, 
    initializeMarketplace, 
    getNFTDetails, 
    getUserName, 
    getMaxSupply, 
    fetchCollectionStats,
    likeCollection,
    unlikeCollection,
    getCollectionLikes,
    hasUserLikedCollection,
    fetchSingleNFT, // Stellen Sie sicher, dass diese Funktion importiert ist
} from '../components/utils';
import SearchBar from '../components/SearchBar';
import { nftCollections } from '../NFTCollections';
import CollectionDetailCard from '../components/CollectionDetailCard';
import '../styles/CollectionDetail.css';
import CollectionDetailFilter from '../components/CollectionDetailFilter';
import HeartIcon from '../Assets/HeartIcon';
import CurrencyBeastIcon from '../Assets/currency-beast';
import CurrencyIotaIcon from '../Assets/currency-iota';
import LoadingSpinner from '../Assets/loading-spinner';

const CollectionNFTs = () => {
    const { collectionaddress } = useParams();
    const [account, setAccount] = useState(localStorage.getItem('account') || '');
    const [marketplace, setMarketplace] = useState(null);
    const [allNFTs, setAllNFTs] = useState([]);
    const [nftsForSale, setNftsForSale] = useState([]); // Neuer Zustand für nftsForSale
    const [loading, setLoading] = useState(true);
    const [collectionName, setCollectionName] = useState('');
    const [collectionDescription, setCollectionDescription] = useState('');
    const [currencyIcon, setCurrencyIcon] = useState('');
    const [bannerImage, setBannerImage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ price: [], availability: [], attributes: {} });
    const [userNames, setUserNames] = useState({});
    const [maxSupply, setMaxSupply] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadedBatches, setLoadedBatches] = useState(1);
    const [totalBatches, setTotalBatches] = useState(1);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [allAttributes, setAllAttributes] = useState({});
    const [nativeVolume, setNativeVolume] = useState('0');
    const [specialTokenVolume, setSpecialTokenVolume] = useState('0');

    // Neue Zustände für Likes
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    // State für Ergebnisse pro Seite
    const [resultsPerPage, setResultsPerPage] = useState(getSavedResultsPerPage());

    // Funktion zum Laden der Ergebnisse pro Seite aus dem localStorage
    function getSavedResultsPerPage() {
      const savedResults = localStorage.getItem('results-per-page');
      return savedResults ? Number(savedResults) : 30; // Standardwert ist 30
    }

    // Effekt zum Überwachen von Änderungen in localStorage
    useEffect(() => {
      const handleStorageChange = () => {
        const savedResults = getSavedResultsPerPage();
        setResultsPerPage(savedResults);
        setCurrentPage(1); // Optional: Setze die aktuelle Seite zurück, wenn sich die Ergebnisse pro Seite ändern
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);

    useEffect(() => {
        initializeMarketplace(setMarketplace, async (marketplace) => {
            // Code nicht mehr benötigt
        });
    }, [collectionaddress]);

    useEffect(() => {
        const fetchNFTs = async () => {
            if (!marketplace) return;
            setLoading(true);
            setAllNFTs([]); // Reset der NFTs bei Adressänderung
            setNftsForSale([]); // Reset nftsForSale
            setLoadedBatches(0); // Reset der geladenen Seiten
            setTotalBatches(1); // Reset der Gesamtchargen

            // Zuerst NFTs zum Verkauf abrufen
            const nftsForSaleRaw = await marketplace.methods.getNFTsForSale().call();
            const nftsForSaleFiltered = nftsForSaleRaw.filter(nft => nft.contractAddress.toLowerCase() === collectionaddress.toLowerCase());

            // Detaillierte Daten für nftsForSale abrufen
            const nftsForSaleDetails = await Promise.all(nftsForSaleFiltered.map(async (nft) => {
                const nftData = await fetchSingleNFT(nft.contractAddress, marketplace, nft.tokenId);
                return nftData;
            }));

            setNftsForSale(nftsForSaleDetails);

            // Jetzt alle NFTs abrufen
            const supply = await getMaxSupply(collectionaddress);
            const totalSupply = Number(supply);
            const batches = Math.ceil(totalSupply / resultsPerPage);
            setTotalBatches(batches);

            // Laden der ersten Charge
            const firstBatch = await fetchAllNFTs(collectionaddress, marketplace, 0, resultsPerPage);
            const detailedFirstBatch = await Promise.all(firstBatch.map(async (nft) => {
                const details = await getNFTDetails(nft.contractAddress, nft.tokenId, marketplace);
                return { ...nft, ...details };
            }));

            // NFTs zum Verkauf von allen NFTs ausschließen
            const nftsForSaleIds = nftsForSaleDetails.map(nft => `${nft.contractAddress}-${nft.tokenId}`);
            const allNFTsFiltered = detailedFirstBatch.filter(nft => !nftsForSaleIds.includes(`${nft.contractAddress}-${nft.tokenId}`));

            setAllNFTs(allNFTsFiltered);
            setLoadedBatches(1);
            setLoading(false);

            setMaxSupply(totalSupply);

            // Hintergrundladen der restlichen Chargen
            setBackgroundLoading(true);

            for (let batch = 1; batch < batches; batch++) {
                const start = batch * resultsPerPage;
                const limit = resultsPerPage;

                const nfts = await fetchAllNFTs(collectionaddress, marketplace, start, limit);
                const detailedNFTs = await Promise.all(nfts.map(async (nft) => {
                    const details = await getNFTDetails(nft.contractAddress, nft.tokenId, marketplace);
                    return { ...nft, ...details };
                }));

                // NFTs zum Verkauf von den geladenen NFTs ausschließen
                const batchNFTsFiltered = detailedNFTs.filter(nft => !nftsForSaleIds.includes(`${nft.contractAddress}-${nft.tokenId}`));

                setAllNFTs(prevNFTs => {
                    const combinedNFTs = [...prevNFTs, ...batchNFTsFiltered];
                    const uniqueNFTs = combinedNFTs.filter((nft, index, self) =>
                        index === self.findIndex((t) => (
                            t.tokenId === nft.tokenId && t.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase()
                        ))
                    );
                    return uniqueNFTs;
                });
                setLoadedBatches(batch + 1);
            }

            setBackgroundLoading(false);
        };

        if (collectionaddress && marketplace) {
            fetchNFTs();
            const collection = nftCollections.find(col => col.address.toLowerCase() === collectionaddress.toLowerCase());
            if (collection) {
                setCollectionName(collection.name);
                setCollectionDescription(collection.description);
                setCurrencyIcon(collection.currency);
                setBannerImage(collection.Collectionbanner);
            }

            // Abrufen der Volumendaten für die spezifische Kollektion
            const fetchStats = async () => {
                const stats = await fetchCollectionStats(marketplace, collectionaddress);
                if (stats) {
                    setNativeVolume(stats.nativeVolume);
                    setSpecialTokenVolume(stats.specialTokenVolume);
                }
            };
            fetchStats();
        }
    }, [collectionaddress, marketplace, resultsPerPage]); // Füge resultsPerPage als Abhängigkeit hinzu

    // Sammeln aller Attribute aus den NFTs mit Zählung
    useEffect(() => {
        const combinedNFTs = [...nftsForSale, ...allNFTs];
        if (combinedNFTs.length > 0) {
            const attributes = {};
            combinedNFTs.forEach(nft => {
                if (nft.attributes) {
                    nft.attributes.forEach(attr => {
                        const traitType = attr.trait_type;
                        const value = attr.value;
                        if (!attributes[traitType]) {
                            attributes[traitType] = {};
                        }
                        if (!attributes[traitType][value]) {
                            attributes[traitType][value] = 0;
                        }
                        attributes[traitType][value]++;
                    });
                }
            });
            setAllAttributes(attributes);
        }
    }, [nftsForSale, allNFTs]);

    const fetchUserNames = async () => {
        if (!marketplace) return;
        
        const combinedNFTs = [...nftsForSale, ...allNFTs];
        const owners = Array.from(new Set(combinedNFTs.map(nft => nft.owner.toLowerCase())));
        const names = {};
        
        for (const owner of owners) {
            try {
                const name = await getUserName(owner, marketplace);
                names[owner] = name || owner;
            } catch (error) {
                names[owner] = owner;
            }
        }
        
        setUserNames(names);
    };
    
    useEffect(() => {
        fetchUserNames();
    }, [marketplace, nftsForSale, allNFTs]);

    // Setzt die aktuelle Seite zurück, wenn sich die Filter ändern
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchQuery, resultsPerPage]); // Füge resultsPerPage als Abhängigkeit hinzu

    const getUniqueOwners = () => {
        const combinedNFTs = [...nftsForSale, ...allNFTs];
        const owners = combinedNFTs.map(nft => nft.owner.toLowerCase());
        return new Set(owners).size;
    };

    const getFloorPrice = () => {
        const prices = nftsForSale
            .filter(nft => nft.price && parseFloat(nft.price) > 0)
            .map(nft => parseFloat(nft.price));
        return prices.length > 0 ? Math.min(...prices) : '0';
    };

    const getFilteredNFTs = (nftsForSale, allNFTs, searchQuery, sortByPrice) => {
        // Apply filters to nftsForSale and allNFTs separately
        let filteredNFTsForSale = [...nftsForSale];
        let filteredAllNFTs = [...allNFTs];

        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            filteredNFTsForSale = filteredNFTsForSale.filter(nft => 
                nft.name.toLowerCase().includes(searchLower) ||
                nft.owner.toLowerCase().includes(searchLower) ||
                nft.tokenId.toString().includes(searchQuery)
            );
            filteredAllNFTs = filteredAllNFTs.filter(nft => 
                nft.name.toLowerCase().includes(searchLower) ||
                nft.owner.toLowerCase().includes(searchLower) ||
                nft.tokenId.toString().includes(searchQuery)
            );
        }

        // Filtern basierend auf ausgewählten Attributen
        if (Object.keys(filters.attributes).length > 0) {
            const filterByAttributes = (nfts) => {
                return nfts.filter(nft => {
                    if (!nft.attributes) return false;
                    return Object.keys(filters.attributes).every(traitType => {
                        const selectedValues = filters.attributes[traitType];
                        if (selectedValues.length === 0) return true;
                        const nftAttribute = nft.attributes.find(attr => attr.trait_type === traitType);
                        if (!nftAttribute) return false;
                        return selectedValues.includes(nftAttribute.value);
                    });
                });
            };
            filteredNFTsForSale = filterByAttributes(filteredNFTsForSale);
            filteredAllNFTs = filterByAttributes(filteredAllNFTs);
        }

        if (filters.currency && filters.currency.length > 0) {
            filteredNFTsForSale = filteredNFTsForSale.filter((nft) => {
              if (!nft.paymentToken) return false;
        
              const tokenAddressToName = {
                '0x0000000000000000000000000000000000000000': 'IOTA',
                '0x6852f7b4ba44667f2db80e6f3a9f8a173b03cd15': 'BEAST', // Replace with your BEAST token address
              };
        
              const currencyName =
                tokenAddressToName[nft.paymentToken.toLowerCase()] || 'UNKNOWN';
              return filters.currency.includes(currencyName);
            });
          }

        // Verfügbarkeit filtern
        if (filters.availability.includes('LISTED')) {
            filteredAllNFTs = [];
        }
        if (filters.availability.includes('NOT FOR SALE')) {
            filteredNFTsForSale = [];
        }
        if (filters.availability.includes('MY NFTS')) {
            const accountLower = account.toLowerCase();
            filteredNFTsForSale = filteredNFTsForSale.filter(nft => nft.owner.toLowerCase() === accountLower);
            filteredAllNFTs = filteredAllNFTs.filter(nft => nft.owner.toLowerCase() === accountLower);
        }

        // Jetzt, sortiere nftsForSale
        if (sortByPrice === 'LOW TO HIGH') {
            filteredNFTsForSale.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            // Wenn nach Preis sortiert wird, zeigen wir nur die NFTs zum Verkauf an
            return filteredNFTsForSale;
        } else if (sortByPrice === 'HIGH TO LOW') {
            filteredNFTsForSale.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            // Wenn nach Preis sortiert wird, zeigen wir nur die NFTs zum Verkauf an
            return filteredNFTsForSale;
        }

        // Kombiniere die beiden Arrays, wobei nftsForSale zuerst angezeigt werden
        return [...filteredNFTsForSale, ...filteredAllNFTs];
    };

    const displayedNFTs = getFilteredNFTs(nftsForSale, allNFTs, searchQuery, filters.price[0]);

    // Berechne die Gesamtseitenzahl dynamisch
    const isFilterApplied = filters.price.length > 0 || filters.availability.length > 0 || Object.keys(filters.attributes).length > 0 || searchQuery;

        const totalPages = isFilterApplied
        ? Math.ceil(displayedNFTs.length / resultsPerPage)
        : Math.ceil(maxSupply / resultsPerPage);


    // NFTs für die aktuelle Seite
    const getCurrentNFTs = () => {
        const startIndex = (currentPage - 1) * resultsPerPage;
        return displayedNFTs.slice(startIndex, startIndex + resultsPerPage);
    };

    // Debugging: Überprüfen auf Duplikate
    useEffect(() => {
        const combinedNFTs = [...nftsForSale, ...allNFTs];
        const seen = new Set();
        const duplicates = combinedNFTs.filter(nft => {
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
            console.log('No duplicates found in allNFTs.');
        }
    }, [nftsForSale, allNFTs]);

    // Berechnung des Ladefortschritts
    const progressPercentage = totalBatches > 0 ? (loadedBatches / totalBatches) * 100 : 0;

    // Zusätzlicher useEffect zum Abrufen der Likes und des Like-Status
    useEffect(() => {
        const fetchLikes = async () => {
            if (!collectionaddress || !account) return;
            const likesCount = await getCollectionLikes(collectionaddress);
            setLikes(likesCount);

            const userHasLiked = await hasUserLikedCollection(account, collectionaddress);
            setHasLiked(userHasLiked);
        };

        fetchLikes();
    }, [collectionaddress, account]);

    const handleLikeToggle = async () => {
        if (!collectionaddress || !account) {
            alert("Bitte verbinden Sie Ihr Wallet, um Likes zu verwenden.");
            return;
        }

        setLikeLoading(true);
        let success;

        if (hasLiked) {
            success = await unlikeCollection(collectionaddress);
        } else {
            success = await likeCollection(collectionaddress);
        }

        if (success) {
            // Aktualisieren der Likes
            const updatedLikes = hasLiked ? likes - 1 : likes + 1;
            setLikes(updatedLikes);
            setHasLiked(!hasLiked);
        } else {
            alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
        }

        setLikeLoading(false);
    };

    return (
        <div className="collection-nfts">
            <div 
                className='CollectionBanner'
                style={{ backgroundImage: `url(${bannerImage})` }}
            >
                {/* Banner-Informationen können hier eingefügt werden */}
            </div>

            <div className="nft-list">
                <div className='w100 flex space-between CollectionDetail-mediaDiv mt20'>
                    <div className='w20 Coll-FilterDiv ButtonandFilterMedia'>
                        {/* Übergabe von totalNFTsCount */}
                        <CollectionDetailFilter onFilterChange={setFilters} allAttributes={allAttributes} totalNFTsCount={nftsForSale.length + allNFTs.length} />
                    </div>
                    <div className='w100 flex column flex-start ml20 ml0-media'>
                        
                        {/* Header mit Collection Name und Like-Button */}
                        <div className='w95 flex center-ho space-between items-center'>
                            <h2 className='mt15 OnlyDesktop mb15'>{collectionName}</h2>
                            <div className='flex center-ho'>
                                <h3 className='mr5'>Leave a Like</h3>
                                <button 
                                    className="like-button centered" 
                                    onClick={handleLikeToggle}
                                    disabled={likeLoading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                    aria-label={hasLiked ? "Unlike Collection" : "Like Collection"}
                                >
                                    {likeLoading ? (
                                        <LoadingSpinner
                                            filled={false} 
                                            textColor="currentColor" 
                                            size={24} 
                                            className="img22"
                                        />
                                    ) : (
                                        hasLiked ? (
                                            <img 
                                                src="/heart-filled.png" 
                                                alt="Liked" 
                                                className="heart-icon"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        ) : (
                                            <HeartIcon 
                                                filled={false} 
                                                textColor="currentColor" 
                                                size={22} 
                                            />
                                        )
                                    )}
                                </button>
                            </div>
                        </div>

                       
                        
                        <div className='w95 flex center-ho space-between'>
                            <p className='text-align-left opacity-70 mt0 w30'>{collectionDescription}</p>

                            <div className="collection-stats gap15">
                                <div className='collection-stats-div text-align-left center-ho'>
                                    <div className='flex column'>
                                        <p className='s16 grey'>VOLUME IOTA</p>
                                        <div className='flex center-ho'>
                                            <div className='bold ml5 mr5'>{nativeVolume !== null ? `${nativeVolume}` : '0'}</div>
                                            <CurrencyIotaIcon
                                                filled={false} 
                                                textColor="currentColor" 
                                                size={24} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className='collection-stats-div text-align-left center-ho'>
                                    <div className='flex column'>
                                        <p className='s16 grey'>VOLUME BEAST</p>
                                        <div className='flex center-ho'>
                                            <div className='bold ml5 mr5'>{specialTokenVolume !== null ? `${specialTokenVolume}` : '0'}</div>
                                            <CurrencyBeastIcon
                                                filled={false} 
                                                textColor="currentColor" 
                                                size={24} />
                                        </div>
                                    </div>
                                </div>

                                <div className='collection-stats-div text-align-left'>
                                    <p className='s16 grey'>TOTAL NFTS</p>
                                    <div className='bold ml5'>{maxSupply || '0'}</div>
                                </div>
                                <div className='collection-stats-div text-align-left'>
                                    <p className='s16 grey'>OWNERS</p>
                                    <div className='bold ml5'>{getUniqueOwners()}</div>
                                </div>

                                {/* Hinzufügen der Likes zur Statistik */}
                                <div className='collection-stats-div text-align-left'>
                                    <p className='s16 grey'>LIKES</p>
                                    <div className='flex center-ho'>
                                        <div className='bold ml5 mr5'>{likes}</div>
                                        <HeartIcon 
                                            filled={false} 
                                            textColor="currentColor" 
                                            size={18} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex space-between w95'>
                            <div className='SearchbarDesktop text-align-left w30 w100media'>
                                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                            </div>
                            <div className="custom-pagination">
                                <button 
                                    className="custom-pagination-btn previous-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                    disabled={currentPage === 1}
                                >
                                    &lt; 
                                </button>
                                <span className="custom-pagination-info">
                                    {currentPage} OF {totalPages}
                                </span>

                                <button 
                                    className="custom-pagination-btn next-btn custom-pagination-info-2 margin0"
                                    onClick={() => {
                                        if (currentPage < totalPages && currentPage + 1 > loadedBatches) {
                                            setLoading(true); // Setze den Ladezustand
                                        }
                                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                    }} 
                                    disabled={currentPage === totalPages || (currentPage + 1 > loadedBatches)}
                                >
                                    {currentPage < totalPages && currentPage + 1 > loadedBatches ? (
                                        <LoadingSpinner
                                            filled={false} 
                                            textColor="currentColor" 
                                            size={16} 
                                            className="loading-gif"
                                        />
                                    ) : (
                                        '>'
                                    )}
                                </button>

                            </div>
                        </div>

                        {/* Progress-Bar während des Ladens */}
                        { (loading || backgroundLoading) && (
                            <div className="progress-bar-container mb5">
                                <div 
                                    className="progress-bar" 
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        )}

                        {/* Hauptinhalt der NFT-Collection */}
                        <div className='NFT-Collection-Div gap10'>
                            {loading && loadedBatches === 0 ? (
                                <div className="loading-container flex centered mt150 mb150">
                                    <LoadingSpinner
                                        filled={false} 
                                        textColor="currentColor" 
                                        size={100} 
                                        className="loading-gif"
                                    />
                                </div>
                            ) : (
                                displayedNFTs.length === 0 ? (
                                    <div className="no-nfts-container flex centered column">
                                        <h2 className="no-nfts-message">No NFTs found...</h2>
                                        <img src="/no-nft.png" alt="no nft Icon" className="no-nfts-image" />
                                    </div>
                                ) : (
                                    getCurrentNFTs().map(nft => (
                                        <Link key={`${nft.contractAddress}-${nft.tokenId}`} to={`/collections/${collectionaddress}/${nft.tokenId}`} className="nft-card">
                                            <CollectionDetailCard nft={nft} account={account} currencyIcon={currencyIcon} userNames={userNames} />
                                        </Link>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollectionNFTs;

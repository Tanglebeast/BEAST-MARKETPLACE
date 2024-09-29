import React, { useState, useEffect } from 'react';  
import { useParams, Link } from 'react-router-dom';
import { fetchAllNFTs, initializeMarketplace, getNFTDetails, getUserName, getMaxSupply } from '../components/utils';
import SearchBar from '../components/SearchBar';
import { nftCollections } from '../NFTCollections';
import CollectionDetailCard from '../components/CollectionDetailCard';
import '../styles/CollectionDetail.css';
import CollectionDetailFilter from '../components/CollectionDetailFilter';

const CollectionNFTs = () => {
    const { collectionaddress } = useParams();
    const [account, setAccount] = useState(localStorage.getItem('account') || '');
    const [marketplace, setMarketplace] = useState(null);
    const [allNFTs, setAllNFTs] = useState([]);
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
    const [loadedBatches, setLoadedBatches] = useState(1); // Neuer Zustand für geladene Chargen
    const [totalBatches, setTotalBatches] = useState(1); // Neuer Zustand für Gesamtchargen
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [allAttributes, setAllAttributes] = useState({});

    const resultsPerPage = 30;

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
            setLoadedBatches(0); // Reset der geladenen Seiten
            setTotalBatches(1); // Reset der Gesamtchargen

            const supply = await getMaxSupply(collectionaddress);
            const totalSupply = Number(supply);
            const batches = Math.ceil(totalSupply / resultsPerPage);
            setTotalBatches(batches); // Setze die Gesamtanzahl der Chargen

            // Laden der ersten Charge
            const firstBatch = await fetchAllNFTs(collectionaddress, marketplace, 0, resultsPerPage);
            const detailedFirstBatch = await Promise.all(firstBatch.map(async (nft) => {
                const details = await getNFTDetails(nft.contractAddress, nft.tokenId, marketplace);
                return { ...nft, ...details };
            }));

            setAllNFTs(detailedFirstBatch);
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

                setAllNFTs(prevNFTs => {
                    const combinedNFTs = [...prevNFTs, ...detailedNFTs];
                    const uniqueNFTs = combinedNFTs.filter((nft, index, self) =>
                        index === self.findIndex((t) => (
                            t.tokenId === nft.tokenId && t.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase()
                        ))
                    );
                    console.log(`Total NFTs after adding batch ${batch + 1}:`, uniqueNFTs.length);
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
        }
    }, [collectionaddress, marketplace]);

    // Sammeln aller Attribute aus den NFTs mit Zählung
    useEffect(() => {
        if (allNFTs.length > 0) {
            const attributes = {};
            allNFTs.forEach(nft => {
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
    }, [allNFTs]);

    const fetchUserNames = async () => {
        if (!marketplace) return;
        
        const owners = Array.from(new Set(allNFTs.map(nft => nft.owner.toLowerCase())));
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
    }, [marketplace, allNFTs]);

    // Setzt die aktuelle Seite zurück, wenn sich die Filter ändern
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchQuery]);

    const getUniqueOwners = (nfts) => {
        const owners = nfts.map(nft => nft.owner.toLowerCase());
        return new Set(owners).size;
    };

    const getFloorPrice = (nfts) => {
        const prices = nfts
            .filter(nft => nft.price && parseFloat(nft.price) > 0)
            .map(nft => parseFloat(nft.price));
        return prices.length > 0 ? Math.min(...prices) : '0';
    };

    const sortNFTs = (nfts, sortByPrice) => {
        const sortedNFTs = [...nfts];
        
        if (sortByPrice === 'LOW TO HIGH') {
            return sortedNFTs.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'));
        }
        if (sortByPrice === 'HIGH TO LOW') {
            return sortedNFTs.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'));
        }
        return sortedNFTs;
    };

    const filterNFTsByAvailability = (nfts) => {
        let filteredNFTs = [...nfts];

        if (filters.availability.includes('LISTED')) {
            filteredNFTs = filteredNFTs.filter(nft => nft.price && parseFloat(nft.price) > 0);
        }
        if (filters.availability.includes('NOT FOR SALE')) {
            filteredNFTs = filteredNFTs.filter(nft => !nft.price || parseFloat(nft.price) <= 0);
        }
        if (filters.availability.includes('MY NFTS')) {
            filteredNFTs = filteredNFTs.filter(nft => nft.owner.toLowerCase() === account.toLowerCase());
        }

        return filteredNFTs;
    };

    const getFilteredNFTs = (nfts, searchQuery, sortByPrice) => {
        let filteredNFTs = [...nfts];

        if (searchQuery) {
            filteredNFTs = filteredNFTs.filter(nft => 
                nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                nft.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                nft.tokenId.toString().includes(searchQuery)
            );
        }

        filteredNFTs = filterNFTsByAvailability(filteredNFTs);
        filteredNFTs = sortNFTs(filteredNFTs, sortByPrice);

        // Filtern basierend auf ausgewählten Attributen
        if (Object.keys(filters.attributes).length > 0) {
            filteredNFTs = filteredNFTs.filter(nft => {
                if (!nft.attributes) return false;
                return Object.keys(filters.attributes).every(traitType => {
                    const selectedValues = filters.attributes[traitType];
                    if (selectedValues.length === 0) return true;
                    const nftAttribute = nft.attributes.find(attr => attr.trait_type === traitType);
                    if (!nftAttribute) return false;
                    return selectedValues.includes(nftAttribute.value);
                });
            });
        }

        return filteredNFTs;
    };

    const displayedNFTs = getFilteredNFTs(allNFTs, searchQuery, filters.price[0]);

    // Berechne die Gesamtseitenzahl dynamisch
    const totalPages = filters.price.length > 0 || filters.availability.length > 0 || Object.keys(filters.attributes).length > 0 || searchQuery
        ? Math.ceil(displayedNFTs.length / resultsPerPage)
        : Math.ceil(maxSupply / resultsPerPage);

    // NFTs für die aktuelle Seite
    const getCurrentNFTs = () => {
        const startIndex = (currentPage - 1) * resultsPerPage;
        return displayedNFTs.slice(startIndex, startIndex + resultsPerPage);
    };

    // Debugging: Überprüfen auf Duplikate
    useEffect(() => {
        const seen = new Set();
        const duplicates = allNFTs.filter(nft => {
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
    }, [allNFTs]);

    // Berechnung des Ladefortschritts
    const progressPercentage = totalBatches > 0 ? (loadedBatches / totalBatches) * 100 : 0;

    return (
    <div className="collection-nfts">
        <div 
            className='CollectionBanner'
            style={{ backgroundImage: `url(${bannerImage})` }}
        >
            {/* Banner-Informationen können hier eingefügt werden */}
        </div>

        <div className="nft-list">
            <div className='SearchandFilterDiv'>
                {/* Weitere Komponenten können hier eingefügt werden */}
            </div>
            <div className='w100 flex space-between CollectionDetail-mediaDiv'>
                <div className='w20 Coll-FilterDiv ButtonandFilterMedia'>
                    {/* Übergabe von totalNFTsCount */}
                    <CollectionDetailFilter onFilterChange={setFilters} allAttributes={allAttributes} totalNFTsCount={allNFTs.length} />
                </div>
                <div className='w100 flex column flex-start ml20 ml0-media'>
                    
                    <h2 className='mt15 OnlyDesktop mb15'>{collectionName}</h2>
                    
                    <div className='w95 flex center-ho space-between'>
                        <p className='text-align-left grey mt0 w30'>{collectionDescription}</p>
                        <div className="collection-stats gap15">
                            <div className='collection-stats-div text-align-left'>
                                <p className='s16 grey'>TOTAL NFTS</p>
                                <div className='bold ml5'>{maxSupply}</div>
                            </div>
                            <div className='collection-stats-div text-align-left'>
                                <p className='s16 grey'>OWNERS</p>
                                <div className='bold ml5'>{getUniqueOwners(allNFTs)}</div>
                            </div>
                            {/* Weitere Statistiken können hier hinzugefügt werden */}
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
                                    <img src="/basic-loading.gif" alt="Loading..." className="loading-gif" />
                                ) : (
                                    '>'
                                )}
                            </button>

                        </div>
                    </div>

                    {/* Progress-Bar während des Ladens */}
                    { (loading || backgroundLoading) && (
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar" 
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    )}

                    {/* Hauptinhalt der NFT-Collection */}
                    <div className='NFT-Collection-Div'>
                        {loading && loadedBatches === 0 ? (
                            <div className="loading-container flex centered">
                                <img src="/loading.gif" alt="Loading..." />
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

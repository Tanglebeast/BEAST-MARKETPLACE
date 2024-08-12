import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import { fetchAllNFTs, initializeMarketplace, refreshData, getNFTDetails, getUserName, checkNetwork, getMaxSupply } from '../components/utils';
import SearchBar from '../components/SearchBar';
import { nftCollections } from '../NFTCollections';
import CollectionDetailCard from '../components/CollectionDetailCard';
import ArtworkGrid from '../components/CollectionDetailGrid';
import '../styles/CollectionDetail.css';
import CollectionDetailFilter from '../components/CollectionDetailFilter';

const CollectionNFTs = () => {
    const { collectionaddress } = useParams();
    const [account, setAccount] = useState(localStorage.getItem('account') || '');
    const [marketplace, setMarketplace] = useState(null);
    const [allNFTs, setAllNFTs] = useState([]);
    const [nftsForSale, setNftsForSale] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collectionName, setCollectionName] = useState('');
    const [collectionDescription, setCollectionDescription] = useState('');
    const [currencyIcon, setCurrencyIcon] = useState('');
    const [bannerImage, setBannerImage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [wallMode, setWallMode] = useState(false);
    const [imageSizes, setImageSizes] = useState([]);
    const [filters, setFilters] = useState({ price: [], availability: [] });
    const [userNames, setUserNames] = useState({});
    const [areFiltersActive, setAreFiltersActive] = useState(false);
    const [maxSupply, setMaxSupply] = useState(null);



    useEffect(() => {
        {
            initializeMarketplace(setMarketplace, async (marketplace) => await refreshData(marketplace, collectionaddress, setNftsForSale, setAllNFTs, fetchAllNFTs));
        }
    }, [collectionaddress]);

    useEffect(() => {
        const fetchNFTs = async () => {
            const nfts = await fetchAllNFTs(collectionaddress);
            setAllNFTs(nfts);
            setLoading(false);

            const supply = await getMaxSupply(collectionaddress);
            setMaxSupply(Number(supply));

            const sizes = await Promise.all(nfts.map(async (nft) => {
                const img = new Image();
                img.src = nft.image;
                await img.decode();
                return { tokenId: nft.tokenId, width: img.width, height: img.height };
            }));
            setImageSizes(sizes);
        };

        if (collectionaddress) {
            fetchNFTs();
            const collection = nftCollections.find(col => col.address.toLowerCase() === collectionaddress.toLowerCase());
            if (collection) {
                setCollectionName(collection.name);
                setCollectionDescription(collection.description);
                setCurrencyIcon(collection.currency);
                setBannerImage(collection.Collectionbanner);
            }
        }
    }, [collectionaddress]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (marketplace) {
                const updatedNftsForSale = await Promise.all(nftsForSale.map(async (nft) => {
                    const details = await getNFTDetails(nft.contractAddress, nft.tokenId, marketplace);
                    return { ...nft, ...details };
                }));
                setNftsForSale(updatedNftsForSale);
            }
        };

        fetchDetails();
    }, [marketplace, nftsForSale]);

    const fetchUserNames = async () => {
        if (!marketplace) return;
        
        const owners = Array.from(new Set(allNFTs.map(nft => nft.owner.toLowerCase())));
        const names = {};
        
        for (const owner of owners) {
            try {
                const name = await getUserName(owner, marketplace);
                names[owner] = name || owner; // Falls kein Name vorhanden ist, benutze die Adresse
            } catch (error) {
                names[owner] = owner; // Falls ein Fehler auftritt, benutze die Adresse
            }
        }
        
        setUserNames(names);
    };
    
    useEffect(() => {
        fetchUserNames();
    }, [marketplace, allNFTs]);

    const getUniqueOwners = (nfts) => {
        const owners = nfts.map(nft => nft.owner.toLowerCase());
        return new Set(owners).size;
    };

    const getFloorPrice = (nfts) => {
        const prices = nfts.map(nft => parseFloat(nft.price)).filter(price => !isNaN(price));
        return prices.length > 0 ? Math.min(...prices) : '0';
    };

    const getGridDimensions = (nfts) => {
        let maxRow = 0;
        let maxCol = 0;
    
        nfts.forEach(nft => {
            if (!nft.position) return; // Skip if position is undefined or null
    
            const [letter, number] = nft.position.split('-');
            if (!number || !letter) return; // Skip if position does not have the expected format
    
            const row = parseInt(number);
            const col = letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    
            if (row > maxRow) maxRow = row;
            if (col > maxCol) maxCol = col;
        });
    
        return { rows: maxRow, cols: maxCol };
    };
    
    

    const sortNFTsByPosition = (nfts) => {
        return nfts.sort((a, b) => {
            const [aLetter, aNumber] = a.position.split('-');
            const [bLetter, bNumber] = b.position.split('-');
    
            const aRow = parseInt(aNumber);
            const aCol = aLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
            const bRow = parseInt(bNumber);
            const bCol = bLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
            if (aRow === bRow) {
                return aCol - bCol;
            } else {
                return bRow - aRow; // Reverse the sort order for vertical (row) direction
            }
        });
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

        return filteredNFTs;
    };

    const filteredNFTsForSale = getFilteredNFTs(nftsForSale, searchQuery, filters.price[0]);
    const filteredAllNFTs = getFilteredNFTs(allNFTs, searchQuery, filters.price[0]);
    const { rows, cols } = getGridDimensions(filteredAllNFTs);

    // Sort NFTs based on their positions
    // Sort NFTs based on their positions
const sortedNFTs = sortNFTsByPosition(filteredAllNFTs.map(nft => {
    const saleInfo = filteredNFTsForSale.find(sale => sale.tokenId === nft.tokenId && sale.contractAddress === nft.contractAddress);
    return {
        ...nft,
        price: saleInfo ? saleInfo.price : '0'
    };
}));


    // Determine grid dimensions
    const gridWidth = 1200;
    const gridHeight = 900;
    const gridRatio = gridWidth / gridHeight;
    const actualRatio = cols / rows;

    const adjustedWidth = actualRatio > gridRatio ? gridWidth : gridWidth * (actualRatio / gridRatio);
    const adjustedHeight = actualRatio > gridRatio ? gridHeight / (actualRatio / gridRatio) : gridHeight;

    return (
        <div className="collection-nfts">
            <div 
                className='CollectionBanner'
                style={{ backgroundImage: `url(${bannerImage})` }}
            >
                <div className='absolute centered column bannerInfo'>
                    <h2>{collectionName}</h2>
                    <p className='CollectionDescription'>{collectionDescription}</p>
                    <div className="collection-stats">
                        <div className='collection-stats-div'>
                            <p>FRACTALZ</p>
                            {maxSupply}
                        </div>
                        <div className='splitter'></div>
                        <div className='collection-stats-div'>
                            <p>OWNERS</p>
                            <div>{getUniqueOwners(allNFTs)}</div>
                        </div>
                        <div className='splitter'></div>
                        <div className='collection-stats-div'>
                            <p>FLOOR PRICE</p>
                            <div className='floorpricediv'>
                                <img src={currencyIcon} alt="Currency Icon" className="currency-icon" />{getFloorPrice(nftsForSale)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="nft-list">
                {loading ? (
                    <div className="loading-container">
                        <img src="/loading.gif" alt="Loading..." />
                    </div>
                ) : (
                    <>
                        <div className='SearchandFilterDiv'>
                            <label className='WallMode-toggle flex'>
                                <span className='mr15 MapModeText'>MAPMODE</span>
                                <Toggle
                                    checked={wallMode}
                                    onChange={() => {
                                        if (!areFiltersActive) {
                                            setWallMode(!wallMode);
                                        }
                                    }}
                                    icons={false}
                                    disabled={areFiltersActive} // Disable toggle if filters are active
                                />
                                <span className='WallMode-label'></span>
                            </label>
                        </div>
                        {wallMode ? (
                            <div className='w100 centered column'>
                                <div className='centered gap5'>
                                    <div className='blue-dot'></div><p className='mr15'>FOR SALE</p>
                                    <div className='green-dot'></div><p>YOUR NFT</p>
                                </div>
                                
                                <ArtworkGrid
                                    cols={cols}
                                    rows={rows}
                                    width={adjustedWidth}
                                    height={adjustedHeight}
                                    images={sortedNFTs.map(nft => ({
                                        src: nft.image,
                                        name: nft.name,
                                        tokenid: nft.tokenId,
                                        owner: nft.owner,
                                        preis: nft.price || '0',
                                        width: imageSizes.find(size => size.tokenId === nft.tokenId)?.width || 100,
                                        height: imageSizes.find(size => size.tokenId === nft.tokenId)?.height || 100
                                    }))}
                                    collectionaddress={collectionaddress}
                                    currencyIcon={currencyIcon}
                                    userAddress={account}
                                />
                            </div>
                        ) : (
                            <div className='w100 flex space-between'>
                                <div className='w20'>
                                    <CollectionDetailFilter onFilterChange={setFilters} />
                                </div>
                                <div className='w100 flex column flex-start ml20'>
                                    <h2 className='mt15'>{collectionName}</h2>
                                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                                    <div className='NFT-Collection-Div'>
                                        {filteredNFTsForSale.length === 0 && filteredAllNFTs.length === 0 ? (
                                            <div className="no-nfts-container flex centered column">
                                            <h2 className="no-nfts-message">No NFTs found...</h2>
                                            <img src="/no-nft.png" alt="no nft Icon" className="no-nfts-image" />
                                        </div>
                                        ) : (
                                            <>
                                                {filteredNFTsForSale.map(nft => (
                                                    <Link key={nft.tokenId} to={`/collections/${collectionaddress}/${nft.tokenId}`} className="nft-card">
                                                        <CollectionDetailCard nft={nft} account={account} currencyIcon={currencyIcon} userNames={userNames} />
                                                    </Link>
                                                ))}
                                                {filteredAllNFTs.filter(nft => !filteredNFTsForSale.some(forSale => forSale.tokenId === nft.tokenId && forSale.contractAddress === nft.contractAddress)).map(nft => (
                                                    <Link key={nft.tokenId} to={`/collections/${collectionaddress}/${nft.tokenId}`} className="nft-card">
                                                        <CollectionDetailCard nft={nft} account={account} currencyIcon={currencyIcon} userNames={userNames} />
                                                    </Link>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CollectionNFTs;

// CollectionDetailCard.jsx
import React, { useState } from 'react';
import ShortenAddress from './ShortenAddress';
import BeastToIotaPrice from './BeastToIotaPrice';
import '../styles/CollectionDetailCard.css';
import CurrencyBeastIcon from '../Assets/currency-beast';
import CurrencyIotaIcon from '../Assets/currency-iota';
import LoadingSpinner from '../Assets/loading-spinner';

const CollectionDetailCard = ({ nft, account, currencyIcon, userNames }) => {
    const ownerAddress = nft.owner.toLowerCase();
    const ownerName = userNames[ownerAddress] || nft.owner;

    const isEthereumAddress = ownerName.startsWith('0x');
    const ownerDisplay = isEthereumAddress ? <ShortenAddress address={ownerName} /> : ownerName;

    const isNativeCurrencyListed = nft.paymentToken === '0x0000000000000000000000000000000000000000'; // Überprüft, ob die native Währung verwendet wird

    const [convertedPrice, setConvertedPrice] = useState(null);

    // Zustände für Bildmanagement
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div className="collection-detail-card">
            <div className="nft-image-container">
                {/* Platzhalter anzeigen, solange das Bild nicht geladen ist und kein Fehler aufgetreten ist */}
                {!imageLoaded && !imageError && (
                    <img src="/image-loading.jpg" alt="Loading..." className="placeholder-image-loading-gif" />
                )}
                {/* Tatsächliches Bild anzeigen oder Fehlerbild bei einem Fehler */}
                <img
                    src={nft.image}
                    alt={nft.name}
                    className={`nft-image ${imageLoaded ? 'visible' : 'hidden'}`}
                    onLoad={() => {
                        // console.log("Image loaded:", nft.image);
                        setImageLoaded(true);
                    }}
                    onError={() => {
                        // console.log("Image failed to load:", nft.image);
                        setImageError(true);
                    }}
                    style={{ display: imageLoaded || imageError ? 'block' : 'none' }}
                />
                {/* Fehlerbild anzeigen, falls ein Fehler auftritt */}
                {imageError && (
                    <img src="/image-loading.jpg" alt="No Image Available" className="nft-image visible" />
                )}
                {parseFloat(nft.price) !== 0 && (
                    <div className="forsalebadge">Listed</div>
                )}
            </div>
            <div className="card-details">
                <h3>{nft.name}</h3>
                <div className="owner-note">
                    <h3>{ownerDisplay}</h3>
                </div>

                <div className="price-container center-ho mt15 space-between">
                    {parseFloat(nft.price) !== 0 ? (
                        <>
                            <div className='center-ho' style={{ color: 'var(--text-color)' }}>
                                {isNativeCurrencyListed ? (
                                    <CurrencyIotaIcon
                                    filled={false} 
                                    textColor="currentColor" 
                                    size={24} 
                                    className="currency-icon"
                                    />
                                ) : (
                                    <CurrencyBeastIcon 
                                    filled={false} 
                                    textColor="currentColor" 
                                    size={24} 
                                    className="currency-icon"
                                    />
                                )}
                                <span className='bold ml5'>{nft.price}</span>
                                </div>

                            
                            {/* Konvertierten Preis nur anzeigen, wenn die native Währung NICHT verwendet wird */}
                            {!isNativeCurrencyListed && (
                                <>
                                    <BeastToIotaPrice 
                                        listingPrice={parseFloat(nft.price)} 
                                        onConversion={setConvertedPrice} 
                                    />
                                    {convertedPrice && (
                                        <span className='converted-price grey s16'> ( ≈{convertedPrice} IOTA )</span>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <span>Not Listed</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionDetailCard;

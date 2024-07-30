import React from 'react';
import ShortenAddress from './ShortenAddress';
import '../styles/CollectionDetailCard.css';

const CollectionDetailCard = ({ nft, account, currencyIcon, userNames }) => {
    // Bestimme den Anzeigenamen des Besitzers
    const ownerAddress = nft.owner.toLowerCase();
    const ownerName = userNames[ownerAddress] || nft.owner;

    // Überprüfen, ob es sich um eine Ethereum-Adresse handelt und ggf. kürzen
    const isEthereumAddress = ownerName.startsWith('0x');
    const ownerDisplay = isEthereumAddress ? <ShortenAddress address={ownerName} /> : ownerName;

    return (
        <div className="collection-detail-card">
            <div className="nft-image-container">
                <img src={nft.image} alt={nft.name} className="nft-image" />
                {parseFloat(nft.price) !== 0 && (
                    <div className="forsalebadge">Listed</div>
                )}
            </div>
            <div className="card-details">
                <h3>{nft.name}</h3>
                <p className="owner-note">{ownerDisplay}</p>
                <div className='flex center-ho'>
                    <img className='w25 mr10' src='/id.png' alt='ID Icon' />
                    <p><ShortenAddress address={nft.tokenId.toString()} /></p>
                </div>
                {parseFloat(nft.price) !== 0 ? (
                    <div className="floorpricedivcard">
                        <img src={currencyIcon} alt="Currency Icon" className="currency-icon" />
                        {parseFloat(nft.price)}
                    </div>
                ) : (
                    <p className='not-listed'>Not listed</p>
                )}
            </div>
        </div>
    );
};

export default CollectionDetailCard;
